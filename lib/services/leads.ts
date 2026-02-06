import { tenantScopedPrisma } from "../tenant";
import type { PrismaClient, Role, LeadActivityType } from "@prisma/client";

export function leadService(tenantId: string, client: PrismaClient) {
  const prisma = tenantScopedPrisma(tenantId, client);
  return {
    async list(userId: string, role: Role) {
      const where = role === "STAFF" ? { ownerUserId: userId } : undefined;
      return prisma.lead.findMany({
        where,
        include: { stage: true, owner: true },
        orderBy: { createdAt: "desc" }
      });
    },
    get(id: string) {
      return prisma.lead.findUnique({
        where: { id },
        include: { stage: true, owner: true, activities: true }
      });
    },
    async create(data: {
      stageId?: string;
      ownerUserId?: string;
      name: string;
      company?: string;
      email?: string;
      phone?: string;
      estimatedValue?: number;
      probability?: number;
      expectedCloseDate?: string;
      source?: string;
      notes?: string;
    }) {
      const stageId = data.stageId ?? (await this.getDefaultStageId());
      if (!stageId) {
        throw new Error("Lead stage required");
      }

      return prisma.lead.create({
        data: {
          tenantId,
          stageId,
          ownerUserId: data.ownerUserId,
          name: data.name,
          company: data.company,
          email: data.email,
          phone: data.phone,
          estimatedValue: data.estimatedValue,
          probability: data.probability,
          expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : undefined,
          source: data.source,
          notes: data.notes
        }
      });
    },
    update(id: string, data: Record<string, unknown>) {
      const patch = { ...data } as Record<string, unknown>;
      if (typeof patch.expectedCloseDate === "string") {
        patch.expectedCloseDate = new Date(patch.expectedCloseDate);
      }
      if (typeof patch.completedAt === "string") {
        patch.completedAt = new Date(patch.completedAt);
      }
      return prisma.lead.update({ where: { id }, data: patch });
    },
    remove(id: string) {
      return prisma.lead.delete({ where: { id } });
    },
    async getDefaultStageId() {
      const stage = await prisma.leadStage.findFirst({
        orderBy: { sortOrder: "asc" }
      });
      if (stage) return stage.id;

      await prisma.leadStage.createMany({
        data: [
          { tenantId, name: "New", sortOrder: 1 },
          { tenantId, name: "Qualified", sortOrder: 2 },
          { tenantId, name: "Proposal", sortOrder: 3 },
          { tenantId, name: "Won", sortOrder: 4, isClosed: true, isWon: true },
          { tenantId, name: "Lost", sortOrder: 5, isClosed: true, isWon: false }
        ],
        skipDuplicates: true
      });

      const fallback = await prisma.leadStage.findFirst({
        orderBy: { sortOrder: "asc" }
      });
      return fallback?.id ?? null;
    }
  };
}

export function leadStageService(tenantId: string, client: PrismaClient) {
  const prisma = tenantScopedPrisma(tenantId, client);
  return {
    list() {
      return prisma.leadStage.findMany({ orderBy: { sortOrder: "asc" } });
    },
    get(id: string) {
      return prisma.leadStage.findUnique({ where: { id } });
    },
    create(data: {
      name: string;
      color?: string;
      sortOrder?: number;
      isClosed?: boolean;
      isWon?: boolean;
    }) {
      return prisma.leadStage.create({
        data: {
          tenantId,
          name: data.name,
          color: data.color,
          sortOrder: data.sortOrder ?? 0,
          isClosed: data.isClosed ?? false,
          isWon: data.isWon ?? false
        }
      });
    },
    update(id: string, data: Record<string, unknown>) {
      return prisma.leadStage.update({ where: { id }, data });
    },
    remove(id: string) {
      return prisma.leadStage.delete({ where: { id } });
    }
  };
}

export function leadActivityService(tenantId: string, client: PrismaClient) {
  const prisma = tenantScopedPrisma(tenantId, client);
  return {
    list(leadId: string) {
      return prisma.leadActivity.findMany({
        where: { leadId },
        orderBy: { createdAt: "desc" }
      });
    },
    create(leadId: string, data: {
      type?: LeadActivityType;
      title: string;
      dueDate?: string;
      completedAt?: string;
      notes?: string;
    }) {
      return prisma.leadActivity.create({
        data: {
          tenantId,
          leadId,
          type: data.type ?? "TASK",
          title: data.title,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
          notes: data.notes
        }
      });
    },
    update(id: string, data: Record<string, unknown>) {
      const patch = { ...data } as Record<string, unknown>;
      if (typeof patch.dueDate === "string") {
        patch.dueDate = new Date(patch.dueDate);
      }
      if (typeof patch.completedAt === "string") {
        patch.completedAt = new Date(patch.completedAt);
      }
      return prisma.leadActivity.update({ where: { id }, data: patch });
    },
    remove(id: string) {
      return prisma.leadActivity.delete({ where: { id } });
    }
  };
}

export function leadTemplateService(tenantId: string, client: PrismaClient) {
  const prisma = tenantScopedPrisma(tenantId, client);
  return {
    list() {
      return prisma.leadTemplate.findMany({ orderBy: { createdAt: "desc" } });
    },
    get(id: string) {
      return prisma.leadTemplate.findUnique({ where: { id } });
    },
    create(data: { name: string; defaults?: Record<string, unknown> }) {
      return prisma.leadTemplate.create({
        data: {
          tenantId,
          name: data.name,
          defaults: data.defaults ?? undefined
        }
      });
    },
    update(id: string, data: Record<string, unknown>) {
      return prisma.leadTemplate.update({ where: { id }, data });
    },
    remove(id: string) {
      return prisma.leadTemplate.delete({ where: { id } });
    }
  };
}
