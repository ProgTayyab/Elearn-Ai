import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

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

        res.json({ message: 'Module completed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
