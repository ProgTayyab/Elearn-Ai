import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function assertCourseOwnership(userId: number, courseId: number) {
  const course = await prisma.course.findFirst({ where: { id: courseId, userId } });
  if (!course) return null;
  return course;
}

export async function assertModuleOwnership(userId: number, moduleId: number) {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: { select: { userId: true, topic: true, title: true, difficulty: true } } },
  });
  if (!module || module.course.userId !== userId) return null;
  return module;
}

export async function assertQuizOwnership(userId: number, quizId: number) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { module: { include: { course: { select: { userId: true } } } } },
  });
  if (!quiz || quiz.module.course.userId !== userId) return null;
  return quiz;
}

export async function assertAssignmentOwnership(userId: number, assignmentId: number) {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { module: { include: { course: { select: { userId: true } } } } },
  });
  if (!assignment || assignment.module.course.userId !== userId) return null;
  return assignment;
}
