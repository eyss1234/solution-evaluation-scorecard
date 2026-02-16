-- AlterTable
ALTER TABLE "scorecard_scores" ADD COLUMN     "comment" TEXT;

-- CreateTable
CREATE TABLE "scorecard_overviews" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "pros" TEXT,
    "cons" TEXT,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scorecard_overviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "scorecard_overviews_runId_key" ON "scorecard_overviews"("runId");

-- AddForeignKey
ALTER TABLE "scorecard_overviews" ADD CONSTRAINT "scorecard_overviews_runId_fkey" FOREIGN KEY ("runId") REFERENCES "scorecard_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
