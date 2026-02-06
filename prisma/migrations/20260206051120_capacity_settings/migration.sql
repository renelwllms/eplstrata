-- CreateTable
CREATE TABLE "CapacitySettings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workingHoursPerDay" INTEGER NOT NULL DEFAULT 8,
    "workingDays" TEXT NOT NULL DEFAULT 'MON,TUE,WED,THU,FRI',
    "allowOvertime" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CapacitySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapacityOverride" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weeklyCapacityHours" INTEGER NOT NULL,
    "role" TEXT,
    "startDate" DATE,
    "endDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CapacityOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapacityLeave" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "hoursPerDay" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CapacityLeave_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CapacitySettings_tenantId_key" ON "CapacitySettings"("tenantId");

-- CreateIndex
CREATE INDEX "CapacityOverride_tenantId_idx" ON "CapacityOverride"("tenantId");

-- CreateIndex
CREATE INDEX "CapacityOverride_tenantId_userId_idx" ON "CapacityOverride"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "CapacityLeave_tenantId_idx" ON "CapacityLeave"("tenantId");

-- CreateIndex
CREATE INDEX "CapacityLeave_tenantId_userId_idx" ON "CapacityLeave"("tenantId", "userId");

-- AddForeignKey
ALTER TABLE "CapacitySettings" ADD CONSTRAINT "CapacitySettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapacityOverride" ADD CONSTRAINT "CapacityOverride_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapacityOverride" ADD CONSTRAINT "CapacityOverride_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapacityLeave" ADD CONSTRAINT "CapacityLeave_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapacityLeave" ADD CONSTRAINT "CapacityLeave_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
