-- CreateEnum
CREATE TYPE "InvoiceBillingMode" AS ENUM ('ACTUAL', 'QUOTED', 'PROGRESS', 'PERCENT_QUOTE');

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "billingMode" "InvoiceBillingMode" NOT NULL DEFAULT 'ACTUAL',
ADD COLUMN     "progressPercent" INTEGER,
ADD COLUMN     "templateId" TEXT;

-- CreateTable
CREATE TABLE "InvoiceTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "layout" TEXT NOT NULL DEFAULT 'STANDARD',
    "defaults" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceJobLink" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceJobLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InvoiceTemplate_tenantId_idx" ON "InvoiceTemplate"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceTemplate_tenantId_name_key" ON "InvoiceTemplate"("tenantId", "name");

-- CreateIndex
CREATE INDEX "InvoiceJobLink_tenantId_jobId_idx" ON "InvoiceJobLink"("tenantId", "jobId");

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceJobLink_tenantId_invoiceId_jobId_key" ON "InvoiceJobLink"("tenantId", "invoiceId", "jobId");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "InvoiceTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceTemplate" ADD CONSTRAINT "InvoiceTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceJobLink" ADD CONSTRAINT "InvoiceJobLink_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceJobLink" ADD CONSTRAINT "InvoiceJobLink_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceJobLink" ADD CONSTRAINT "InvoiceJobLink_jobId_tenantId_fkey" FOREIGN KEY ("jobId", "tenantId") REFERENCES "Job"("id", "tenantId") ON DELETE RESTRICT ON UPDATE CASCADE;
