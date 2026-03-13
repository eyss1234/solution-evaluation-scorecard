# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start Next.js dev server at localhost:3000
npm run build        # Production build (also runs prisma generate)
npm run lint         # ESLint

# Database
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema changes to database (no migration files)
npm run db:seed      # Seed with gate/scorecard questions (development)
npm run db:seed:prod # Seed production database
npm run db:studio    # Open Prisma Studio

# Testing
npm test             # Run Vitest unit tests
npm run test:ui      # Run tests with Vitest UI
```

To run a single test file: `npx vitest run tests/domain/gating/evaluate.test.ts`

## Architecture

This is a Next.js 15 App Router application using TypeScript, Tailwind CSS, PostgreSQL + Prisma ORM.

### Key Architectural Principle: Domain Isolation

`/domain` contains pure TypeScript business logic with **no framework dependencies**:
- `domain/gating/evaluate.ts` — gating pass/fail logic
- `domain/scorecard/calculate.ts` — weighted score calculation
- `domain/scorecard/compare.ts` — multi-run comparison
- `domain/financial/calculate.ts` — financial totals by category

All domain functions are pure and fully unit-tested in `tests/domain/`.

### User Flow

1. **Home** (`/`) → User creates/selects a Project
2. **Gating** (`/project/[projectId]/gate`) → Answers 3 yes/no questions; if ANY is "Yes" → creates ScorecardRun; if ALL "No" → stop
3. **Scorecard** (`/scorecard/[runId]`) → 7-step scorecard (Steps 1-6 have weighted questions on 0-5 scale; Step 7 is optional Overview)
4. **Project** (`/project/[projectId]`) → Manage multiple ScorecardRuns and financial comparisons

### Scorecard Steps (defined in `lib/steps.ts`)

| Step | Name | Section Weight |
|------|------|---------------|
| 1 | Business & Functional Fit | 30% |
| 2 | Technical & Architectural Fit | 20% |
| 3 | Vendor & Roadmap Assessment | 10% |
| 4 | Delivery Feasibility | 15% |
| 5 | User Experience & Adoption | 10% |
| 6 | Commercials & Total Cost of Ownership | 15% |
| 7 | Overview (pros/cons/summary) | Optional, 0% |

Scoring: questions are 0-5, weighted within sections, then sections are weighted to produce a 0-100 overall score.

### State Management

`ScorecardContext` (`contexts/ScorecardContext.tsx`) holds in-memory scores/comments/overview for the active scorecard session. Scores are persisted via API calls from components (save-on-navigate pattern).

### API Routes

All under `app/api/`:
- `GET /api/gating/questions` — fetch gate questions
- `POST /api/gating/run` — submit gating answers, returns `{ runId, shouldProceed }`
- `GET /api/gating/run/[runId]` — fetch a gating run
- `GET/POST /api/projects` — list/create projects
- `GET/PATCH/DELETE /api/projects/[projectId]` — project CRUD
- `GET/POST /api/scorecard` — list/create scorecard runs
- `POST /api/scorecard/[runId]/save` — save step scores + comment
- `POST /api/scorecard/[runId]/save-overview` — save overview
- `POST /api/scorecard/[runId]/submit` — finalize run
- `GET /api/scorecard/[runId]/export-data` — fetch data for PDF export
- `POST /api/scorecard/[runId]/generate-overview` — AI-generated overview
- `GET/POST /api/projects/[projectId]/financial` — financial entries and costs

### Database Models (`prisma/schema.prisma`)

- **Project** — top-level container; has many GatingRuns, ScorecardRuns, FinancialEntries
- **GateQuestion** / **GatingRun** / **GatingAnswer** — gating flow
- **ScorecardQuestion** / **ScorecardRun** / **ScorecardScore** — scorecard scoring
- **ScorecardOverview** / **ScorecardStepComment** — optional narrative fields
- **FinancialEntry** / **FinancialCost** / **ProjectFinancialSettings** — financial comparison across runs

### PDF Export

`lib/pdf-export.ts` uses `jspdf` + `jspdf-autotable` to generate scorecards and project-level comparison PDFs. Export data is fetched from `/api/scorecard/[runId]/export-data`.

### Path Alias

`@/` resolves to the project root (configured in `tsconfig.json` and `vitest.config.ts`).

## Environment

Requires a `.env` file with:
```
DATABASE_URL="postgresql://user:password@localhost:5432/scorecard_db?schema=public"
```
