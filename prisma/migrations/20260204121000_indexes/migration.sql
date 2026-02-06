CREATE INDEX "TimeEntry_tenantId_jobId_idx" ON "TimeEntry"("tenantId", "jobId");
CREATE INDEX "TimeEntry_tenantId_invoiceId_idx" ON "TimeEntry"("tenantId", "invoiceId");

CREATE INDEX "CostEntry_tenantId_jobId_idx" ON "CostEntry"("tenantId", "jobId");
CREATE INDEX "CostEntry_tenantId_invoiceId_idx" ON "CostEntry"("tenantId", "invoiceId");
