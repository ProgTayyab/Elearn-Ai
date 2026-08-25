import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@synapse.ai' },
    update: {
      lastLoginAt: new Date(),
      username: 'demo_learner',
      preferences: JSON.stringify({ theme: 'dark', emailNotifications: true }),
    },
    create: {
      email: 'demo@synapse.ai',
      name: 'Demo Learner',
      username: 'demo_learner',
      passwordHash,
      streak: 5,
      totalStudyMinutes: 240,
      preferences: JSON.stringify({ theme: 'dark', emailNotifications: true }),
      lastLoginAt: new Date(),
    },
  });

  console.log('Seed complete. Demo user:', user.email, '| username:', user.username);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
