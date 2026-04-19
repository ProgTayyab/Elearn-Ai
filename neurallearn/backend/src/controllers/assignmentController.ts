import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function ensureAssignment(moduleId: number) {
    let assignment = await prisma.assignment.findFirst({ where: { moduleId } });
    if (!assignment) {
        const module = await prisma.module.findUnique({ where: { id: moduleId } });
        assignment = await prisma.assignment.create({
            data: {
                moduleId,
                title: `${module?.title ?? 'Module'} — Coding Assignment`,
                description: `Apply the concepts from this module in a hands-on coding challenge.`,
                difficulty: 'Intermediate',
                language: 'Python',
                status: 'pending',
            },
        });
    }
    return assignment;
}

// ── Get assignment for a module ─────────────────────────────────────────
export const getAssignment = async (req: Request, res: Response) => {
    try {
        const moduleId = parseInt(req.params.moduleId, 10);
        const assignment = await ensureAssignment(moduleId);
        res.json({ assignment });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ── Submit (mark as submitted) ──────────────────────────────────────────
export const submitAssignment = async (req: Request, res: Response) => {
    try {
        const assignmentId = parseInt(req.params.id, 10);

        const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        const updated = await prisma.assignment.update({
            where: { id: assignmentId },
            data: { status: 'submitted' },
        });

        res.json({ assignment: updated });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
