import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { recordStudyActivity } from '../utils/userStats';
import { buildFallbackModuleSummary } from '../utils/moduleSummary';
import { generateModuleSummaryDocument } from '../services/geminiService';

const prisma = new PrismaClient();

// ── Get modules for a course ────────────────────────────────────────────
export const getModules = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const courseId = parseInt(req.params.courseId, 10);

        // Verify ownership
        const course = await prisma.course.findFirst({ where: { id: courseId, userId } });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const modules = await prisma.module.findMany({
            where: { courseId },
            orderBy: { order: 'asc' },
            include: { objectives: true, resources: true },
        });

        res.json({ modules });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ── Get single module with all content ─────────────────────────────────
export const getModule = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const moduleId = parseInt(req.params.id, 10);

        const module = await prisma.module.findUnique({
            where: { id: moduleId },
            include: {
                objectives: true,
                resources: true,
                assignments: true,
                quizzes: {
                    include: { questions: { include: { options: true } } },
                },
                course: { select: { userId: true } },
            },
        });

        if (!module || module.course.userId !== userId) {
            return res.status(404).json({ message: 'Module not found' });
        }

        res.json({ module });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ── Get or generate week summary document ───────────────────────────────
export const getModuleSummary = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const moduleId = parseInt(req.params.id, 10);
        const forceRegenerate = req.query.regenerate === 'true';

        const module = await prisma.module.findUnique({
            where: { id: moduleId },
            include: {
                objectives: true,
                resources: true,
                course: {
                    select: {
                        userId: true,
                        title: true,
                        topic: true,
                        difficulty: true,
                    },
                },
            },
        });

        if (!module || module.course.userId !== userId) {
            return res.status(404).json({ message: 'Module not found' });
        }

        if (module.summaryDocument && !forceRegenerate) {
            return res.json({
                summary: module.summaryDocument,
                weekNumber: module.weekNumber,
                moduleTitle: module.title,
                courseTitle: module.course.title,
                generatedAt: module.summaryGeneratedAt?.toISOString() ?? null,
                cached: true,
            });
        }

        const summaryInput = {
            courseTitle: module.course.title,
            courseTopic: module.course.topic,
            difficulty: module.course.difficulty,
            weekNumber: module.weekNumber,
            moduleTitle: module.title,
            description: module.description,
            objectives: module.objectives,
            resources: module.resources,
        };

        let summary: string;
        try {
            summary = await generateModuleSummaryDocument({
                courseTitle: summaryInput.courseTitle,
                courseTopic: summaryInput.courseTopic,
                difficulty: summaryInput.difficulty,
                weekNumber: summaryInput.weekNumber,
                moduleTitle: summaryInput.moduleTitle,
                description: summaryInput.description,
                objectives: module.objectives.map((o) => o.text),
                resources: module.resources.map((r) => ({
                    title: r.title,
                    type: r.type,
                    url: r.url,
                    readTime: r.readTime,
                })),
            });
        } catch {
            summary = buildFallbackModuleSummary(summaryInput);
        }

        const updated = await prisma.module.update({
            where: { id: moduleId },
            data: {
                summaryDocument: summary,
                summaryGeneratedAt: new Date(),
            },
        });

        res.json({
            summary,
            weekNumber: module.weekNumber,
            moduleTitle: module.title,
            courseTitle: module.course.title,
            generatedAt: updated.summaryGeneratedAt?.toISOString() ?? null,
            cached: false,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ── Mark module complete and unlock next ────────────────────────────────
export const completeModule = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const moduleId = parseInt(req.params.id, 10);

        const module = await prisma.module.findUnique({
            where: { id: moduleId },
            include: { course: { select: { userId: true, id: true } } },
        });

        if (!module || module.course.userId !== userId) {
            return res.status(404).json({ message: 'Module not found' });
        }

        // Mark current as done
        await prisma.module.update({ where: { id: moduleId }, data: { status: 'done' } });

        // Unlock next
        const nextModule = await prisma.module.findFirst({
            where: { courseId: module.courseId, order: module.order + 1 },
        });
        if (nextModule) {
            await prisma.module.update({ where: { id: nextModule.id }, data: { status: 'active' } });
        }

        await recordStudyActivity(userId, 20);

        res.json({ message: 'Module completed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
