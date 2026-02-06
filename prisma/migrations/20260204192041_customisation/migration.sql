-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "defaultBillableRate" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "billableRateOverride" DECIMAL(12,2),
ADD COLUMN     "jobStageId" TEXT;

-- AlterTable
ALTER TABLE "TenantSettings" ADD COLUMN     "businessAddress" TEXT,
ADD COLUMN     "businessEmail" TEXT,
ADD COLUMN     "businessName" TEXT,
ADD COLUMN     "businessPhone" TEXT,
ADD COLUMN     "businessWebsite" TEXT,
ADD COLUMN     "logoUrl" TEXT;

-- CreateTable
CREATE TABLE "JobStage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobStage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobStage_tenantId_sortOrder_idx" ON "JobStage"("tenantId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "JobStage_tenantId_name_key" ON "JobStage"("tenantId", "name");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_jobStageId_fkey" FOREIGN KEY ("jobStageId") REFERENCES "JobStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobStage" ADD CONSTRAINT "JobStage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
