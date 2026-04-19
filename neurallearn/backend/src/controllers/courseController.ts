import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── List user's courses ─────────────────────────────────────────────────
export const getCourses = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const courses = await prisma.course.findMany({
            where: { userId },
            include: {
                modules: { select: { id: true, status: true } },
            },
            orderBy: { id: 'desc' },
        });

        const result = courses.map((c) => {
            const total = c.modules.length;
            const done = c.modules.filter((m) => m.status === 'done').length;
            const progress = total > 0 ? Math.round((done / total) * 100) : 0;
            return { ...c, progress };
        });

        res.json({ courses: result });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ── Single course with modules ──────────────────────────────────────────
export const getCourse = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const courseId = parseInt(req.params.id, 10);

        const course = await prisma.course.findFirst({
            where: { id: courseId, userId },
            include: {
                modules: {
                    orderBy: { order: 'asc' },
                    include: { objectives: true, resources: true },
                },
            },
        });

        if (!course) return res.status(404).json({ message: 'Course not found' });

        const total = course.modules.length;
        const done = course.modules.filter((m) => m.status === 'done').length;
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;

        res.json({ course: { ...course, progress } });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ── Create course (with placeholder modules) ────────────────────────────
export const createCourse = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const { topic, difficulty, durationWeeks } = req.body;

        if (!topic || !difficulty || !durationWeeks) {
            return res.status(400).json({ message: 'topic, difficulty, and durationWeeks are required' });
        }

        const weeks = parseInt(durationWeeks, 10);

        const course = await prisma.course.create({
            data: {
                userId,
                title: `${topic} — ${difficulty}`,
                topic,
                difficulty,
                durationWeeks: weeks,
                status: 'active',
                modules: {
                    create: Array.from({ length: weeks }, (_, i) => ({
                        weekNumber: i + 1,
                        title: `Week ${i + 1}`,
                        description: `Module ${i + 1} content for ${topic}`,
                        status: i === 0 ? 'active' : 'locked',
                        order: i + 1,
                        objectives: {
                            create: [
                                { text: `Understand ${topic} fundamentals (Week ${i + 1})` },
                                { text: `Apply key concepts in practice` },
                            ],
                        },
                        resources: {
                            create: [
                                {
                                    type: 'article',
                                    title: `${topic} — Week ${i + 1} Reading`,
                                    url: '',
                                    source: 'NeuralLearn',
                                    readTime: 15,
                                },
                            ],
                        },
                    })),
                },
            },
            include: { modules: true },
        });

        res.status(201).json({ course });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ── Delete course ───────────────────────────────────────────────────────
export const deleteCourse = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const courseId = parseInt(req.params.id, 10);

        const course = await prisma.course.findFirst({ where: { id: courseId, userId } });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        await prisma.course.delete({ where: { id: courseId } });
        res.json({ message: 'Course deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
