import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { assertCourseOwnership } from '../utils/courseAccess';
import { generateChatReply, fallbackChatReply, handleGeminiError, GeminiServiceError } from '../services/geminiService';

const prisma = new PrismaClient();
const MAX_MESSAGE_LENGTH = 4000;

function sanitizeMessage(content: string): string {
  return content.trim().slice(0, MAX_MESSAGE_LENGTH);
}

// ── Get chat history ────────────────────────────────────────────────────
export const getHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const courseId = parseInt(req.params.courseId, 10);

    const course = await assertCourseOwnership(userId, courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const messages = await prisma.chatMessage.findMany({
      where: { userId, courseId },
      orderBy: { createdAt: 'asc' },
    });

    if (messages.length === 0) {
      const welcome = await prisma.chatMessage.create({
        data: {
          userId,
          courseId,
          role: 'ai',
          content:
            "Hi! I'm your AI tutor powered by Gemini. Ask me anything about this course — I'm here to help you master the material.",
        },
      });
      return res.json({ messages: [welcome] });
    }

    res.json({ messages });
  } catch (error: unknown) {
    handleGeminiError(res, error);
  }
};

// ── Send message ────────────────────────────────────────────────────────
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const courseId = parseInt(req.params.courseId, 10);
    const content = sanitizeMessage(String(req.body.content ?? ''));

    if (!content) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const course = await prisma.course.findFirst({
      where: { id: courseId, userId },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          select: { weekNumber: true, title: true, description: true, status: true },
        },
      },
    });

    if (!course) return res.status(404).json({ message: 'Course not found' });

    const userMsg = await prisma.chatMessage.create({
      data: { userId, courseId, role: 'user', content },
    });

    const priorMessages = await prisma.chatMessage.findMany({
      where: { userId, courseId, id: { not: userMsg.id } },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    const moduleSummaries = course.modules
      .map((m) => `Week ${m.weekNumber}: ${m.title} (${m.status}) — ${m.description}`)
      .join('\n');

    let aiContent: string;
    try {
      aiContent = await generateChatReply({
        courseTitle: course.title,
        courseTopic: course.topic,
        difficulty: course.difficulty,
        moduleSummaries: moduleSummaries || 'No modules yet.',
        history: priorMessages.map((m) => ({ role: m.role, content: m.content })),
        userMessage: content,
      });
    } catch (err) {
      if (err instanceof GeminiServiceError && ['RATE_LIMIT', 'API_DOWN', 'NETWORK', 'INVALID_KEY'].includes(err.code)) {
        aiContent = fallbackChatReply(content, course.topic);
      } else {
        throw err;
      }
    }

    const aiMsg = await prisma.chatMessage.create({
      data: { userId, courseId, role: 'ai', content: aiContent },
    });

    res.json({ userMessage: userMsg, aiMessage: aiMsg });
  } catch (error: unknown) {
    handleGeminiError(res, error);
  }
};
