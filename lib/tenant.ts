import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "./prisma";

const TENANT_MODELS = new Set<Prisma.ModelName>([
  "TenantSettings",
  "TenantMembership",
  "Subscription",
  "Client",
  "Contact",
  "TaskCatalog",
  "Job",
  "JobTask",
  "Phase",
  "TimeEntry",
  "CostEntry",
  "Quote",
  "QuoteLineItem",
  "Invoice",
  "InvoiceLineItem",
  "Payment",
  "AuditLog",
  "NumberSequence",
  "JobAssignment",
  "CustomFieldDefinition",
  "CustomFieldValue",
  "Notification",
  "Upload",
  "LeadStage",
  "Lead",
  "LeadActivity",
  "LeadTemplate",
  "Document",
  "DocumentLink",
  "JobStage",
  "QuoteTemplate",
  "InvoiceTemplate",
  "InvoiceJobLink",
  "JobMilestone",
  "JobRecurrenceRule"
]);

function ensureTenantInWhere(where: Record<string, unknown> | undefined, tenantId: string) {
  if (!where) {
    return { tenantId };
  }
  if ("tenantId" in where) {
    if (where.tenantId !== tenantId) {
      throw new Error("Tenant scope violation: tenantId mismatch");
    }
    return where;
  }
  return { ...where, tenantId };
}

function ensureTenantInData(data: Record<string, unknown> | undefined, tenantId: string) {
  if (!data) {
    return { tenantId };
  }
  if ("tenantId" in data) {
    if (data.tenantId !== tenantId) {
      throw new Error("Tenant scope violation: tenantId mismatch");
    }
    return data;
  }
  return { ...data, tenantId };
}

export function tenantScopedPrisma(tenantId: string, client: PrismaClient = prisma) {
  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!model || !TENANT_MODELS.has(model)) {
            return query(args);
          }

          if (operation === "create") {
            const data = ensureTenantInData(args.data as Record<string, unknown>, tenantId);
            return query({ ...args, data });
          }

          if (operation === "createMany") {
            const dataArray = Array.isArray(args.data) ? args.data : [];
            const data = dataArray.map((item) => ensureTenantInData(item as Record<string, unknown>, tenantId));
            return query({ ...args, data });
          }

          if (
            operation === "findUnique" ||
            operation === "findFirst" ||
            operation === "findMany" ||
            operation === "update" ||
            operation === "updateMany" ||
            operation === "delete" ||
            operation === "deleteMany" ||
            operation === "upsert"
          ) {
            const where = ensureTenantInWhere(args.where as Record<string, unknown> | undefined, tenantId);
            return query({ ...args, where });
          }

          return query(args);
        }
      }
    }
  });
}
