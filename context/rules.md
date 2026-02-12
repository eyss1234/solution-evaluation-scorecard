# Windsurf Rules — Next.js (App Router) + TypeScript + Tailwind + Prisma + Postgres (POC)

## Project Intent
This is a proof-of-concept “Solution Evaluation Scorecard” app.
- First screen is **gating questions** (yes/no)
- If **any** answer is true → proceed to scorecard
- Otherwise stop
- Persist runs and scorecard data in **Postgres** via **Prisma**
- Keep everything small, readable, and easy to demo


## Non-Negotiable Best Practices
1. **TypeScript everywhere** (no `any`, no implicit `any`)
2. **App Router only** (no `/pages` directory)
3. **Keep domain logic pure**
   - Scoring and gating evaluation must be pure functions in `/domain`
   - No Prisma/Next imports in domain modules
4. **Server is the source of truth**
   - Validation and persistence happen in route handlers
   - Client never directly calls Prisma
5. **Prefer simple patterns**
   - Avoid premature abstractions, DI frameworks, complex state libs
6. **Secure-by-default**
   - Never trust client input
   - Validate with Zod on server routes


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


### Conventions

- `/domain/**`
  - Contains **pure TypeScript logic and types**
  - No Next.js or Prisma imports
  - Business logic (gating + scoring) lives here

- `/lib/db.ts`
  - Prisma client singleton
  - The only place where `PrismaClient` is instantiated

- `/app/api/**`
  - Contains Next.js Route Handlers
  - Server-only code
  - Responsible for validation, DB access, and returning JSON responses


---

## Next.js App Router Conventions
- Prefer **Server Components by default**
- Use `"use client"` only for interactive components (forms, toggles)
- Data fetching:
  - Server Components call DB (via server functions) **or**
  - Client Components call `/api/*` routes (fetch)
- Redirect logic:
  - Gating submit: create run on server → redirect to `/stop/[runId]` or `/scorecard/[runId]`

---

## Tailwind Conventions
- Use Tailwind utility classes for layout and spacing
- Keep styles simple and consistent:
  - Use a centered container, readable typography, clear buttons
- Prefer extracting repeated UI into small components:
  - `Button`, `Card`, `Field`, etc. (lightweight; no design system required)

---

### Prisma Client Singleton
- Create `/lib/db.ts` and reuse a single PrismaClient instance
- Never instantiate PrismaClient in request handlers repeatedly

---

## Data & Modeling Rules (POC)
Keep the DB minimal and demo-friendly:
- Persist:
  - `GateQuestion` (seeded)
  - `GatingRun`
  - `GatingAnswer`
  - Basic scorecard entities (seeded or minimal CRUD): `Criterion`, `SolutionOption`, `ScorecardRun`, `Score`

Prefer:
- IDs as `cuid()` or `uuid()`
- `createdAt` timestamps on run entities
- Unique constraints where obvious (e.g., one score per solution+criterion per run)

---


## API Route Handler Best Practices
- Use Route Handlers under `/app/api/*/route.ts`
- Always:
  - Parse JSON body safely
  - Validate using Zod schemas
  - Return consistent JSON structures
  - Handle errors with clear status codes


### Recommended Response Shape
- Success: `{ ok: true, data: ... }`
- Error: `{ ok: false, error: { message, code?, details? } }`


---


## Validation Rules
- Server-side validation is required for:
  - Gating answers shape and IDs
  - Score values range (e.g. 1–5)
  - Weight values and totals (if applicable)
- Client-side validation is optional but helpful for UX


---


## Domain Logic Rules
### Gating
- Rule: proceed if any answer is true
- Domain function signature should be explicit, typed, and testable


### Scorecard
- Use simple weighted sum for POC
- Keep normalization rules explicit (even if trivial)


---


## Error Handling & UX
- Show friendly error states in UI (no raw stack traces)
- Don’t block the demo if data is missing:
  - Provide seeds for GateQuestions
  - Provide default criteria/solutions for scorecard


---


## Testing (Lightweight for POC)
- At minimum:
  - Unit tests for domain functions (gating + scoring)
- Optional:
  - One happy-path e2e test for gating → scorecard


---


## Code Quality Guardrails
- No business logic in React components beyond basic formatting
- Avoid large components (>200 lines) — split into smaller ones
- Keep route handlers small; move DB calls into helper functions if needed
- Prefer clear names over clever abstractions


---


## Documentation
- Keep `README.md` simple:
  - setup steps
  - run migrations + seed
  - start dev server
  - demo flow (gating → stop/scorecard)


---


## “Do / Don’t” Summary
### Do
- Keep it minimal and demo-ready
- Use typed domain functions
- Persist runs in Postgres via Prisma
- Seed gating questions


### Don’t
- Add auth, roles, orgs (unless required)
- Introduce complex state management
- Mix DB code into client components
- Over-engineer the scoring model for POC