-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "recurrenceRuleId" TEXT;

-- CreateTable
CREATE TABLE "JobMilestone" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dueDate" DATE,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRecurrenceRule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "frequency" "RecurrenceFrequency" NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "nextRunDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobRecurrenceRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobMilestone_tenantId_jobId_idx" ON "JobMilestone"("tenantId", "jobId");

-- CreateIndex
CREATE INDEX "JobRecurrenceRule_tenantId_frequency_idx" ON "JobRecurrenceRule"("tenantId", "frequency");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_recurrenceRuleId_fkey" FOREIGN KEY ("recurrenceRuleId") REFERENCES "JobRecurrenceRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobMilestone" ADD CONSTRAINT "JobMilestone_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobMilestone" ADD CONSTRAINT "JobMilestone_jobId_tenantId_fkey" FOREIGN KEY ("jobId", "tenantId") REFERENCES "Job"("id", "tenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRecurrenceRule" ADD CONSTRAINT "JobRecurrenceRule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
