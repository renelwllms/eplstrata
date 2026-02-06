import { tenantScopedPrisma } from "../tenant";
import type { PrismaClient, Role } from "@prisma/client";
import { getWeekRange, formatDate } from "../date";

export function timeEntryService(tenantId: string, client: PrismaClient) {
  const prisma = tenantScopedPrisma(tenantId, client);
  return {
    async list(userId: string, role: Role) {
      const where = role === "STAFF" ? { userId } : undefined;
      return prisma.timeEntry.findMany({ where, orderBy: { date: "desc" } });
    },
    get(id: string) {
      return prisma.timeEntry.findUnique({ where: { id } });
    },
    create(data: {
      userId: string;
      jobId: string;
      taskCatalogId: string;
      phaseId?: string;
      date: string;
      startTime?: string;
      endTime?: string;
      source?: string;
      durationMinutes: number;
      billable?: boolean;
      notes?: string;
    }) {
      return prisma.timeEntry.create({
        data: {
          tenantId,
          userId: data.userId,
          jobId: data.jobId,
          taskCatalogId: data.taskCatalogId,
          phaseId: data.phaseId,
          date: new Date(data.date),
          startTime: data.startTime ? new Date(data.startTime) : undefined,
          endTime: data.endTime ? new Date(data.endTime) : undefined,
          source: data.source,
          durationMinutes: data.durationMinutes,
          billable: data.billable ?? true,
          notes: data.notes
        }
      });
    },
    update(id: string, data: Record<string, unknown>) {
      const patch = { ...data };
      if (typeof patch.date === "string") {
        patch.date = new Date(patch.date);
      }
      if (typeof patch.startTime === "string") {
        patch.startTime = new Date(patch.startTime);
      }
      if (typeof patch.endTime === "string") {
        patch.endTime = new Date(patch.endTime);
      }
      return prisma.timeEntry.update({ where: { id }, data: patch });
    },
    remove(id: string) {
      return prisma.timeEntry.delete({ where: { id } });
    },
    async weekSummary(dateString: string, userId: string, role: Role) {
      const { start, end } = getWeekRange(dateString);
      const where: Record<string, unknown> = {
        date: {
          gte: start,
          lte: end
        }
      };

      if (role === "STAFF") {
        where.userId = userId;
      }

      const entries = await prisma.timeEntry.findMany({
        where,
        orderBy: { date: "asc" }
      });

      const totalsByDay: Record<string, number> = {};
      for (const entry of entries) {
        const key = formatDate(entry.date);
        totalsByDay[key] = (totalsByDay[key] ?? 0) + entry.durationMinutes;
      }

      let weekTotal = 0;
      Object.values(totalsByDay).forEach((value) => {
        weekTotal += value;
      });

      return {
        range: {
          start: formatDate(start),
          end: formatDate(end)
        },
        totalsByDay,
        weekTotal,
        entries
      };
    }
  };
}
