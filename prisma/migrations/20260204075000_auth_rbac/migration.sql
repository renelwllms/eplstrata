-- Add auth fields to User
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN "activeTenantId" TEXT;

ALTER TABLE "User" ADD CONSTRAINT "User_activeTenantId_fkey" FOREIGN KEY ("activeTenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Job assignments for staff access control
CREATE TABLE "JobAssignment" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "JobAssignment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "JobAssignment_tenantId_jobId_userId_key" ON "JobAssignment"("tenantId", "jobId", "userId");
CREATE INDEX "JobAssignment_tenantId_idx" ON "JobAssignment"("tenantId");
CREATE INDEX "JobAssignment_tenantId_userId_idx" ON "JobAssignment"("tenantId", "userId");

ALTER TABLE "JobAssignment" ADD CONSTRAINT "JobAssignment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JobAssignment" ADD CONSTRAINT "JobAssignment_jobId_tenantId_fkey" FOREIGN KEY ("jobId", "tenantId") REFERENCES "Job"("id", "tenantId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JobAssignment" ADD CONSTRAINT "JobAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
