import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.scorecardScore.deleteMany();
  await prisma.scorecardRun.deleteMany();
  await prisma.scorecardQuestion.deleteMany();
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

  // Seed scorecard questions (8 per step, 4 steps)
  const scorecardQuestions = [
    // Step 1: Strategic Fit
    { stepNumber: 1, order: 1, text: 'How well does the solution align with the organisation\'s strategic objectives?' },
    { stepNumber: 1, order: 2, text: 'To what extent does the solution support long-term business goals?' },
    { stepNumber: 1, order: 3, text: 'How effectively does the solution address the identified business need?' },
    { stepNumber: 1, order: 4, text: 'How well does the solution fit within the existing technology landscape?' },
    { stepNumber: 1, order: 5, text: 'To what degree does the solution reduce duplication of existing capabilities?' },
    { stepNumber: 1, order: 6, text: 'How strong is the vendor\'s roadmap alignment with our future needs?' },
    { stepNumber: 1, order: 7, text: 'How well does the solution support scalability requirements?' },
    { stepNumber: 1, order: 8, text: 'To what extent does the solution enable innovation or competitive advantage?' },

    // Step 2: Risk & Compliance
    { stepNumber: 2, order: 1, text: 'How well does the solution meet data protection and privacy requirements?' },
    { stepNumber: 2, order: 2, text: 'To what extent does the solution comply with relevant regulatory frameworks?' },
    { stepNumber: 2, order: 3, text: 'How effectively does the solution mitigate operational risk?' },
    { stepNumber: 2, order: 4, text: 'How robust is the solution\'s security architecture?' },
    { stepNumber: 2, order: 5, text: 'To what degree does the solution support business continuity requirements?' },
    { stepNumber: 2, order: 6, text: 'How well does the solution handle audit and compliance reporting?' },
    { stepNumber: 2, order: 7, text: 'How effectively does the solution manage third-party risk?' },
    { stepNumber: 2, order: 8, text: 'To what extent does the solution support disaster recovery objectives?' },

    // Step 3: Cost & Resources
    { stepNumber: 3, order: 1, text: 'How reasonable is the total cost of ownership over three years?' },
    { stepNumber: 3, order: 2, text: 'To what extent does the solution deliver value for money?' },
    { stepNumber: 3, order: 3, text: 'How manageable are the implementation resource requirements?' },
    { stepNumber: 3, order: 4, text: 'How well does the solution minimise ongoing maintenance costs?' },
    { stepNumber: 3, order: 5, text: 'To what degree does the solution reduce reliance on specialist skills?' },
    { stepNumber: 3, order: 6, text: 'How effectively does the solution leverage existing investments?' },
    { stepNumber: 3, order: 7, text: 'How reasonable is the expected implementation timeline?' },
    { stepNumber: 3, order: 8, text: 'To what extent does the solution reduce operational overhead?' },

    // Step 4: User Impact & Adoption
    { stepNumber: 4, order: 1, text: 'How well does the solution meet end-user needs and expectations?' },
    { stepNumber: 4, order: 2, text: 'To what extent does the solution improve the user experience?' },
    { stepNumber: 4, order: 3, text: 'How manageable is the change management effort required?' },
    { stepNumber: 4, order: 4, text: 'How well does the solution support training and onboarding?' },
    { stepNumber: 4, order: 5, text: 'To what degree does the solution improve productivity?' },
    { stepNumber: 4, order: 6, text: 'How effectively does the solution integrate with users\' existing workflows?' },
    { stepNumber: 4, order: 7, text: 'How strong is the expected user adoption rate?' },
    { stepNumber: 4, order: 8, text: 'To what extent does the solution support accessibility requirements?' },
  ];

  for (const sq of scorecardQuestions) {
    await prisma.scorecardQuestion.create({
      data: sq,
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
