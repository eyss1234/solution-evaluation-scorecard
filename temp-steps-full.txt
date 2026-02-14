export type ScoreValue = 0 | 1 | 2 | 3 | 4 | 5

export type ScoreCriterion = {
  score: ScoreValue
  description: string
}

export type ScorecardQuestion = {
  id: string
  sectionId: string
  question: string
  weight: number
  criteria: ScoreCriterion[]
}

export type ScorecardSection = {
  id: string
  title: string
  weight: number
}

export const SCORECARD_SECTIONS: ScorecardSection[] = [
  { id: "BFF", title: "Business & Functional Fit", weight: 30 },
  { id: "TAF", title: "Technical & Architectural Fit", weight: 20 },
  { id: "VRA", title: "Vendor & Roadmap Assessment", weight: 10 },
  { id: "DF", title: "Delivery Feasibility", weight: 15 },
  { id: "UXA", title: "User Experience & Adoption", weight: 10 },
  { id: "TCO", title: "Commercials & Total Cost of Ownership", weight: 15 }
]

const scale = (items: string[]): ScoreCriterion[] =>
  items.map((description, index) => ({
    score: index as ScoreValue,
    description
  }))

export const SCORECARD_QUESTIONS: ScorecardQuestion[] = [

  // ------------------------------------------------------------------
  // BUSINESS & FUNCTIONAL FIT (30)
  // ------------------------------------------------------------------

  {
    id: "BFF_01",
    sectionId: "BFF",
    weight: 20,
    question:
      "What proportion of our must-have requirements are met with out-of-the-box capabilities (or simple configuration), without custom development?",
    criteria: scale([
      "Cannot meet one or more must-haves at all.",
      "Meets few must-haves; extensive custom build required.",
      "Meets some must-haves; major workarounds/customization.",
      "Meets most must-haves; some gaps requiring manageable workarounds.",
      "Meets nearly all must-haves; only minor configuration/extensions.",
      "Meets all must-haves out-of-the-box or via straightforward configuration; no meaningful gaps."
    ])
  },

  {
    id: "BFF_02",
    sectionId: "BFF",
    weight: 5,
    question:
      "What proportion of our should-have requirements are met with out-of-the-box capabilities (or simple configuration), without custom development?",
    criteria: scale([
      "Cannot meet one or more should-haves at all.",
      "Meets few should-haves; extensive custom build required.",
      "Meets some should-haves; major workarounds/customization.",
      "Meets most should-haves; some gaps requiring manageable workarounds.",
      "Meets nearly all should-haves; only minor configuration/extensions.",
      "Meets all should-haves out-of-the-box or via straightforward configuration; no meaningful gaps."
    ])
  },

  {
    id: "BFF_03",
    sectionId: "BFF",
    weight: 5,
    question:
      "Is the solution viable for our expected future growth and change (users, volume, data, geographies, new capabilities, organizational changes), with minimal disruption and predictable effort/cost?",
    criteria: scale([
      "Not viable for expected growth/change; hard limits or architecture prevents scaling/adaptation.",
      "Very poor future readiness; scaling/adapting requires major replatforming or unacceptable risk.",
      "Partial viability; significant constraints and major compromises likely.",
      "Adequate; manageable constraints with mitigation.",
      "Good scalability and adaptability; minor constraints.",
      "Excellent scalability and adaptability with minimal disruption and strong governance."
    ])
  },

  // ------------------------------------------------------------------
  // TECHNICAL & ARCHITECTURAL FIT (20)
  // ------------------------------------------------------------------

  {
    id: "TAF_01",
    sectionId: "TAF",
    weight: 5,
    question:
      "Is the solution compatible with our existing technology stack and architecture patterns?",
    criteria: scale([
      "Not compatible; conflicts cannot be remediated.",
      "Very poor fit; major architectural exceptions required.",
      "Partial fit; major compromises required.",
      "Broadly compatible but requires some exceptions.",
      "Good fit; minor exceptions with clear mitigations.",
      "Excellent fit; fully aligned with required stack and patterns."
    ])
  },

  {
    id: "TAF_02",
    sectionId: "TAF",
    weight: 2.5,
    question:
      "Are the APIs/SDKs sufficient to integrate with our systems for all required operations (read/write), reliably and securely?",
    criteria: scale([
      "Required integrations not possible.",
      "Very limited API coverage; unstable or poorly documented.",
      "Some coverage; major gaps or workarounds needed.",
      "Adequate coverage; some feasible alternatives required.",
      "Broad coverage; minor gaps; good documentation.",
      "Comprehensive APIs, webhooks/events, strong documentation and support."
    ])
  },

  {
    id: "TAF_03",
    sectionId: "TAF",
    weight: 2.5,
    question:
      "Does it support enterprise identity needs (SSO, MFA, role mapping, provisioning/deprovisioning)?",
    criteria: scale([
      "Cannot meet identity/security requirements.",
      "Minimal identity features; weak controls.",
      "SSO works but provisioning/role mapping weak.",
      "SSO with basic provisioning; some role mapping gaps.",
      "Strong SSO, provisioning, granular roles; minor gaps.",
      "Full enterprise identity alignment with strong governance and auditing."
    ])
  },

  {
    id: "TAF_04",
    sectionId: "TAF",
    weight: 2.5,
    question:
      "Can we import/export data (including metadata/audit where needed) and integrate with BI/reporting tools effectively?",
    criteria: scale([
      "Data portability not possible or severely limited.",
      "Manual or partial export; major reporting constraints.",
      "Basic export/import; major BI or history limitations.",
      "Adequate export/import; some metadata/history gaps.",
      "Strong tooling; minor constraints; good BI integration.",
      "Excellent portability with automation, auditability, and robust BI integration."
    ])
  },

  {
    id: "TAF_05",
    sectionId: "TAF",
    weight: 2.5,
    question:
      "Can the vendor meet our uptime/resiliency expectations (HA/DR, incident comms, historical performance)?",
    criteria: scale([
      "Cannot meet minimum availability needs.",
      "Weak resilience; frequent or opaque outages.",
      "Some resilience but major concerns remain.",
      "Acceptable uptime; some limitations.",
      "Strong uptime and DR; minor gaps.",
      "Proven resilience with strong incident transparency and history."
    ])
  },

  {
    id: "TAF_06",
    sectionId: "TAF",
    weight: 2.5,
    question:
      "Does the vendor provide mature migration tooling and a credible cutover/validation approach?",
    criteria: scale([
      "Migration path unclear or unworkable.",
      "Mostly manual migration; high error risk.",
      "Some tooling; major validation gaps.",
      "Adequate tooling; some manual steps.",
      "Strong tooling; minor gaps; good reconciliation support.",
      "End-to-end migration playbooks with validation tooling and proven approach."
    ])
  },

  {
    id: "TAF_07",
    sectionId: "TAF",
    weight: 2.5,
    question:
      "Can we exit cleanly (export data + metadata/config, reasonable costs, clear offboarding process)?",
    criteria: scale([
      "Exit not feasible or highly punitive.",
      "Major lock-in; exports incomplete or expensive.",
      "Partial export; major metadata/history gaps.",
      "Adequate export; some manual effort required.",
      "Strong export; minor constraints.",
      "Clean offboarding with automated exports and clear documentation."
    ])
  },

  // ------------------------------------------------------------------
  // VENDOR & ROADMAP (10)
  // ------------------------------------------------------------------

  {
    id: "VRA_01",
    sectionId: "VRA",
    weight: 2.5,
    question:
      "Does the support model meet our needs (coverage, response/resolution, escalation, expertise)?",
    criteria: scale([
      "Support does not meet minimum needs.",
      "Poor responsiveness; limited escalation.",
      "Partial coverage; major compromises.",
      "Adequate support; some gaps.",
      "Strong support; minor gaps.",
      "Excellent enterprise support with clear SLAs and strong escalation."
    ])
  },

  {
    id: "VRA_02",
    sectionId: "VRA",
    weight: 2.5,
    question:
      "Are releases predictable and safe (communications, release notes, backward compatibility, maintenance windows)?",
    criteria: scale([
      "Uncontrolled changes; unacceptable risk.",
      "Poor communications; frequent breaking changes.",
      "Some process; major risks remain.",
      "Adequate governance; occasional surprises.",
      "Good release discipline; minor issues.",
      "Mature release governance with strong backward compatibility."
    ])
  },

  {
    id: "VRA_03",
    sectionId: "VRA",
    weight: 2.5,
    question:
      "Does the vendor roadmap align with our strategic needs?",
    criteria: scale([
      "Roadmap conflicts with our strategy.",
      "Little alignment; uncertain direction.",
      "Partial alignment; major gaps.",
      "Adequate alignment; some gaps.",
      "Strong alignment; minor gaps.",
      "Excellent alignment with demonstrated delivery track record."
    ])
  },

  {
    id: "VRA_04",
    sectionId: "VRA",
    weight: 2.5,
    question:
      "Does the vendor demonstrate stability and strong references in similar deployments?",
    criteria: scale([
      "Unacceptable risk; no credible references.",
      "High risk; weak references.",
      "Some evidence but major concerns.",
      "Adequate confidence; some concerns.",
      "Strong confidence; minor concerns.",
      "Very strong confidence with multiple high-quality references."
    ])
  },

  // ------------------------------------------------------------------
  // DELIVERY FEASIBILITY (15)
  // ------------------------------------------------------------------

  {
    id: "DF_01",
    sectionId: "DF",
    weight: 5,
    question:
      "How achievable is implementation within our target timeline and resource constraints?",
    criteria: scale([
      "Not feasible within constraints.",
      "High risk; unrealistic plan.",
      "Significant risk; major dependencies.",
      "Feasible with some risks.",
      "Low risk; clear plan.",
      "Highly predictable delivery with proven methodology."
    ])
  },

  {
    id: "DF_02",
    sectionId: "DF",
    weight: 5,
    question:
      "How achievable is rollout from a business perspective?",
    criteria: scale([
      "Business rollout not feasible.",
      "Very high change burden; high risk.",
      "Significant change effort required.",
      "Moderate change effort; manageable risks.",
      "Low change burden; good enablement.",
      "Minimal disruption with strong rollout approach."
    ])
  },

  {
    id: "DF_03",
    sectionId: "DF",
    weight: 2.5,
    question:
      "Do we have adequate skills and capacity to implement and operate the solution effectively?",
    criteria: scale([
      "No viable skills/capacity plan.",
      "Significant skills gaps; heavy reliance on consultants.",
      "Some skills exist but major gaps remain.",
      "Mostly adequate; manageable gaps.",
      "Good capability; minor gaps.",
      "Proven capability and sustainable operating model."
    ])
  },

  {
    id: "DF_04",
    sectionId: "DF",
    weight: 2.5,
    question:
      "Does the vendor provide mature migration tooling and a credible cutover/validation approach?",
    criteria: scale([
      "Migration path unclear or unworkable.",
      "Mostly manual; high risk.",
      "Some tooling; major validation gaps.",
      "Adequate tooling; some manual steps.",
      "Strong tooling; minor gaps.",
      "End-to-end migration playbooks with validation tooling."
    ])
  },

  // ------------------------------------------------------------------
  // USER EXPERIENCE & ADOPTION (10)
  // ------------------------------------------------------------------

  {
    id: "UXA_01",
    sectionId: "UXA",
    weight: 2.5,
    question:
      "What is the expected training effort and change impact to achieve adoption?",
    criteria: scale([
      "Adoption unlikely; training impractical.",
      "Very high training burden.",
      "Significant change effort required.",
      "Moderate training; standard change management.",
      "Low training burden; good guidance.",
      "Minimal training with strong in-app adoption tooling."
    ])
  },

  {
    id: "UXA_02",
    sectionId: "UXA",
    weight: 2.5,
    question:
      "Does it fit how users work, reducing reliance on email/spreadsheets?",
    criteria: scale([
      "Conflicts with working patterns.",
      "High friction; external tools persist.",
      "Usable but major compromises.",
      "Adequate fit; some friction.",
      "Good fit; minor friction.",
      "Excellent fit that materially improves daily work."
    ])
  },

  {
    id: "UXA_03",
    sectionId: "UXA",
    weight: 5,
    question:
      "How intuitive is the UX for completing core tasks with minimal training?",
    criteria: scale([
      "Unusable for core tasks.",
      "High friction; heavy training required.",
      "Usable but confusing.",
      "Generally usable; some friction.",
      "Easy for most users.",
      "Highly intuitive with minimal training."
    ])
  },

  // ------------------------------------------------------------------
  // COMMERCIALS & TCO (15)
  // ------------------------------------------------------------------

  {
    id: "TCO_01",
    sectionId: "TCO",
    weight: 5,
    question:
      "Is pricing transparent, predictable at scale, and aligned to value?",
    criteria: scale([
      "Pricing unacceptable or opaque.",
      "High unpredictability; hidden costs.",
      "Some clarity but exposure to overages.",
      "Reasonably clear; manageable variables.",
      "Transparent; minor variables.",
      "Very transparent with strong cost governance."
    ])
  },

  {
    id: "TCO_02",
    sectionId: "TCO",
    weight: 5,
    question:
      "Is the business value clear and measurable, supported by evidence?",
    criteria: scale([
      "No credible value case.",
      "Weak or aspirational claims only.",
      "Partial value case; major assumptions.",
      "Reasonable value case; some assumptions.",
      "Strong value case with credible metrics.",
      "Compelling value case with proven outcomes and measurement plan."
    ])
  },

  {
    id: "TCO_03",
    sectionId: "TCO",
    weight: 5,
    question:
      "How competitive is the 3-year TCO including licensing, implementation, integrations, support, and internal effort?",
    criteria: scale([
      "Not economically viable.",
      "Significantly worse than alternatives.",
      "Higher cost; major compromises needed.",
      "Comparable; depends on mitigating gaps.",
      "Strong value; minor cost concerns.",
      "Best overall value with clear ROI and minimal hidden costs."
    ])
  }

]