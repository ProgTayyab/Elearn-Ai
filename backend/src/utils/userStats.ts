import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function recordStudyActivity(userId: number, minutes: number): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      totalStudyMinutes: { increment: minutes },
      streak: { increment: 1 },
    },
  });
}
