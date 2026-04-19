import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Seed placeholder questions if none exist
async function ensureQuiz(moduleId: number): Promise<number> {
    let quiz = await prisma.quiz.findFirst({ where: { moduleId } });

    if (!quiz) {
        quiz = await prisma.quiz.create({
            data: {
                moduleId,
                questions: {
                    create: [
                        {
                            text: 'What is the output of print(type([]))?',
                            type: 'mcq',
                            order: 1,
                            options: {
                                create: [
                                    { text: "<class 'list'>", isCorrect: true },
                                    { text: "<class 'array'>", isCorrect: false },
                                    { text: 'list', isCorrect: false },
                                    { text: 'undefined', isCorrect: false },
                                ],
                            },
                        },
                        {
                            text: 'Which method adds an item to the end of a list?',
                            type: 'mcq',
                            order: 2,
                            options: {
                                create: [
                                    { text: 'add()', isCorrect: false },
                                    { text: 'push()', isCorrect: false },
                                    { text: 'append()', isCorrect: true },
                                    { text: 'insert()', isCorrect: false },
                                ],
                            },
                        },
                        {
                            text: 'What does len("hello") return?',
                            type: 'mcq',
                            order: 3,
                            options: {
                                create: [
                                    { text: '4', isCorrect: false },
                                    { text: '5', isCorrect: true },
                                    { text: '6', isCorrect: false },
                                    { text: 'None', isCorrect: false },
                                ],
                            },
                        },
                    ],
                },
            },
        });
    }

    return quiz.id;
}

// ── Get quiz for a module ───────────────────────────────────────────────
export const getQuiz = async (req: Request, res: Response) => {
    try {
        const moduleId = parseInt(req.params.moduleId, 10);
        await ensureQuiz(moduleId);

        const quiz = await prisma.quiz.findFirst({
            where: { moduleId },
            include: {
                questions: {
                    orderBy: { order: 'asc' },
                    include: { options: { select: { id: true, text: true, isCorrect: false } } },
                },
            },
        });

        res.json({ quiz });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ── Submit a quiz attempt ───────────────────────────────────────────────
export const submitAttempt = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const quizId = parseInt(req.params.quizId, 10);
        const { answers, timeTaken } = req.body;
        // answers: { [questionId]: selectedOptionId }

        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: { questions: { include: { options: true } } },
        });

        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        let correct = 0;
        for (const question of quiz.questions) {
            const selectedId = answers[question.id];
            const correctOption = question.options.find((o) => o.isCorrect);
            if (correctOption && correctOption.id === selectedId) correct++;
        }

        const score = (correct / quiz.questions.length) * 100;

        const attempt = await prisma.quizAttempt.create({
            data: {
                userId,
                quizId,
                score,
                timeTaken: timeTaken ?? 0,
                answers,
            },
        });

        res.json({ attempt, score, correct, total: quiz.questions.length });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
