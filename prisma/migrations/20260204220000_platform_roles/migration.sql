-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('SUPER_ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "platformRole" "PlatformRole";

-- CreateTable
CREATE TABLE "AdminImpersonation" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminImpersonation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminImpersonation_adminUserId_key" ON "AdminImpersonation"("adminUserId");

-- CreateIndex
CREATE INDEX "AdminImpersonation_tenantId_idx" ON "AdminImpersonation"("tenantId");

-- CreateIndex
CREATE INDEX "AdminImpersonation_userId_idx" ON "AdminImpersonation"("userId");

-- AddForeignKey
ALTER TABLE "AdminImpersonation" ADD CONSTRAINT "AdminImpersonation_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminImpersonation" ADD CONSTRAINT "AdminImpersonation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminImpersonation" ADD CONSTRAINT "AdminImpersonation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
