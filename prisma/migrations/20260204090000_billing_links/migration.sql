-- Link time entries and costs to invoices
ALTER TABLE "TimeEntry" ADD COLUMN "invoiceId" TEXT;
ALTER TABLE "CostEntry" ADD COLUMN "invoiceId" TEXT;

CREATE INDEX "TimeEntry_invoiceId_idx" ON "TimeEntry"("invoiceId");
CREATE INDEX "CostEntry_invoiceId_idx" ON "CostEntry"("invoiceId");

ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_invoiceId_tenantId_fkey" FOREIGN KEY ("invoiceId", "tenantId") REFERENCES "Invoice"("id", "tenantId") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CostEntry" ADD CONSTRAINT "CostEntry_invoiceId_tenantId_fkey" FOREIGN KEY ("invoiceId", "tenantId") REFERENCES "Invoice"("id", "tenantId") ON DELETE SET NULL ON UPDATE CASCADE;
