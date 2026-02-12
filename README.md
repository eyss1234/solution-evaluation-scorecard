# Solution Evaluation Scorecard - POC

A proof-of-concept web application for solution evaluation with gating questions and scorecard functionality.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **PostgreSQL**
- **Prisma ORM**
- **Zod** (validation)
- **Vitest** (unit testing)

## Project Structure

```
/app                    # Next.js App Router pages and API routes
  /api                  # API route handlers
  /stop/[runId]         # Stop page (when gating fails)
  /scorecard/[runId]    # Scorecard page (when gating passes)
  page.tsx              # Home page with gating questions
/components             # React components
/domain                 # Pure TypeScript domain logic
  /gating               # Gating evaluation logic
/lib                    # Shared utilities
  db.ts                 # Prisma client singleton
/prisma                 # Database schema and migrations
  schema.prisma         # Prisma schema
  seed.ts               # Database seed script
/tests                  # Unit tests
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and set your PostgreSQL connection string:

```
DATABASE_URL="postgresql://user:password@localhost:5432/scorecard_db?schema=public"
```

3. **Set up the database:**

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database with gate questions
npm run db:seed
```

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing

Run unit tests:

```bash
npm test
```

Run tests with UI:

```bash
npm run test:ui
```

## User Flow

1. **Home Page (`/`)**: User answers 3 yes/no gating questions
2. **Submit**: Creates a `GatingRun` with answers in the database
3. **Redirect**:
   - If **ANY** answer is "Yes" → `/scorecard/[runId]`
   - If **ALL** answers are "No" → `/stop/[runId]`
4. **Result Pages**: Display the run details and answers

## Gating Logic

The gating evaluation follows a simple rule:

- **Proceed to scorecard**: If ANY answer is true
- **Stop**: If ALL answers are false

This logic is implemented as a pure function in `/domain/gating/evaluate.ts` and is fully tested.

## API Routes

### `GET /api/gating/questions`
Fetch all gate questions (ordered)

### `POST /api/gating/run`
Create a new gating run with answers

**Request body:**
```json
{
  "answers": [
    { "questionId": "...", "value": true },
    { "questionId": "...", "value": false }
  ]
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "runId": "...",
    "shouldProceed": true,
    "answeredYes": 1,
    "totalQuestions": 3
  }
}
```

### `GET /api/gating/run/[runId]`
Fetch a specific gating run with answers

## Database Schema

### Models

- **GateQuestion**: Seeded questions for gating
- **GatingRun**: A single evaluation session
- **GatingAnswer**: User's answer to a specific question in a run

See `prisma/schema.prisma` for full schema details.

## Architecture Principles

Following the rules defined in `context/rules.md` and `context/architecture.md`:

1. **Domain logic is pure**: No framework dependencies in `/domain`
2. **Server is source of truth**: All validation and persistence in API routes
3. **TypeScript everywhere**: Strict typing, no `any`
4. **Minimal and focused**: POC-ready, no over-engineering

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with questions
- `npm run db:studio` - Open Prisma Studio
- `npm test` - Run unit tests
- `npm run test:ui` - Run tests with UI

## Next Steps (Future Iterations)

- Full scorecard functionality (criteria, solutions, scoring)
- Weighted scoring calculations
- Results visualization
- Export capabilities

## License

Private POC - Not for distribution
# solution-evaluation-scorecard
