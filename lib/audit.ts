import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";

export type AuditAction =
  | "AUTH_LOGIN_SUCCESS"
  | "AUTH_LOGIN_FAILURE"
  | "TENANT_SWITCH"
  | "CRUD_STUB"
  | "CREATE_FROM_BILLABLES"
  | "ADMIN_IMPERSONATE"
  | "ADMIN_CREATE_TENANT"
  | "ADMIN_UPDATE_SUBSCRIPTION";

export async function logAudit(params: {
  tenantId: string;
  actorUserId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.auditLog.create({
    data: {
      tenantId: params.tenantId,
      actorUserId: params.actorUserId ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: (params.metadata ?? undefined) as Prisma.InputJsonValue | undefined
    }
  });
}

export async function auditCrudStub(params: {
  tenantId: string;
  actorUserId?: string | null;
  entityType: string;
  entityId: string;
  operation: string;
}) {
  return logAudit({
    tenantId: params.tenantId,
    actorUserId: params.actorUserId ?? null,
    action: "CRUD_STUB",
    entityType: params.entityType,
    entityId: params.entityId,
    metadata: { operation: params.operation }
  });
}
