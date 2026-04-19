import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simple context-aware mock AI replies
const aiReplies = [
    "Great question! Let me break it down for you. The core idea is to understand the fundamentals first, then build up to the advanced concepts step by step.",
    "That's a really interesting topic! Think of it like building blocks — each concept builds on the previous one. Start with the basics and you'll see how everything connects.",
    "Excellent! Here's the key insight: practice is everything in this field. Try implementing what you've learned even in small exercises. That's how real understanding develops.",
    "Good thinking! This concept is fundamental to understanding the bigger picture. Focus on the 'why' behind it, not just the 'how' — that will help you apply it in new contexts.",
    "I love your curiosity! The best way to learn this is through hands-on projects. Try applying this concept in a mini project and you'll understand it much more deeply.",
];

function generateReply(userMessage: string): string {
    const index = Math.abs(userMessage.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % aiReplies.length;
    return aiReplies[index];
}

// ── Get chat history ────────────────────────────────────────────────────
export const getHistory = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const courseId = parseInt(req.params.courseId, 10);

        const messages = await prisma.chatMessage.findMany({
            where: { userId, courseId },
            orderBy: { createdAt: 'asc' },
        });

        // If no history, seed with welcome message
        if (messages.length === 0) {
            const welcome = await prisma.chatMessage.create({
                data: {
                    userId,
                    courseId,
                    role: 'ai',
                    content: "Hi! I'm your AI tutor. Ask me anything about your courses — I'm here to help you master the material. 🧠",
                },
            });
            return res.json({ messages: [welcome] });
        }

        res.json({ messages });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ── Send message ────────────────────────────────────────────────────────
export const sendMessage = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const courseId = parseInt(req.params.courseId, 10);
        const { content } = req.body;

        if (!content?.trim()) {
            return res.status(400).json({ message: 'Message content is required' });
        }

        // Store user message
        const userMsg = await prisma.chatMessage.create({
            data: { userId, courseId, role: 'user', content },
        });

        // Generate + store AI reply
        const aiContent = generateReply(content);
        const aiMsg = await prisma.chatMessage.create({
            data: { userId, courseId, role: 'ai', content: aiContent },
        });

        res.json({ userMessage: userMsg, aiMessage: aiMsg });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
