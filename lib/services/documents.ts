import { tenantScopedPrisma } from "../tenant";
import type { PrismaClient, DocumentEntityType, StorageProvider } from "@prisma/client";
import { storeBuffer } from "../storage";

export function documentService(tenantId: string, client: PrismaClient) {
  const prisma = tenantScopedPrisma(tenantId, client);
  return {
    list(params?: { entityType?: DocumentEntityType; entityId?: string }) {
      if (params?.entityType && params?.entityId) {
        return prisma.document.findMany({
          where: {
            links: { some: { entityType: params.entityType, entityId: params.entityId } }
          },
          include: { upload: true, links: true },
          orderBy: { createdAt: "desc" }
        });
      }
      return prisma.document.findMany({
        include: { upload: true, links: true },
        orderBy: { createdAt: "desc" },
        take: 100
      });
    },
    get(id: string) {
      return prisma.document.findUnique({
        where: { id },
        include: { upload: true, links: true }
      });
    },
    async create(params: {
      createdByUserId?: string;
      title: string;
      description?: string;
      entityType: DocumentEntityType;
      entityId: string;
      filename: string;
      mimeType: string;
      buffer: Buffer;
      provider?: StorageProvider;
    }) {
      const stored = await storeBuffer({
        provider: (params.provider ?? "LOCAL") as "LOCAL",
        filename: params.filename,
        buffer: params.buffer
      });

      return prisma.$transaction(async (tx) => {
        const upload = await tx.upload.create({
          data: {
            tenantId,
            userId: params.createdByUserId,
            filename: params.filename,
            mimeType: params.mimeType,
            sizeBytes: stored.sizeBytes,
            storageProvider: params.provider ?? "LOCAL",
            storageKey: stored.storageKey,
            url: stored.url
          }
        });

        return tx.document.create({
          data: {
            tenantId,
            uploadId: upload.id,
            title: params.title,
            description: params.description,
            createdByUserId: params.createdByUserId,
            links: {
              create: {
                tenantId,
                entityType: params.entityType,
                entityId: params.entityId
              }
            }
          },
          include: { upload: true, links: true }
        });
      });
    },
    remove(id: string) {
      return prisma.document.delete({ where: { id } });
    }
  };
}
