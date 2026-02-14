# Solution Evaluation Scorecard — POC Architecture (Next.js + TS + Tailwind + Prisma + Postgres)

## Goal
A proof-of-concept web app that:
1) asks a short set of **yes/no gating questions**
2) if **any** answer is **Yes**, continues to a basic scorecard flow
3) if **all** answers are **No**, stops

The POC stays small and demo-friendly, but persists data in **Postgres** via **Prisma**.

---

## Tech Stack
- **Next.js (App Router)** + **React** + **TypeScript**
- **Tailwind CSS**
- **PostgreSQL**
- **Prisma**
- **Zod** (recommended) for server-side validation
- **Testing:** Vitest (unit) + Playwright (optional e2e)

---

## User Flow
1. **Start (/):** user answers gating questions (Yes/No)
2. Submit:
   - Create a `GatingRun` + `GatingAnswer[]`
   - If **ANY Yes** → redirect to `/scorecard/[runId]`
   - If **ALL No** → redirect to `/stop/[runId]`
3. **Stop (/stop/[runId]):** “No scorecard needed” + restart link
4. **Scorecard (/scorecard/[runId]):** simple scoring demo tied to the gating run

---

## Pages
- `/` — Gating questions form
- `/stop/[runId]` — Stop screen for a run
- `/scorecard/[runId]` — Scorecard screen for a run

---

## Minimal API
Use Next.js Route Handlers.

### Gating
- `POST /api/gating/run`
  - body: answers
  - creates run + answers
  - returns `{ runId, shouldProceed }`
- `GET /api/gating/run/[runId]`
  - returns run + answers (for stop/scorecard pages)

### Scorecard (POC)
- `PUT /api/scorecard/[runId]/scores`
  - bulk upsert scores for a run
- `GET /api/scorecard/[runId]/results`
  - compute weighted results (compute-on-read)

---

## Domain Logic (Pure TypeScript)
Keep logic in `/domain` (no Next.js/Prisma imports).

### Gating rule
Proceed if **any** answer is true:
- `shouldProceed = answers.some(a => a.value === true)`

### Scorecard rule (POC)
Simple weighted sum:
- `total(solution) = Σ(weight(criterion) * score(solution, criterion))`

---

## Database (Simple Prisma Schema)
Keep tables minimal and seeded for a smooth demo.

### Core
- `GateQuestion` (seeded)
- `GatingRun`
- `GatingAnswer`

### Scorecard (POC)
- `Criterion` (seeded or minimal CRUD)
- `SolutionOption` (seeded or minimal CRUD)
- `ScorecardRun` (1:1 with `GatingRun` for POC simplicity, or created on demand)
- `Score` (one per solution+criterion per scorecard run)

---

## Folder & Module Conventions
Use the following structure and keep it consistent across the project:
/app
/page.tsx
/stop/[runId]/page.tsx
/scorecard/[runId]/page.tsx
/api/...
/components
/domain
/lib
/prisma
/tests


### Conventions
- `/domain/**`
  - Contains **pure TypeScript logic and types**
  - No Next.js or Prisma imports
  - Business logic (gating + scoring) lives here

- `/lib/db.ts`
  - Prisma client singleton
  - The only place where `PrismaClient` is instantiated

- `/app/api/**`
  - Next.js Route Handlers (server-only)
  - Responsible for validation (Zod), DB access, and JSON responses

- `/prisma/**`
  - `schema.prisma`, migrations, and `seed.ts`

- `/tests/**`
  - Unit tests (Vitest) for domain logic
  - Optional e2e tests (Playwright) for the happy path

---

## Basic Testing (POC)
Keep testing lightweight but meaningful.

### Unit tests (required)
Use **Vitest** to test pure functions in `/domain`:
- `domain/gating/evaluate.test.ts`
  - proceeds when any answer is true
  - stops when all answers are false
- `domain/scorecard/compute.test.ts`
  - weighted sum produces expected ranking
  - handles missing scores (define POC behavior: error/zero)

### Integration sanity (recommended)
A small integration test around route handlers is optional; if added:
- call `POST /api/gating/run` with sample answers
- assert it creates a run and returns `runId` + correct `shouldProceed`

### E2E test (optional)
Use **Playwright** for one demo path:
- load `/`
- answer one “Yes”
- submit and confirm redirect to `/scorecard/[runId]`

---

## Out of Scope (POC)
- Authentication / roles
- Multi-org
- Complex scoring methods (AHP, sensitivity)
- PDF exports

---

## POC Milestones
1. Tailwind + layout shell
2. Postgres + Prisma schema + seed GateQuestions
3. Gating page → create run → redirect to stop/scorecard
4. Scorecard page stub → save scores → show computed results
5. Unit tests for gating + scoring