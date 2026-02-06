-- CreateEnum
CREATE TYPE "LeadActivityType" AS ENUM ('TASK', 'CALL', 'MEETING', 'EMAIL', 'NOTE');

-- AlterTable
ALTER TABLE "TenantSettings" ADD COLUMN     "leadCaptureToken" TEXT;

-- CreateTable
CREATE TABLE "LeadStage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "isWon" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "estimatedValue" DECIMAL(12,2),
    "probability" INTEGER,
    "expectedCloseDate" DATE,
    "source" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadActivity" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" "LeadActivityType" NOT NULL DEFAULT 'TASK',
    "title" TEXT NOT NULL,
    "dueDate" DATE,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaults" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeadStage_tenantId_sortOrder_idx" ON "LeadStage"("tenantId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "LeadStage_tenantId_name_key" ON "LeadStage"("tenantId", "name");

-- CreateIndex
CREATE INDEX "Lead_tenantId_stageId_idx" ON "Lead"("tenantId", "stageId");

-- CreateIndex
CREATE INDEX "Lead_tenantId_ownerUserId_idx" ON "Lead"("tenantId", "ownerUserId");

-- CreateIndex
CREATE INDEX "LeadActivity_tenantId_leadId_idx" ON "LeadActivity"("tenantId", "leadId");

-- CreateIndex
CREATE INDEX "LeadActivity_tenantId_dueDate_idx" ON "LeadActivity"("tenantId", "dueDate");

-- CreateIndex
CREATE INDEX "LeadTemplate_tenantId_idx" ON "LeadTemplate"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "LeadTemplate_tenantId_name_key" ON "LeadTemplate"("tenantId", "name");

-- AddForeignKey
ALTER TABLE "LeadStage" ADD CONSTRAINT "LeadStage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "LeadStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadTemplate" ADD CONSTRAINT "LeadTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
