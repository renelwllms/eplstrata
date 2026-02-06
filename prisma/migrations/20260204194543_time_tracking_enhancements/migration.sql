-- AlterTable
ALTER TABLE "TimeEntry" ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "source" TEXT,
ADD COLUMN     "startTime" TIMESTAMP(3);
