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
      text: 'Does the solution directly enable or advance a strategic initiative?',
      order: 1,
    },
    {
      text: 'Will the solution replace, retire, or consolidate multiple existing applications?',
      order: 2,
    },
    {
      text: 'Will capital expenditure exceed £150k across the next three years?',
      order: 3,
    },
    {
      text: 'Will the solution handle personal or sensitive data, or introduce regulatory considerations?',
      order: 4,
    },
    {
      text: 'Will the solution integrate with business‑critical systems containing financial, operational, or confidential information?',
      order: 5,
    },
    {
      text: 'Would a failure of the solution result in material impact (e.g., operational disruption, reputational damage, or financial loss)?',
      order: 6,
    },
    {
      text: 'Will the solution require significant internal resources (e.g., BAs, developers, SMEs) to deliver or maintain?',
      order: 7,
    },
    {
      text: 'Is the long‑term maintainability uncertain (e.g., vendor sustainability, support challenges, reliance on niche skills)?',
      order: 8,
    },
    {
      text: 'Does the solution risk generating technical debt or duplicating existing capabilities?',
      order: 9,
    },
    {
      text: 'Will the solution impact more than 50 users, an entire department, or core business‑critical processes?',
      order: 10,
    },
    {
      text: 'Would a structured evaluation or scorecard help validate the decision?',
      order: 11,
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
