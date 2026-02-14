-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gate_questions" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gate_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gating_runs" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gating_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gating_answers" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gating_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scorecard_questions" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "criteria" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scorecard_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scorecard_runs" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scorecard_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scorecard_scores" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scorecard_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gate_questions_order_key" ON "gate_questions"("order");

-- CreateIndex
CREATE UNIQUE INDEX "gating_answers_runId_questionId_key" ON "gating_answers"("runId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "scorecard_questions_stepNumber_order_key" ON "scorecard_questions"("stepNumber", "order");

-- CreateIndex
CREATE UNIQUE INDEX "scorecard_scores_runId_questionId_key" ON "scorecard_scores"("runId", "questionId");

-- AddForeignKey
ALTER TABLE "gating_runs" ADD CONSTRAINT "gating_runs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gating_answers" ADD CONSTRAINT "gating_answers_runId_fkey" FOREIGN KEY ("runId") REFERENCES "gating_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gating_answers" ADD CONSTRAINT "gating_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "gate_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scorecard_runs" ADD CONSTRAINT "scorecard_runs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scorecard_scores" ADD CONSTRAINT "scorecard_scores_runId_fkey" FOREIGN KEY ("runId") REFERENCES "scorecard_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scorecard_scores" ADD CONSTRAINT "scorecard_scores_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "scorecard_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
