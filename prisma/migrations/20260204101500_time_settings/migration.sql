-- Add time tracking defaults to tenant settings
CREATE TYPE "TimesheetView" AS ENUM ('WEEKLY', 'DAILY');

ALTER TABLE "TenantSettings"
  ADD COLUMN "timeRoundingMinutes" INTEGER NOT NULL DEFAULT 15,
  ADD COLUMN "defaultBillable" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "timesheetView" "TimesheetView" NOT NULL DEFAULT 'WEEKLY';
