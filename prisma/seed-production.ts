import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding production data...');

  const allGateQuestions = await prisma.gateQuestion.findMany({
    orderBy: { order: 'asc' },
  });
  const allScorecardQuestions = await prisma.scorecardQuestion.findMany({
    orderBy: [{ stepNumber: 'asc' }, { order: 'asc' }],
  });

  if (allGateQuestions.length === 0 || allScorecardQuestions.length === 0) {
    console.error('Error: Base questions not found. Please run the base seed first: npm run db:seed');
    process.exit(1);
  }

  // Clear existing project data only
  await prisma.financialCost.deleteMany();
  await prisma.financialEntry.deleteMany();
  await prisma.projectFinancialSettings.deleteMany();
  await prisma.scorecardStepComment.deleteMany();
  await prisma.scorecardOverview.deleteMany();
  await prisma.scorecardScore.deleteMany();
  await prisma.scorecardRun.deleteMany();
  await prisma.gatingAnswer.deleteMany();
  await prisma.gatingRun.deleteMany();
  await prisma.project.deleteMany();

  // Project 1: Enterprise CRM Migration - High-scoring winner
  const crmProject = await prisma.project.create({
    data: {
      name: 'Enterprise CRM Migration to Salesforce',
      createdAt: new Date('2024-01-15'),
    },
  });

  await prisma.projectFinancialSettings.create({
    data: {
      projectId: crmProject.id,
      currency: 'GBP',
    },
  });

  const crmGatingRun = await prisma.gatingRun.create({
    data: {
      projectId: crmProject.id,
      createdAt: new Date('2024-01-15'),
      answers: {
        create: [
          { questionId: allGateQuestions[0].id, value: true },
          { questionId: allGateQuestions[1].id, value: true },
          { questionId: allGateQuestions[2].id, value: true },
          { questionId: allGateQuestions[3].id, value: true },
          { questionId: allGateQuestions[4].id, value: true },
          { questionId: allGateQuestions[5].id, value: true },
          { questionId: allGateQuestions[6].id, value: true },
          { questionId: allGateQuestions[7].id, value: false },
          { questionId: allGateQuestions[8].id, value: false },
          { questionId: allGateQuestions[9].id, value: true },
          { questionId: allGateQuestions[10].id, value: true },
        ],
      },
    },
  });

  const crmFinancialEntries = await Promise.all([
    prisma.financialEntry.create({
      data: {
        projectId: crmProject.id,
        name: 'Software Licenses',
        category: 'IMPLEMENTATION_CAPEX',
        order: 1,
      },
    }),
    prisma.financialEntry.create({
      data: {
        projectId: crmProject.id,
        name: 'Implementation Services',
        category: 'IMPLEMENTATION_OPEX',
        order: 2,
      },
    }),
    prisma.financialEntry.create({
      data: {
        projectId: crmProject.id,
        name: 'Data Migration',
        category: 'IMPLEMENTATION_OPEX',
        order: 3,
      },
    }),
    prisma.financialEntry.create({
      data: {
        projectId: crmProject.id,
        name: 'Annual Subscription',
        category: 'ONGOING_OPEX',
        order: 4,
      },
    }),
    prisma.financialEntry.create({
      data: {
        projectId: crmProject.id,
        name: 'Support & Maintenance',
        category: 'ONGOING_OPEX',
        order: 5,
      },
    }),
  ]);

  const crmSalesforce = await prisma.scorecardRun.create({
    data: {
      projectId: crmProject.id,
      name: 'Salesforce Sales Cloud',
      createdAt: new Date('2024-01-20'),
    },
  });

  await prisma.scorecardScore.createMany({
    data: [
      { runId: crmSalesforce.id, questionId: allScorecardQuestions[0].id, value: 5 },
      { runId: crmSalesforce.id, questionId: allScorecardQuestions[1].id, value: 5 },
      { runId: crmSalesforce.id, questionId: allScorecardQuestions[2].id, value: 5 },
      { runId: crmSalesforce.id, questionId: allScorecardQuestions[3].id, value: 5 },
      { runId: crmSalesforce.id, questionId: allScorecardQuestions[4].id, value: 5 },
      { runId: crmSalesforce.id, questionId: allScorecardQuestions[5].id, value: 4 },
      { runId: crmSalesforce.id, questionId: allScorecardQuestions[6].id, value: 5 },
      { runId: crmSalesforce.id, questionId: allScorecardQuestions[7].id, value: 5 },
      { runId: crmSalesforce.id, questionId: allScorecardQuestions[8].id, value: 5 },
      { runId: crmSalesforce.id, questionId: allScorecardQuestions[9].id, value: 5 },
      { runId: crmSalesforce.id, questionId: allScorecardQuestions[10].id, value: 4 },
      { runId: crmSalesforce.id, questionId: allScorecardQuestions[11].id, value: 5 },
      { runId: crmSalesforce.id, questionId: allScorecardQuestions[12].id, value: 5 },
      { runId: crmSalesforce.id, questionId: allScorecardQuestions[13].id, value: 5 },
      { runId: crmSalesforce.id, questionId: allScorecardQuestions[14].id, value: 4 },
      { runId: crmSalesforce.id, questionId: allScorecardQuestions[15].id, value: 5 },
      { runId: crmSalesforce.id, questionId: allScorecardQuestions[16].id, value: 4 },
      { runId: crmSalesforce.id, questionId: allScorecardQuestions[17].id, value: 5 },
      { runId: crmSalesforce.id, questionId: allScorecardQuestions[18].id, value: 5 },
      { runId: crmSalesforce.id, questionId: allScorecardQuestions[19].id, value: 4 },
      { runId: crmSalesforce.id, questionId: allScorecardQuestions[20].id, value: 4 },
      { runId: crmSalesforce.id, questionId: allScorecardQuestions[21].id, value: 5 },
      { runId: crmSalesforce.id, questionId: allScorecardQuestions[22].id, value: 4 },
    ],
  });

  await prisma.financialCost.createMany({
    data: [
      { entryId: crmFinancialEntries[0].id, scorecardRunId: crmSalesforce.id, amount: 85000 },
      { entryId: crmFinancialEntries[1].id, scorecardRunId: crmSalesforce.id, amount: 120000 },
      { entryId: crmFinancialEntries[2].id, scorecardRunId: crmSalesforce.id, amount: 45000 },
      { entryId: crmFinancialEntries[3].id, scorecardRunId: crmSalesforce.id, amount: 180000 },
      { entryId: crmFinancialEntries[4].id, scorecardRunId: crmSalesforce.id, amount: 35000 },
    ],
  });

  await prisma.scorecardOverview.create({
    data: {
      runId: crmSalesforce.id,
      pros: 'Industry-leading CRM with comprehensive features, excellent scalability, strong ecosystem of integrations and AppExchange solutions. Proven track record with enterprise deployments. Superior mobile experience and AI capabilities with Einstein.',
      cons: 'Premium pricing model with potential for cost escalation. Requires dedicated admin resources. Some customizations can be complex. Occasional performance issues with very large data volumes.',
      summary: 'Salesforce represents the gold standard for enterprise CRM with exceptional functional fit, robust technical capabilities, and strong vendor stability. While pricing is at the higher end, the comprehensive feature set, scalability, and proven track record justify the investment for our strategic CRM transformation.',
    },
  });

  await prisma.scorecardStepComment.createMany({
    data: [
      { runId: crmSalesforce.id, stepNumber: 1, comment: 'Excellent out-of-the-box coverage of all must-have requirements including opportunity management, forecasting, and reporting. Strong mobile capabilities.' },
      { runId: crmSalesforce.id, stepNumber: 2, comment: 'Comprehensive REST and SOAP APIs, excellent SSO support via SAML, strong data export capabilities. Migration tools are mature and well-documented.' },
      { runId: crmSalesforce.id, stepNumber: 3, comment: 'Market leader with strong financial position. Excellent support model with dedicated CSM. Roadmap aligns well with our digital transformation strategy.' },
      { runId: crmSalesforce.id, stepNumber: 4, comment: 'Implementation timeline is realistic at 6 months. Strong partner ecosystem available. Team has some Salesforce experience from previous roles.' },
      { runId: crmSalesforce.id, stepNumber: 5, comment: 'Intuitive interface with low training burden. Strong adoption tools including in-app guidance and Trailhead learning platform.' },
      { runId: crmSalesforce.id, stepNumber: 6, comment: 'Pricing is transparent and predictable. Strong ROI case based on sales productivity improvements and pipeline visibility. 3-year TCO is competitive when considering total value.' },
    ],
  });

  const crmDynamics = await prisma.scorecardRun.create({
    data: {
      projectId: crmProject.id,
      name: 'Microsoft Dynamics 365',
      createdAt: new Date('2024-01-22'),
    },
  });

  await prisma.scorecardScore.createMany({
    data: [
      { runId: crmDynamics.id, questionId: allScorecardQuestions[0].id, value: 4 },
      { runId: crmDynamics.id, questionId: allScorecardQuestions[1].id, value: 4 },
      { runId: crmDynamics.id, questionId: allScorecardQuestions[2].id, value: 4 },
      { runId: crmDynamics.id, questionId: allScorecardQuestions[3].id, value: 5 },
      { runId: crmDynamics.id, questionId: allScorecardQuestions[4].id, value: 4 },
      { runId: crmDynamics.id, questionId: allScorecardQuestions[5].id, value: 4 },
      { runId: crmDynamics.id, questionId: allScorecardQuestions[6].id, value: 4 },
      { runId: crmDynamics.id, questionId: allScorecardQuestions[7].id, value: 5 },
      { runId: crmDynamics.id, questionId: allScorecardQuestions[8].id, value: 4 },
      { runId: crmDynamics.id, questionId: allScorecardQuestions[9].id, value: 4 },
      { runId: crmDynamics.id, questionId: allScorecardQuestions[10].id, value: 5 },
      { runId: crmDynamics.id, questionId: allScorecardQuestions[11].id, value: 4 },
      { runId: crmDynamics.id, questionId: allScorecardQuestions[12].id, value: 4 },
      { runId: crmDynamics.id, questionId: allScorecardQuestions[13].id, value: 4 },
      { runId: crmDynamics.id, questionId: allScorecardQuestions[14].id, value: 4 },
      { runId: crmDynamics.id, questionId: allScorecardQuestions[15].id, value: 4 },
      { runId: crmDynamics.id, questionId: allScorecardQuestions[16].id, value: 4 },
      { runId: crmDynamics.id, questionId: allScorecardQuestions[17].id, value: 4 },
      { runId: crmDynamics.id, questionId: allScorecardQuestions[18].id, value: 4 },
      { runId: crmDynamics.id, questionId: allScorecardQuestions[19].id, value: 4 },
      { runId: crmDynamics.id, questionId: allScorecardQuestions[20].id, value: 4 },
      { runId: crmDynamics.id, questionId: allScorecardQuestions[21].id, value: 4 },
      { runId: crmDynamics.id, questionId: allScorecardQuestions[22].id, value: 5 },
    ],
  });

  await prisma.financialCost.createMany({
    data: [
      { entryId: crmFinancialEntries[0].id, scorecardRunId: crmDynamics.id, amount: 75000 },
      { entryId: crmFinancialEntries[1].id, scorecardRunId: crmDynamics.id, amount: 95000 },
      { entryId: crmFinancialEntries[2].id, scorecardRunId: crmDynamics.id, amount: 38000 },
      { entryId: crmFinancialEntries[3].id, scorecardRunId: crmDynamics.id, amount: 145000 },
      { entryId: crmFinancialEntries[4].id, scorecardRunId: crmDynamics.id, amount: 28000 },
    ],
  });

  await prisma.scorecardOverview.create({
    data: {
      runId: crmDynamics.id,
      pros: 'Strong integration with Microsoft 365 ecosystem. Competitive pricing. Good functional coverage for core CRM needs. Familiar interface for Microsoft users. Solid Power Platform capabilities for customization.',
      cons: 'Less mature than Salesforce in some advanced features. Smaller partner ecosystem. Some users report UI complexity. Historical concerns about platform stability during major updates.',
      summary: 'Dynamics 365 offers solid CRM capabilities with excellent Microsoft ecosystem integration at a more competitive price point. While it scores well across most criteria, it falls slightly behind Salesforce in functional depth and vendor ecosystem maturity.',
    },
  });

  await prisma.scorecardStepComment.createMany({
    data: [
      { runId: crmDynamics.id, stepNumber: 1, comment: 'Good coverage of must-have requirements but some advanced features require Power Platform customization. Strong for organizations already using Microsoft 365.' },
      { runId: crmDynamics.id, stepNumber: 2, comment: 'Excellent Azure AD integration. Good APIs but documentation can be fragmented. Migration tools are adequate but less mature than Salesforce.' },
      { runId: crmDynamics.id, stepNumber: 3, comment: 'Microsoft backing provides strong stability. Support is good but can be slower than Salesforce. Roadmap shows strong investment in AI and automation.' },
      { runId: crmDynamics.id, stepNumber: 4, comment: 'Implementation timeline similar to Salesforce. Fewer specialized partners available. Team familiarity with Microsoft ecosystem is an advantage.' },
      { runId: crmDynamics.id, stepNumber: 5, comment: 'Interface is familiar to Microsoft users but can be complex for new users. Training resources are good but not as comprehensive as Salesforce Trailhead.' },
      { runId: crmDynamics.id, stepNumber: 6, comment: 'More competitive pricing than Salesforce. Good value proposition especially for Microsoft-centric organizations. TCO advantage of 15-20% over Salesforce.' },
    ],
  });

  // Project 2: Marketing Automation Platform - Mixed results
  const marketingProject = await prisma.project.create({
    data: {
      name: 'Marketing Automation Platform Selection',
      createdAt: new Date('2024-02-01'),
    },
  });

  await prisma.projectFinancialSettings.create({
    data: {
      projectId: marketingProject.id,
      currency: 'USD',
    },
  });

  const marketingGatingRun = await prisma.gatingRun.create({
    data: {
      projectId: marketingProject.id,
      createdAt: new Date('2024-02-01'),
      answers: {
        create: [
          { questionId: allGateQuestions[0].id, value: true },
          { questionId: allGateQuestions[1].id, value: false },
          { questionId: allGateQuestions[2].id, value: true },
          { questionId: allGateQuestions[3].id, value: true },
          { questionId: allGateQuestions[4].id, value: true },
          { questionId: allGateQuestions[5].id, value: false },
          { questionId: allGateQuestions[6].id, value: true },
          { questionId: allGateQuestions[7].id, value: false },
          { questionId: allGateQuestions[8].id, value: false },
          { questionId: allGateQuestions[9].id, value: true },
          { questionId: allGateQuestions[10].id, value: true },
        ],
      },
    },
  });

  const marketingFinancialEntries = await Promise.all([
    prisma.financialEntry.create({
      data: {
        projectId: marketingProject.id,
        name: 'Platform License',
        category: 'IMPLEMENTATION_CAPEX',
        order: 1,
      },
    }),
    prisma.financialEntry.create({
      data: {
        projectId: marketingProject.id,
        name: 'Setup & Configuration',
        category: 'IMPLEMENTATION_OPEX',
        order: 2,
      },
    }),
    prisma.financialEntry.create({
      data: {
        projectId: marketingProject.id,
        name: 'Training & Enablement',
        category: 'IMPLEMENTATION_OPEX',
        order: 3,
      },
    }),
    prisma.financialEntry.create({
      data: {
        projectId: marketingProject.id,
        name: 'Annual Subscription',
        category: 'ONGOING_OPEX',
        order: 4,
      },
    }),
  ]);

  const marketingHubspot = await prisma.scorecardRun.create({
    data: {
      projectId: marketingProject.id,
      name: 'HubSpot Marketing Hub',
      createdAt: new Date('2024-02-05'),
    },
  });

  await prisma.scorecardScore.createMany({
    data: [
      { runId: marketingHubspot.id, questionId: allScorecardQuestions[0].id, value: 5 },
      { runId: marketingHubspot.id, questionId: allScorecardQuestions[1].id, value: 4 },
      { runId: marketingHubspot.id, questionId: allScorecardQuestions[2].id, value: 4 },
      { runId: marketingHubspot.id, questionId: allScorecardQuestions[3].id, value: 4 },
      { runId: marketingHubspot.id, questionId: allScorecardQuestions[4].id, value: 5 },
      { runId: marketingHubspot.id, questionId: allScorecardQuestions[5].id, value: 5 },
      { runId: marketingHubspot.id, questionId: allScorecardQuestions[6].id, value: 4 },
      { runId: marketingHubspot.id, questionId: allScorecardQuestions[7].id, value: 5 },
      { runId: marketingHubspot.id, questionId: allScorecardQuestions[8].id, value: 4 },
      { runId: marketingHubspot.id, questionId: allScorecardQuestions[9].id, value: 5 },
      { runId: marketingHubspot.id, questionId: allScorecardQuestions[10].id, value: 5 },
      { runId: marketingHubspot.id, questionId: allScorecardQuestions[11].id, value: 5 },
      { runId: marketingHubspot.id, questionId: allScorecardQuestions[12].id, value: 4 },
      { runId: marketingHubspot.id, questionId: allScorecardQuestions[13].id, value: 5 },
      { runId: marketingHubspot.id, questionId: allScorecardQuestions[14].id, value: 5 },
      { runId: marketingHubspot.id, questionId: allScorecardQuestions[15].id, value: 5 },
      { runId: marketingHubspot.id, questionId: allScorecardQuestions[16].id, value: 4 },
      { runId: marketingHubspot.id, questionId: allScorecardQuestions[17].id, value: 5 },
      { runId: marketingHubspot.id, questionId: allScorecardQuestions[18].id, value: 5 },
      { runId: marketingHubspot.id, questionId: allScorecardQuestions[19].id, value: 5 },
      { runId: marketingHubspot.id, questionId: allScorecardQuestions[20].id, value: 5 },
      { runId: marketingHubspot.id, questionId: allScorecardQuestions[21].id, value: 3 },
      { runId: marketingHubspot.id, questionId: allScorecardQuestions[22].id, value: 3 },
    ],
  });

  await prisma.financialCost.createMany({
    data: [
      { entryId: marketingFinancialEntries[0].id, scorecardRunId: marketingHubspot.id, amount: 15000 },
      { entryId: marketingFinancialEntries[1].id, scorecardRunId: marketingHubspot.id, amount: 25000 },
      { entryId: marketingFinancialEntries[2].id, scorecardRunId: marketingHubspot.id, amount: 12000 },
      { entryId: marketingFinancialEntries[3].id, scorecardRunId: marketingHubspot.id, amount: 48000 },
    ],
  });

  await prisma.scorecardOverview.create({
    data: {
      runId: marketingHubspot.id,
      pros: 'Exceptional user experience and ease of use. Comprehensive inbound marketing features. Strong content management and SEO tools. Excellent integration with HubSpot CRM. Fast implementation and low training burden.',
      cons: 'Pricing can escalate quickly with contact database growth. Limited advanced customization options. Some enterprise features require highest tier. Reporting capabilities less robust than specialized tools.',
      summary: 'HubSpot excels in user experience and functional fit for inbound marketing. Strong technical capabilities and vendor stability. However, pricing model based on contact volume creates TCO concerns as our database grows, impacting overall value proposition.',
    },
  });

  const marketingMarketo = await prisma.scorecardRun.create({
    data: {
      projectId: marketingProject.id,
      name: 'Adobe Marketo Engage',
      createdAt: new Date('2024-02-07'),
    },
  });

  await prisma.scorecardScore.createMany({
    data: [
      { runId: marketingMarketo.id, questionId: allScorecardQuestions[0].id, value: 4 },
      { runId: marketingMarketo.id, questionId: allScorecardQuestions[1].id, value: 4 },
      { runId: marketingMarketo.id, questionId: allScorecardQuestions[2].id, value: 4 },
      { runId: marketingMarketo.id, questionId: allScorecardQuestions[3].id, value: 3 },
      { runId: marketingMarketo.id, questionId: allScorecardQuestions[4].id, value: 4 },
      { runId: marketingMarketo.id, questionId: allScorecardQuestions[5].id, value: 4 },
      { runId: marketingMarketo.id, questionId: allScorecardQuestions[6].id, value: 3 },
      { runId: marketingMarketo.id, questionId: allScorecardQuestions[7].id, value: 4 },
      { runId: marketingMarketo.id, questionId: allScorecardQuestions[8].id, value: 4 },
      { runId: marketingMarketo.id, questionId: allScorecardQuestions[9].id, value: 4 },
      { runId: marketingMarketo.id, questionId: allScorecardQuestions[10].id, value: 4 },
      { runId: marketingMarketo.id, questionId: allScorecardQuestions[11].id, value: 4 },
      { runId: marketingMarketo.id, questionId: allScorecardQuestions[12].id, value: 4 },
      { runId: marketingMarketo.id, questionId: allScorecardQuestions[13].id, value: 4 },
      { runId: marketingMarketo.id, questionId: allScorecardQuestions[14].id, value: 3 },
      { runId: marketingMarketo.id, questionId: allScorecardQuestions[15].id, value: 3 },
      { runId: marketingMarketo.id, questionId: allScorecardQuestions[16].id, value: 3 },
      { runId: marketingMarketo.id, questionId: allScorecardQuestions[17].id, value: 3 },
      { runId: marketingMarketo.id, questionId: allScorecardQuestions[18].id, value: 2 },
      { runId: marketingMarketo.id, questionId: allScorecardQuestions[19].id, value: 3 },
      { runId: marketingMarketo.id, questionId: allScorecardQuestions[20].id, value: 2 },
      { runId: marketingMarketo.id, questionId: allScorecardQuestions[21].id, value: 4 },
      { runId: marketingMarketo.id, questionId: allScorecardQuestions[22].id, value: 4 },
    ],
  });

  await prisma.financialCost.createMany({
    data: [
      { entryId: marketingFinancialEntries[0].id, scorecardRunId: marketingMarketo.id, amount: 25000 },
      { entryId: marketingFinancialEntries[1].id, scorecardRunId: marketingMarketo.id, amount: 45000 },
      { entryId: marketingFinancialEntries[2].id, scorecardRunId: marketingMarketo.id, amount: 18000 },
      { entryId: marketingFinancialEntries[3].id, scorecardRunId: marketingMarketo.id, amount: 72000 },
    ],
  });

  await prisma.scorecardOverview.create({
    data: {
      runId: marketingMarketo.id,
      pros: 'Powerful lead scoring and nurturing capabilities. Strong B2B marketing features. Good integration with Adobe Experience Cloud. Predictable pricing not based on contacts. Advanced reporting and analytics.',
      cons: 'Steep learning curve and complex interface. Requires dedicated administrator. Longer implementation timeline. Less intuitive than modern alternatives. Historical concerns about Adobe support quality post-acquisition.',
      summary: 'Marketo offers robust enterprise marketing automation with strong B2B capabilities. However, significant usability challenges, longer implementation timeline, and concerns about user adoption make it a riskier choice despite better pricing predictability.',
    },
  });

  // Project 3: Cloud Data Warehouse - Technical evaluation
  const dataWarehouseProject = await prisma.project.create({
    data: {
      name: 'Cloud Data Warehouse Modernization',
      createdAt: new Date('2024-01-10'),
    },
  });

  await prisma.projectFinancialSettings.create({
    data: {
      projectId: dataWarehouseProject.id,
      currency: 'USD',
    },
  });

  const dataWarehouseGatingRun = await prisma.gatingRun.create({
    data: {
      projectId: dataWarehouseProject.id,
      createdAt: new Date('2024-01-10'),
      answers: {
        create: [
          { questionId: allGateQuestions[0].id, value: true },
          { questionId: allGateQuestions[1].id, value: true },
          { questionId: allGateQuestions[2].id, value: true },
          { questionId: allGateQuestions[3].id, value: true },
          { questionId: allGateQuestions[4].id, value: true },
          { questionId: allGateQuestions[5].id, value: true },
          { questionId: allGateQuestions[6].id, value: true },
          { questionId: allGateQuestions[7].id, value: false },
          { questionId: allGateQuestions[8].id, value: false },
          { questionId: allGateQuestions[9].id, value: true },
          { questionId: allGateQuestions[10].id, value: true },
        ],
      },
    },
  });

  const dataWarehouseFinancialEntries = await Promise.all([
    prisma.financialEntry.create({
      data: {
        projectId: dataWarehouseProject.id,
        name: 'Initial Setup & Credits',
        category: 'IMPLEMENTATION_CAPEX',
        order: 1,
      },
    }),
    prisma.financialEntry.create({
      data: {
        projectId: dataWarehouseProject.id,
        name: 'Migration Services',
        category: 'IMPLEMENTATION_OPEX',
        order: 2,
      },
    }),
    prisma.financialEntry.create({
      data: {
        projectId: dataWarehouseProject.id,
        name: 'Data Engineering',
        category: 'IMPLEMENTATION_OPEX',
        order: 3,
      },
    }),
    prisma.financialEntry.create({
      data: {
        projectId: dataWarehouseProject.id,
        name: 'Compute Costs',
        category: 'ONGOING_OPEX',
        order: 4,
      },
    }),
    prisma.financialEntry.create({
      data: {
        projectId: dataWarehouseProject.id,
        name: 'Storage Costs',
        category: 'ONGOING_OPEX',
        order: 5,
      },
    }),
  ]);

  const dataWarehouseSnowflake = await prisma.scorecardRun.create({
    data: {
      projectId: dataWarehouseProject.id,
      name: 'Snowflake Data Cloud',
      createdAt: new Date('2024-01-15'),
    },
  });

  await prisma.scorecardScore.createMany({
    data: [
      { runId: dataWarehouseSnowflake.id, questionId: allScorecardQuestions[0].id, value: 5 },
      { runId: dataWarehouseSnowflake.id, questionId: allScorecardQuestions[1].id, value: 5 },
      { runId: dataWarehouseSnowflake.id, questionId: allScorecardQuestions[2].id, value: 5 },
      { runId: dataWarehouseSnowflake.id, questionId: allScorecardQuestions[3].id, value: 5 },
      { runId: dataWarehouseSnowflake.id, questionId: allScorecardQuestions[4].id, value: 5 },
      { runId: dataWarehouseSnowflake.id, questionId: allScorecardQuestions[5].id, value: 5 },
      { runId: dataWarehouseSnowflake.id, questionId: allScorecardQuestions[6].id, value: 5 },
      { runId: dataWarehouseSnowflake.id, questionId: allScorecardQuestions[7].id, value: 5 },
      { runId: dataWarehouseSnowflake.id, questionId: allScorecardQuestions[8].id, value: 5 },
      { runId: dataWarehouseSnowflake.id, questionId: allScorecardQuestions[9].id, value: 5 },
      { runId: dataWarehouseSnowflake.id, questionId: allScorecardQuestions[10].id, value: 4 },
      { runId: dataWarehouseSnowflake.id, questionId: allScorecardQuestions[11].id, value: 5 },
      { runId: dataWarehouseSnowflake.id, questionId: allScorecardQuestions[12].id, value: 5 },
      { runId: dataWarehouseSnowflake.id, questionId: allScorecardQuestions[13].id, value: 5 },
      { runId: dataWarehouseSnowflake.id, questionId: allScorecardQuestions[14].id, value: 4 },
      { runId: dataWarehouseSnowflake.id, questionId: allScorecardQuestions[15].id, value: 4 },
      { runId: dataWarehouseSnowflake.id, questionId: allScorecardQuestions[16].id, value: 4 },
      { runId: dataWarehouseSnowflake.id, questionId: allScorecardQuestions[17].id, value: 5 },
      { runId: dataWarehouseSnowflake.id, questionId: allScorecardQuestions[18].id, value: 4 },
      { runId: dataWarehouseSnowflake.id, questionId: allScorecardQuestions[19].id, value: 4 },
      { runId: dataWarehouseSnowflake.id, questionId: allScorecardQuestions[20].id, value: 4 },
      { runId: dataWarehouseSnowflake.id, questionId: allScorecardQuestions[21].id, value: 3 },
      { runId: dataWarehouseSnowflake.id, questionId: allScorecardQuestions[22].id, value: 4 },
    ],
  });

  await prisma.financialCost.createMany({
    data: [
      { entryId: dataWarehouseFinancialEntries[0].id, scorecardRunId: dataWarehouseSnowflake.id, amount: 50000 },
      { entryId: dataWarehouseFinancialEntries[1].id, scorecardRunId: dataWarehouseSnowflake.id, amount: 85000 },
      { entryId: dataWarehouseFinancialEntries[2].id, scorecardRunId: dataWarehouseSnowflake.id, amount: 120000 },
      { entryId: dataWarehouseFinancialEntries[3].id, scorecardRunId: dataWarehouseSnowflake.id, amount: 180000 },
      { entryId: dataWarehouseFinancialEntries[4].id, scorecardRunId: dataWarehouseSnowflake.id, amount: 45000 },
    ],
  });

  await prisma.scorecardOverview.create({
    data: {
      runId: dataWarehouseSnowflake.id,
      pros: 'Exceptional performance and scalability. Zero-copy cloning and time travel features. Excellent data sharing capabilities. Strong separation of compute and storage. Comprehensive SQL support. Growing marketplace ecosystem.',
      cons: 'Consumption-based pricing requires careful monitoring. Can be expensive for always-on workloads. Some advanced features require specific editions. Learning curve for cost optimization.',
      summary: 'Snowflake delivers outstanding technical capabilities with industry-leading performance, scalability, and innovative features. Excellent fit for our data warehouse modernization. Pricing requires governance but offers flexibility. Strong vendor with proven enterprise track record.',
    },
  });

  const dataWarehouseBigQuery = await prisma.scorecardRun.create({
    data: {
      projectId: dataWarehouseProject.id,
      name: 'Google BigQuery',
      createdAt: new Date('2024-01-17'),
    },
  });

  await prisma.scorecardScore.createMany({
    data: [
      { runId: dataWarehouseBigQuery.id, questionId: allScorecardQuestions[0].id, value: 4 },
      { runId: dataWarehouseBigQuery.id, questionId: allScorecardQuestions[1].id, value: 4 },
      { runId: dataWarehouseBigQuery.id, questionId: allScorecardQuestions[2].id, value: 5 },
      { runId: dataWarehouseBigQuery.id, questionId: allScorecardQuestions[3].id, value: 4 },
      { runId: dataWarehouseBigQuery.id, questionId: allScorecardQuestions[4].id, value: 5 },
      { runId: dataWarehouseBigQuery.id, questionId: allScorecardQuestions[5].id, value: 5 },
      { runId: dataWarehouseBigQuery.id, questionId: allScorecardQuestions[6].id, value: 4 },
      { runId: dataWarehouseBigQuery.id, questionId: allScorecardQuestions[7].id, value: 5 },
      { runId: dataWarehouseBigQuery.id, questionId: allScorecardQuestions[8].id, value: 4 },
      { runId: dataWarehouseBigQuery.id, questionId: allScorecardQuestions[9].id, value: 5 },
      { runId: dataWarehouseBigQuery.id, questionId: allScorecardQuestions[10].id, value: 5 },
      { runId: dataWarehouseBigQuery.id, questionId: allScorecardQuestions[11].id, value: 5 },
      { runId: dataWarehouseBigQuery.id, questionId: allScorecardQuestions[12].id, value: 5 },
      { runId: dataWarehouseBigQuery.id, questionId: allScorecardQuestions[13].id, value: 5 },
      { runId: dataWarehouseBigQuery.id, questionId: allScorecardQuestions[14].id, value: 4 },
      { runId: dataWarehouseBigQuery.id, questionId: allScorecardQuestions[15].id, value: 4 },
      { runId: dataWarehouseBigQuery.id, questionId: allScorecardQuestions[16].id, value: 4 },
      { runId: dataWarehouseBigQuery.id, questionId: allScorecardQuestions[17].id, value: 4 },
      { runId: dataWarehouseBigQuery.id, questionId: allScorecardQuestions[18].id, value: 4 },
      { runId: dataWarehouseBigQuery.id, questionId: allScorecardQuestions[19].id, value: 4 },
      { runId: dataWarehouseBigQuery.id, questionId: allScorecardQuestions[20].id, value: 3 },
      { runId: dataWarehouseBigQuery.id, questionId: allScorecardQuestions[21].id, value: 5 },
      { runId: dataWarehouseBigQuery.id, questionId: allScorecardQuestions[22].id, value: 5 },
    ],
  });

  await prisma.financialCost.createMany({
    data: [
      { entryId: dataWarehouseFinancialEntries[0].id, scorecardRunId: dataWarehouseBigQuery.id, amount: 25000 },
      { entryId: dataWarehouseFinancialEntries[1].id, scorecardRunId: dataWarehouseBigQuery.id, amount: 65000 },
      { entryId: dataWarehouseFinancialEntries[2].id, scorecardRunId: dataWarehouseBigQuery.id, amount: 95000 },
      { entryId: dataWarehouseFinancialEntries[3].id, scorecardRunId: dataWarehouseBigQuery.id, amount: 120000 },
      { entryId: dataWarehouseFinancialEntries[4].id, scorecardRunId: dataWarehouseBigQuery.id, amount: 35000 },
    ],
  });

  await prisma.scorecardOverview.create({
    data: {
      runId: dataWarehouseBigQuery.id,
      pros: 'Serverless architecture with no infrastructure management. Excellent integration with Google Cloud ecosystem. Strong ML/AI capabilities built-in. Competitive pricing for ad-hoc queries. Fast query performance. Good data transfer tooling.',
      cons: 'Less feature-rich than Snowflake for some enterprise use cases. Fewer third-party integrations. Some SQL dialect differences. Limited control over query optimization. Smaller partner ecosystem.',
      summary: 'BigQuery offers excellent value with strong technical capabilities and best-in-class pricing. Particularly attractive for Google Cloud users. While slightly behind Snowflake in some advanced features, the cost advantage and serverless model make it highly competitive.',
    },
  });

  const dataWarehouseRedshift = await prisma.scorecardRun.create({
    data: {
      projectId: dataWarehouseProject.id,
      name: 'Amazon Redshift',
      createdAt: new Date('2024-01-19'),
    },
  });

  await prisma.scorecardScore.createMany({
    data: [
      { runId: dataWarehouseRedshift.id, questionId: allScorecardQuestions[0].id, value: 4 },
      { runId: dataWarehouseRedshift.id, questionId: allScorecardQuestions[1].id, value: 4 },
      { runId: dataWarehouseRedshift.id, questionId: allScorecardQuestions[2].id, value: 4 },
      { runId: dataWarehouseRedshift.id, questionId: allScorecardQuestions[3].id, value: 4 },
      { runId: dataWarehouseRedshift.id, questionId: allScorecardQuestions[4].id, value: 4 },
      { runId: dataWarehouseRedshift.id, questionId: allScorecardQuestions[5].id, value: 4 },
      { runId: dataWarehouseRedshift.id, questionId: allScorecardQuestions[6].id, value: 4 },
      { runId: dataWarehouseRedshift.id, questionId: allScorecardQuestions[7].id, value: 5 },
      { runId: dataWarehouseRedshift.id, questionId: allScorecardQuestions[8].id, value: 4 },
      { runId: dataWarehouseRedshift.id, questionId: allScorecardQuestions[9].id, value: 5 },
      { runId: dataWarehouseRedshift.id, questionId: allScorecardQuestions[10].id, value: 5 },
      { runId: dataWarehouseRedshift.id, questionId: allScorecardQuestions[11].id, value: 5 },
      { runId: dataWarehouseRedshift.id, questionId: allScorecardQuestions[12].id, value: 5 },
      { runId: dataWarehouseRedshift.id, questionId: allScorecardQuestions[13].id, value: 5 },
      { runId: dataWarehouseRedshift.id, questionId: allScorecardQuestions[14].id, value: 4 },
      { runId: dataWarehouseRedshift.id, questionId: allScorecardQuestions[15].id, value: 3 },
      { runId: dataWarehouseRedshift.id, questionId: allScorecardQuestions[16].id, value: 3 },
      { runId: dataWarehouseRedshift.id, questionId: allScorecardQuestions[17].id, value: 4 },
      { runId: dataWarehouseRedshift.id, questionId: allScorecardQuestions[18].id, value: 3 },
      { runId: dataWarehouseRedshift.id, questionId: allScorecardQuestions[19].id, value: 3 },
      { runId: dataWarehouseRedshift.id, questionId: allScorecardQuestions[20].id, value: 3 },
      { runId: dataWarehouseRedshift.id, questionId: allScorecardQuestions[21].id, value: 4 },
      { runId: dataWarehouseRedshift.id, questionId: allScorecardQuestions[22].id, value: 4 },
    ],
  });

  await prisma.financialCost.createMany({
    data: [
      { entryId: dataWarehouseFinancialEntries[0].id, scorecardRunId: dataWarehouseRedshift.id, amount: 35000 },
      { entryId: dataWarehouseFinancialEntries[1].id, scorecardRunId: dataWarehouseRedshift.id, amount: 75000 },
      { entryId: dataWarehouseFinancialEntries[2].id, scorecardRunId: dataWarehouseRedshift.id, amount: 110000 },
      { entryId: dataWarehouseFinancialEntries[3].id, scorecardRunId: dataWarehouseRedshift.id, amount: 145000 },
      { entryId: dataWarehouseFinancialEntries[4].id, scorecardRunId: dataWarehouseRedshift.id, amount: 38000 },
    ],
  });

  await prisma.scorecardOverview.create({
    data: {
      runId: dataWarehouseRedshift.id,
      pros: 'Deep AWS integration and ecosystem. Mature product with long track record. Good performance for structured queries. Familiar PostgreSQL-compatible SQL. Strong AWS support. Predictable reserved instance pricing.',
      cons: 'More complex to manage than serverless alternatives. Requires capacity planning and cluster management. Less innovative than newer platforms. Performance tuning requires expertise. Concurrency limitations compared to Snowflake.',
      summary: 'Redshift is a solid, mature data warehouse with strong AWS integration. However, it requires more operational overhead than modern alternatives and lacks some of the innovative features of Snowflake or BigQuery. Best suited for AWS-committed organizations.',
    },
  });

  // Project 4: Collaboration Tool - Failed gating
  const collaborationProject = await prisma.project.create({
    data: {
      name: 'Team Collaboration Platform',
      createdAt: new Date('2024-02-10'),
    },
  });

  const collaborationGatingRun = await prisma.gatingRun.create({
    data: {
      projectId: collaborationProject.id,
      createdAt: new Date('2024-02-10'),
      answers: {
        create: [
          { questionId: allGateQuestions[0].id, value: false },
          { questionId: allGateQuestions[1].id, value: false },
          { questionId: allGateQuestions[2].id, value: false },
          { questionId: allGateQuestions[3].id, value: false },
          { questionId: allGateQuestions[4].id, value: false },
          { questionId: allGateQuestions[5].id, value: false },
          { questionId: allGateQuestions[6].id, value: false },
          { questionId: allGateQuestions[7].id, value: false },
          { questionId: allGateQuestions[8].id, value: true },
          { questionId: allGateQuestions[9].id, value: false },
          { questionId: allGateQuestions[10].id, value: false },
        ],
      },
    },
  });

  // Project 5: Analytics Platform - In progress
  const analyticsProject = await prisma.project.create({
    data: {
      name: 'Business Intelligence & Analytics Platform',
      createdAt: new Date('2024-02-15'),
    },
  });

  await prisma.projectFinancialSettings.create({
    data: {
      projectId: analyticsProject.id,
      currency: 'EUR',
    },
  });

  const analyticsGatingRun = await prisma.gatingRun.create({
    data: {
      projectId: analyticsProject.id,
      createdAt: new Date('2024-02-15'),
      answers: {
        create: [
          { questionId: allGateQuestions[0].id, value: true },
          { questionId: allGateQuestions[1].id, value: false },
          { questionId: allGateQuestions[2].id, value: true },
          { questionId: allGateQuestions[3].id, value: false },
          { questionId: allGateQuestions[4].id, value: true },
          { questionId: allGateQuestions[5].id, value: true },
          { questionId: allGateQuestions[6].id, value: true },
          { questionId: allGateQuestions[7].id, value: false },
          { questionId: allGateQuestions[8].id, value: false },
          { questionId: allGateQuestions[9].id, value: true },
          { questionId: allGateQuestions[10].id, value: true },
        ],
      },
    },
  });

  const analyticsFinancialEntries = await Promise.all([
    prisma.financialEntry.create({
      data: {
        projectId: analyticsProject.id,
        name: 'Platform License',
        category: 'IMPLEMENTATION_CAPEX',
        order: 1,
      },
    }),
    prisma.financialEntry.create({
      data: {
        projectId: analyticsProject.id,
        name: 'Implementation',
        category: 'IMPLEMENTATION_OPEX',
        order: 2,
      },
    }),
    prisma.financialEntry.create({
      data: {
        projectId: analyticsProject.id,
        name: 'Annual Subscription',
        category: 'ONGOING_OPEX',
        order: 3,
      },
    }),
  ]);

  const analyticsPowerBI = await prisma.scorecardRun.create({
    data: {
      projectId: analyticsProject.id,
      name: 'Microsoft Power BI',
      createdAt: new Date('2024-02-18'),
    },
  });

  await prisma.scorecardScore.createMany({
    data: [
      { runId: analyticsPowerBI.id, questionId: allScorecardQuestions[0].id, value: 4 },
      { runId: analyticsPowerBI.id, questionId: allScorecardQuestions[1].id, value: 4 },
      { runId: analyticsPowerBI.id, questionId: allScorecardQuestions[2].id, value: 4 },
      { runId: analyticsPowerBI.id, questionId: allScorecardQuestions[3].id, value: 5 },
      { runId: analyticsPowerBI.id, questionId: allScorecardQuestions[4].id, value: 4 },
      { runId: analyticsPowerBI.id, questionId: allScorecardQuestions[5].id, value: 4 },
      { runId: analyticsPowerBI.id, questionId: allScorecardQuestions[6].id, value: 4 },
      { runId: analyticsPowerBI.id, questionId: allScorecardQuestions[7].id, value: 5 },
      { runId: analyticsPowerBI.id, questionId: allScorecardQuestions[8].id, value: 4 },
      { runId: analyticsPowerBI.id, questionId: allScorecardQuestions[9].id, value: 4 },
      { runId: analyticsPowerBI.id, questionId: allScorecardQuestions[10].id, value: 5 },
      { runId: analyticsPowerBI.id, questionId: allScorecardQuestions[11].id, value: 4 },
      { runId: analyticsPowerBI.id, questionId: allScorecardQuestions[12].id, value: 4 },
      { runId: analyticsPowerBI.id, questionId: allScorecardQuestions[13].id, value: 5 },
    ],
  });

  await prisma.financialCost.createMany({
    data: [
      { entryId: analyticsFinancialEntries[0].id, scorecardRunId: analyticsPowerBI.id, amount: 8000 },
      { entryId: analyticsFinancialEntries[1].id, scorecardRunId: analyticsPowerBI.id, amount: 35000 },
      { entryId: analyticsFinancialEntries[2].id, scorecardRunId: analyticsPowerBI.id, amount: 24000 },
    ],
  });

  const analyticsTableau = await prisma.scorecardRun.create({
    data: {
      projectId: analyticsProject.id,
      name: 'Tableau',
      createdAt: new Date('2024-02-20'),
    },
  });

  console.log('Production seeding completed successfully!');
  console.log('- 5 realistic projects created:');
  console.log('  1. Enterprise CRM Migration (2 complete scorecards with financials)');
  console.log('  2. Marketing Automation Platform (2 complete scorecards with financials)');
  console.log('  3. Cloud Data Warehouse Modernization (3 complete scorecards with financials)');
  console.log('  4. Team Collaboration Platform (failed gating - no scorecards)');
  console.log('  5. Business Intelligence & Analytics Platform (1 partial + 1 empty scorecard)');
}

main()
  .catch((e) => {
    console.error('Error seeding production data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
