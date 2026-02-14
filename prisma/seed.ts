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
  await prisma.project.deleteMany();

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

  // Helper function to create criteria array
  const scale = (items: string[]) =>
    items.map((description, index) => ({
      score: index,
      description,
    }));

  // Seed scorecard questions
  const scorecardQuestions = [
    // Step 1: Business & Functional Fit (BFF)
    {
      stepNumber: 1,
      order: 1,
      weight: 20,
      text: 'What proportion of our must-have requirements are met with out-of-the-box capabilities (or simple configuration), without custom development?',
      criteria: scale([
        'Cannot meet one or more must-haves at all.',
        'Meets few must-haves; extensive custom build required.',
        'Meets some must-haves; major workarounds/customization.',
        'Meets most must-haves; some gaps requiring manageable workarounds.',
        'Meets nearly all must-haves; only minor configuration/extensions.',
        'Meets all must-haves out-of-the-box or via straightforward configuration; no meaningful gaps.',
      ]),
    },
    {
      stepNumber: 1,
      order: 2,
      weight: 5,
      text: 'What proportion of our should-have requirements are met with out-of-the-box capabilities (or simple configuration), without custom development?',
      criteria: scale([
        'Cannot meet one or more should-haves at all.',
        'Meets few should-haves; extensive custom build required.',
        'Meets some should-haves; major workarounds/customization.',
        'Meets most should-haves; some gaps requiring manageable workarounds.',
        'Meets nearly all should-haves; only minor configuration/extensions.',
        'Meets all should-haves out-of-the-box or via straightforward configuration; no meaningful gaps.',
      ]),
    },
    {
      stepNumber: 1,
      order: 3,
      weight: 5,
      text: 'Is the solution viable for our expected future growth and change (users, volume, data, geographies, new capabilities, organizational changes), with minimal disruption and predictable effort/cost?',
      criteria: scale([
        'Not viable for expected growth/change; hard limits or architecture prevents scaling/adaptation.',
        'Very poor future readiness; scaling/adapting requires major replatforming or unacceptable risk.',
        'Partial viability; significant constraints and major compromises likely.',
        'Adequate; manageable constraints with mitigation.',
        'Good scalability and adaptability; minor constraints.',
        'Excellent scalability and adaptability with minimal disruption and strong governance.',
      ]),
    },

    // Step 2: Technical & Architectural Fit (TAF)
    {
      stepNumber: 2,
      order: 1,
      weight: 5,
      text: 'Is the solution compatible with our existing technology stack and architecture patterns?',
      criteria: scale([
        'Not compatible; conflicts cannot be remediated.',
        'Very poor fit; major architectural exceptions required.',
        'Partial fit; major compromises required.',
        'Broadly compatible but requires some exceptions.',
        'Good fit; minor exceptions with clear mitigations.',
        'Excellent fit; fully aligned with required stack and patterns.',
      ]),
    },
    {
      stepNumber: 2,
      order: 2,
      weight: 2.5,
      text: 'Are the APIs/SDKs sufficient to integrate with our systems for all required operations (read/write), reliably and securely?',
      criteria: scale([
        'Required integrations not possible.',
        'Very limited API coverage; unstable or poorly documented.',
        'Some coverage; major gaps or workarounds needed.',
        'Adequate coverage; some feasible alternatives required.',
        'Broad coverage; minor gaps; good documentation.',
        'Comprehensive APIs, webhooks/events, strong documentation and support.',
      ]),
    },
    {
      stepNumber: 2,
      order: 3,
      weight: 2.5,
      text: 'Does it support enterprise identity needs (SSO, MFA, role mapping, provisioning/deprovisioning)?',
      criteria: scale([
        'Cannot meet identity/security requirements.',
        'Minimal identity features; weak controls.',
        'SSO works but provisioning/role mapping weak.',
        'SSO with basic provisioning; some role mapping gaps.',
        'Strong SSO, provisioning, granular roles; minor gaps.',
        'Full enterprise identity alignment with strong governance and auditing.',
      ]),
    },
    {
      stepNumber: 2,
      order: 4,
      weight: 2.5,
      text: 'Can we import/export data (including metadata/audit where needed) and integrate with BI/reporting tools effectively?',
      criteria: scale([
        'Data portability not possible or severely limited.',
        'Manual or partial export; major reporting constraints.',
        'Basic export/import; major BI or history limitations.',
        'Adequate export/import; some metadata/history gaps.',
        'Strong tooling; minor constraints; good BI integration.',
        'Excellent portability with automation, auditability, and robust BI integration.',
      ]),
    },
    {
      stepNumber: 2,
      order: 5,
      weight: 2.5,
      text: 'Can the vendor meet our uptime/resiliency expectations (HA/DR, incident comms, historical performance)?',
      criteria: scale([
        'Cannot meet minimum availability needs.',
        'Weak resilience; frequent or opaque outages.',
        'Some resilience but major concerns remain.',
        'Acceptable uptime; some limitations.',
        'Strong uptime and DR; minor gaps.',
        'Proven resilience with strong incident transparency and history.',
      ]),
    },
    {
      stepNumber: 2,
      order: 6,
      weight: 2.5,
      text: 'Does the vendor provide mature migration tooling and a credible cutover/validation approach?',
      criteria: scale([
        'Migration path unclear or unworkable.',
        'Mostly manual migration; high error risk.',
        'Some tooling; major validation gaps.',
        'Adequate tooling; some manual steps.',
        'Strong tooling; minor gaps; good reconciliation support.',
        'End-to-end migration playbooks with validation tooling and proven approach.',
      ]),
    },
    {
      stepNumber: 2,
      order: 7,
      weight: 2.5,
      text: 'Can we exit cleanly (export data + metadata/config, reasonable costs, clear offboarding process)?',
      criteria: scale([
        'Exit not feasible or highly punitive.',
        'Major lock-in; exports incomplete or expensive.',
        'Partial export; major metadata/history gaps.',
        'Adequate export; some manual effort required.',
        'Strong export; minor constraints.',
        'Clean offboarding with automated exports and clear documentation.',
      ]),
    },

    // Step 3: Vendor & Roadmap Assessment (VRA)
    {
      stepNumber: 3,
      order: 1,
      weight: 2.5,
      text: 'Does the support model meet our needs (coverage, response/resolution, escalation, expertise)?',
      criteria: scale([
        'Support does not meet minimum needs.',
        'Poor responsiveness; limited escalation.',
        'Partial coverage; major compromises.',
        'Adequate support; some gaps.',
        'Strong support; minor gaps.',
        'Excellent enterprise support with clear SLAs and strong escalation.',
      ]),
    },
    {
      stepNumber: 3,
      order: 2,
      weight: 2.5,
      text: 'Are releases predictable and safe (communications, release notes, backward compatibility, maintenance windows)?',
      criteria: scale([
        'Uncontrolled changes; unacceptable risk.',
        'Poor communications; frequent breaking changes.',
        'Some process; major risks remain.',
        'Adequate governance; occasional surprises.',
        'Good release discipline; minor issues.',
        'Mature release governance with strong backward compatibility.',
      ]),
    },
    {
      stepNumber: 3,
      order: 3,
      weight: 2.5,
      text: 'Does the vendor roadmap align with our strategic needs?',
      criteria: scale([
        'Roadmap conflicts with our strategy.',
        'Little alignment; uncertain direction.',
        'Partial alignment; major gaps.',
        'Adequate alignment; some gaps.',
        'Strong alignment; minor gaps.',
        'Excellent alignment with demonstrated delivery track record.',
      ]),
    },
    {
      stepNumber: 3,
      order: 4,
      weight: 2.5,
      text: 'Does the vendor demonstrate stability and strong references in similar deployments?',
      criteria: scale([
        'Unacceptable risk; no credible references.',
        'High risk; weak references.',
        'Some evidence but major concerns.',
        'Adequate confidence; some concerns.',
        'Strong confidence; minor concerns.',
        'Very strong confidence with multiple high-quality references.',
      ]),
    },

    // Step 4: Delivery Feasibility (DF)
    {
      stepNumber: 4,
      order: 1,
      weight: 5,
      text: 'How achievable is implementation within our target timeline and resource constraints?',
      criteria: scale([
        'Not feasible within constraints.',
        'High risk; unrealistic plan.',
        'Significant risk; major dependencies.',
        'Feasible with some risks.',
        'Low risk; clear plan.',
        'Highly predictable delivery with proven methodology.',
      ]),
    },
    {
      stepNumber: 4,
      order: 2,
      weight: 5,
      text: 'How achievable is rollout from a business perspective?',
      criteria: scale([
        'Business rollout not feasible.',
        'Very high change burden; high risk.',
        'Significant change effort required.',
        'Moderate change effort; manageable risks.',
        'Low change burden; good enablement.',
        'Minimal disruption with strong rollout approach.',
      ]),
    },
    {
      stepNumber: 4,
      order: 3,
      weight: 2.5,
      text: 'Do we have adequate skills and capacity to implement and operate the solution effectively?',
      criteria: scale([
        'No viable skills/capacity plan.',
        'Significant skills gaps; heavy reliance on consultants.',
        'Some skills exist but major gaps remain.',
        'Mostly adequate; manageable gaps.',
        'Good capability; minor gaps.',
        'Proven capability and sustainable operating model.',
      ]),
    },
    {
      stepNumber: 4,
      order: 4,
      weight: 2.5,
      text: 'Does the vendor provide mature migration tooling and a credible cutover/validation approach?',
      criteria: scale([
        'Migration path unclear or unworkable.',
        'Mostly manual; high risk.',
        'Some tooling; major validation gaps.',
        'Adequate tooling; some manual steps.',
        'Strong tooling; minor gaps.',
        'End-to-end migration playbooks with validation tooling.',
      ]),
    },

    // Step 5: User Experience & Adoption (UXA)
    {
      stepNumber: 5,
      order: 1,
      weight: 2.5,
      text: 'What is the expected training effort and change impact to achieve adoption?',
      criteria: scale([
        'Adoption unlikely; training impractical.',
        'Very high training burden.',
        'Significant change effort required.',
        'Moderate training; standard change management.',
        'Low training burden; good guidance.',
        'Minimal training with strong in-app adoption tooling.',
      ]),
    },
    {
      stepNumber: 5,
      order: 2,
      weight: 2.5,
      text: 'Does it fit how users work, reducing reliance on email/spreadsheets?',
      criteria: scale([
        'Conflicts with working patterns.',
        'High friction; external tools persist.',
        'Usable but major compromises.',
        'Adequate fit; some friction.',
        'Good fit; minor friction.',
        'Excellent fit that materially improves daily work.',
      ]),
    },
    {
      stepNumber: 5,
      order: 3,
      weight: 5,
      text: 'How intuitive is the UX for completing core tasks with minimal training?',
      criteria: scale([
        'Unusable for core tasks.',
        'High friction; heavy training required.',
        'Usable but confusing.',
        'Generally usable; some friction.',
        'Easy for most users.',
        'Highly intuitive with minimal training.',
      ]),
    },

    // Step 6: Commercials & Total Cost of Ownership (TCO)
    {
      stepNumber: 6,
      order: 1,
      weight: 5,
      text: 'Is pricing transparent, predictable at scale, and aligned to value?',
      criteria: scale([
        'Pricing unacceptable or opaque.',
        'High unpredictability; hidden costs.',
        'Some clarity but exposure to overages.',
        'Reasonably clear; manageable variables.',
        'Transparent; minor variables.',
        'Very transparent with strong cost governance.',
      ]),
    },
    {
      stepNumber: 6,
      order: 2,
      weight: 5,
      text: 'Is the business value clear and measurable, supported by evidence?',
      criteria: scale([
        'No credible value case.',
        'Weak or aspirational claims only.',
        'Partial value case; major assumptions.',
        'Reasonable value case; some assumptions.',
        'Strong value case with credible metrics.',
        'Compelling value case with proven outcomes and measurement plan.',
      ]),
    },
    {
      stepNumber: 6,
      order: 3,
      weight: 5,
      text: 'How competitive is the 3-year TCO including licensing, implementation, integrations, support, and internal effort?',
      criteria: scale([
        'Not economically viable.',
        'Significantly worse than alternatives.',
        'Higher cost; major compromises needed.',
        'Comparable; depends on mitigating gaps.',
        'Strong value; minor cost concerns.',
        'Best overall value with clear ROI and minimal hidden costs.',
      ]),
    },
  ];

  for (const sq of scorecardQuestions) {
    await prisma.scorecardQuestion.create({
      data: sq,
    });
  }

  // Seed sample project (optional - for demo purposes)
  await prisma.project.create({
    data: {
      name: 'Sample Project',
    },
  });

  console.log('Seeding completed successfully!');
  console.log('- Gate questions seeded');
  console.log('- Scorecard questions seeded');
  console.log('- Sample project created');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
