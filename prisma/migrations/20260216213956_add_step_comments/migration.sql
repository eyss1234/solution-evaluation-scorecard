-- CreateTable
CREATE TABLE "scorecard_step_comments" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scorecard_step_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "scorecard_step_comments_runId_stepNumber_key" ON "scorecard_step_comments"("runId", "stepNumber");

-- AddForeignKey
ALTER TABLE "scorecard_step_comments" ADD CONSTRAINT "scorecard_step_comments_runId_fkey" FOREIGN KEY ("runId") REFERENCES "scorecard_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
