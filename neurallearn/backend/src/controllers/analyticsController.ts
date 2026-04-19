import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8001';

type MLPrediction = {
    riskLevel: string;
};

const fallbackRiskLevel = (progress: number, avgScore: number, studyMinutes: number, streak: number): string => {
    const score =
        (1 - progress) * 0.45 +
        ((100 - avgScore) / 100) * 0.35 +
        (1 / (1 + studyMinutes / 300)) * 0.12 +
        (1 / (1 + streak)) * 0.08;

    if (score >= 0.67) return 'High';
    if (score >= 0.4) return 'Medium';
    return 'Low';
};

const predictRisk = async (progress: number, avgScore: number, studyMinutes: number, streak: number): Promise<string> => {
    try {
        const response = await fetch(`${ML_SERVICE_URL}/predict/risk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                progress,
                avgScore,
                studyMinutes,
                streak,
            }),
        });

        if (!response.ok) {
            throw new Error(`ML service responded with ${response.status}`);
        }

        const data = (await response.json()) as MLPrediction;
        return data.riskLevel || fallbackRiskLevel(progress, avgScore, studyMinutes, streak);
    } catch {
        return fallbackRiskLevel(progress, avgScore, studyMinutes, streak);
    }
};

export const getAnalytics = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { streak: true, totalStudyMinutes: true },
        });

        const courses = await prisma.course.findMany({
            where: { userId },
            include: { modules: true },
        });

        // Build per-course progress
        const courseStats = courses.map((c) => {
            const total = c.modules.length;
            const done = c.modules.filter((m) => m.status === 'done').length;
            const progress = total > 0 ? Math.round((done / total) * 100) : 0;
            return { id: c.id, title: c.title, progress };
        });

        // Quiz attempts
        const attempts = await prisma.quizAttempt.findMany({
            where: { userId },
            orderBy: { id: 'desc' },
            take: 20,
        });

        const avgScore =
            attempts.length > 0
                ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length)
                : 0;

        const userStreak = user?.streak ?? 0;
        const totalStudyMinutes = user?.totalStudyMinutes ?? 0;

        // Recompute and refresh risk predictions using ML service.
        const predictions = await Promise.all(
            courses.map(async (c) => {
                const total = c.modules.length;
                const done = c.modules.filter((m) => m.status === 'done').length;
                const progress = total > 0 ? done / total : 0;
                const riskLevel = await predictRisk(progress, avgScore, totalStudyMinutes, userStreak);
                return { courseId: c.id, riskLevel };
            })
        );

        await prisma.riskPrediction.deleteMany({ where: { userId } });
        if (predictions.length > 0) {
            await prisma.riskPrediction.createMany({
                data: predictions.map((p) => ({
                    userId,
                    courseId: p.courseId,
                    riskLevel: p.riskLevel,
                })),
            });
        }

        const risks = await prisma.riskPrediction.findMany({
            where: { userId },
            include: { course: { select: { title: true } } },
            orderBy: { predictedAt: 'desc' },
        });

        res.json({
            streak: userStreak,
            totalStudyMinutes,
            avgScore,
            courseCount: courses.length,
            courseStats,
            risks: risks.map((r) => ({
                id: r.id,
                courseId: r.courseId,
                courseTitle: r.course.title,
                riskLevel: r.riskLevel,
                predictedAt: r.predictedAt,
            })),
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
