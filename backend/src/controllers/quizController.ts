import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { assertModuleOwnership, assertQuizOwnership } from '../utils/courseAccess';
import { generateQuizForModule, handleGeminiError } from '../services/geminiService';
import { recordStudyActivity } from '../utils/userStats';

const prisma = new PrismaClient();

async function createFallbackQuiz(moduleId: number, topic: string) {
  return prisma.quiz.create({
    data: {
      moduleId,
      questions: {
        create: [
          {
            text: `What is a core concept in ${topic}?`,
            type: 'mcq',
            order: 1,
            options: {
              create: [
                { text: 'Fundamental principles', isCorrect: true },
                { text: 'Unrelated trivia', isCorrect: false },
                { text: 'Random noise', isCorrect: false },
                { text: 'None of the above', isCorrect: false },
              ],
            },
          },
          {
            text: `Best way to practice ${topic}?`,
            type: 'mcq',
            order: 2,
            options: {
              create: [
                { text: 'Hands-on projects', isCorrect: true },
                { text: 'Ignore exercises', isCorrect: false },
                { text: 'Skip reading', isCorrect: false },
                { text: 'Memorize only dates', isCorrect: false },
              ],
            },
          },
          {
            text: `Why review module summaries in ${topic}?`,
            type: 'mcq',
            order: 3,
            options: {
              create: [
                { text: 'Reinforces understanding', isCorrect: true },
                { text: 'Wastes time', isCorrect: false },
                { text: 'Replaces all practice', isCorrect: false },
                { text: 'Is never useful', isCorrect: false },
              ],
            },
          },
        ],
      },
    },
  });
}

async function ensureQuiz(moduleId: number, userId: number): Promise<void> {
  const existing = await prisma.quiz.findFirst({ where: { moduleId } });
  if (existing) return;

  const module = await assertModuleOwnership(userId, moduleId);
  if (!module) throw new Error('Module not found');

  try {
    const questions = await generateQuizForModule(
      module.course.topic,
      module.title,
      module.description,
      5
    );

    await prisma.quiz.create({
      data: {
        moduleId,
        questions: {
          create: questions.map((q, idx) => ({
            text: q.text.slice(0, 500),
            type: 'mcq',
            order: idx + 1,
            options: {
              create: (q.options?.length >= 2 ? q.options : []).slice(0, 4).map((o) => ({
                text: String(o.text).slice(0, 300),
                isCorrect: !!o.isCorrect,
              })),
            },
          })),
        },
      },
    });
  } catch {
    await createFallbackQuiz(moduleId, module.course.topic);
  }
}

export const getQuiz = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const moduleId = parseInt(req.params.moduleId, 10);

    const module = await assertModuleOwnership(userId, moduleId);
    if (!module) return res.status(404).json({ message: 'Module not found' });

    await ensureQuiz(moduleId, userId);

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
  } catch (error: unknown) {
    handleGeminiError(res, error);
  }
};

export const submitAttempt = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const quizId = parseInt(req.params.quizId, 10);
    const { answers, timeTaken } = req.body;

    const quiz = await assertQuizOwnership(userId, quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const fullQuiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: { include: { options: true } } },
    });

    if (!fullQuiz) return res.status(404).json({ message: 'Quiz not found' });

    let correct = 0;
    for (const question of fullQuiz.questions) {
      const selectedId = answers[question.id];
      const correctOption = question.options.find((o) => o.isCorrect);
      if (correctOption && correctOption.id === selectedId) correct++;
    }

    const score = fullQuiz.questions.length
      ? (correct / fullQuiz.questions.length) * 100
      : 0;

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        score,
        timeTaken: timeTaken ?? 0,
        answers: JSON.stringify(answers),
      },
    });

    await recordStudyActivity(userId, Math.max(5, Math.round((timeTaken ?? 300) / 60)));

    res.json({ attempt, score, correct, total: fullQuiz.questions.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
