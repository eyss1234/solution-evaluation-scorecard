import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.gatingAnswer.deleteMany();
  await prisma.gatingRun.deleteMany();
  await prisma.gateQuestion.deleteMany();

  // Seed gate questions
  const questions = [
    {
      text: 'Do you need to evaluate multiple solution options?',
      order: 1,
    },
    {
      text: 'Are there specific criteria you need to compare?',
      order: 2,
    },
    {
      text: 'Do you need to make a data-driven decision?',
      order: 3,
    },
  ];

  for (const q of questions) {
    await prisma.gateQuestion.create({
      data: q,
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
