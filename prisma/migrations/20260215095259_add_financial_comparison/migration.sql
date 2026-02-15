-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('GBP', 'USD', 'EUR');

-- CreateEnum
CREATE TYPE "CostCategory" AS ENUM ('IMPLEMENTATION_CAPEX', 'IMPLEMENTATION_OPEX', 'ONGOING_CAPEX', 'ONGOING_OPEX');

-- AlterTable
ALTER TABLE "scorecard_runs" ADD COLUMN     "name" TEXT;

-- CreateTable
CREATE TABLE "project_financial_settings" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'GBP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_financial_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_entries" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "CostCategory" NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_costs" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "scorecardRunId" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_costs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_financial_settings_projectId_key" ON "project_financial_settings"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "financial_costs_entryId_scorecardRunId_key" ON "financial_costs"("entryId", "scorecardRunId");

-- AddForeignKey
ALTER TABLE "project_financial_settings" ADD CONSTRAINT "project_financial_settings_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_entries" ADD CONSTRAINT "financial_entries_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_costs" ADD CONSTRAINT "financial_costs_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "financial_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_costs" ADD CONSTRAINT "financial_costs_scorecardRunId_fkey" FOREIGN KEY ("scorecardRunId") REFERENCES "scorecard_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
