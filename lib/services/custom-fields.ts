import { tenantScopedPrisma } from "../tenant";
import type { PrismaClient, CustomFieldEntity, CustomFieldType } from "@prisma/client";

export function customFieldService(tenantId: string, client: PrismaClient) {
  const prisma = tenantScopedPrisma(tenantId, client);
  return {
    list(entityType?: CustomFieldEntity) {
      return prisma.customFieldDefinition.findMany({
        where: entityType ? { entityType } : undefined,
        orderBy: [{ entityType: "asc" }, { sortOrder: "asc" }, { name: "asc" }]
      });
    },
    get(id: string) {
      return prisma.customFieldDefinition.findUnique({ where: { id } });
    },
    create(params: {
      entityType: CustomFieldEntity;
      name: string;
      key: string;
      fieldType: CustomFieldType;
      required?: boolean;
      options?: Record<string, unknown> | null;
      sortOrder?: number;
    }) {
      return prisma.customFieldDefinition.create({
        data: {
          tenantId,
          entityType: params.entityType,
          name: params.name,
          key: params.key,
          fieldType: params.fieldType,
          required: params.required ?? false,
          options: params.options ?? undefined,
          sortOrder: params.sortOrder ?? 0
        }
      });
    },
    update(id: string, params: Record<string, unknown>) {
      return prisma.customFieldDefinition.update({ where: { id }, data: params });
    },
    remove(id: string) {
      return prisma.customFieldDefinition.delete({ where: { id } });
    }
  };
}
