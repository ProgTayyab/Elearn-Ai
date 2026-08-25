import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  generateCoursePlan,
  handleGeminiError,
  type GeneratedModule,
} from '../services/geminiService';

const prisma = new PrismaClient();

function buildFallbackPlan(topic: string, difficulty: string, weeks: number) {
  return {
    title: `${topic} — ${difficulty}`,
    modules: Array.from({ length: weeks }, (_, i) => ({
      weekNumber: i + 1,
      title: `Week ${i + 1}: ${topic} Foundations`,
      description: `Learn core ${topic} concepts for week ${i + 1} at ${difficulty} level.`,
      objectives: [
        `Understand key ${topic} concepts (Week ${i + 1})`,
        `Apply concepts through guided practice`,
      ],
      resources: [
        {
          type: 'article',
          title: `${topic} — Week ${i + 1} Study Guide`,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(topic.replace(/\s+/g, '_'))}`,
          source: 'NeuralLearn',
          readTime: 15,
        },
      ],
    })),
  };
}

function moduleCreateData(modules: GeneratedModule[], topic: string) {
  return modules.map((m, i) => ({
    weekNumber: m.weekNumber ?? i + 1,
    title: m.title || `Week ${i + 1}`,
    description: m.description || `Module content for ${topic}`,
    status: i === 0 ? 'active' : 'locked',
    order: i + 1,
    objectives: {
      create: (m.objectives?.length ? m.objectives : [`Master ${topic} week ${i + 1}`]).map((text) => ({
        text: String(text).slice(0, 500),
      })),
    },
    resources: {
      create: (m.resources?.length ? m.resources : []).map((r) => ({
        type: r.type || 'article',
        title: String(r.title || 'Reading').slice(0, 200),
        url: String(r.url || 'https://developers.google.com').slice(0, 500),
        source: String(r.source || 'NeuralLearn').slice(0, 100),
        readTime: Math.min(Math.max(Number(r.readTime) || 15, 5), 120),
      })),
    },
  }));
}

// ── List user's courses ─────────────────────────────────────────────────
export const getCourses = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const courses = await prisma.course.findMany({
      where: { userId },
      include: { modules: { select: { id: true, status: true } } },
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

// ── Create course via Gemini ─────────────────────────────────────────────
export const createCourse = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const topic = String(req.body.topic ?? '').trim().slice(0, 200);
    const difficulty = String(req.body.difficulty ?? '').trim().slice(0, 50);
    const durationWeeks = parseInt(req.body.durationWeeks, 10);

    if (!topic || !difficulty || !durationWeeks || durationWeeks < 1 || durationWeeks > 12) {
      return res.status(400).json({
        message: 'topic, difficulty, and durationWeeks (1-12) are required',
      });
    }

    let plan;
    try {
      plan = await generateCoursePlan(topic, difficulty, durationWeeks);
    } catch {
      plan = buildFallbackPlan(topic, difficulty, durationWeeks);
    }

    const modules = plan.modules.slice(0, durationWeeks);
    if (modules.length < durationWeeks) {
      const fallback = buildFallbackPlan(topic, difficulty, durationWeeks);
      plan.modules = fallback.modules;
    }

    const course = await prisma.course.create({
      data: {
        userId,
        title: plan.title.slice(0, 200) || `${topic} — ${difficulty}`,
        topic,
        difficulty,
        durationWeeks,
        status: 'active',
        modules: { create: moduleCreateData(plan.modules, topic) },
      },
      include: { modules: true },
    });

    res.status(201).json({ course });
  } catch (error: unknown) {
    handleGeminiError(res, error);
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
