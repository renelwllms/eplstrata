import type { PrismaClient, StorageProvider } from "@prisma/client";
import { tenantScopedPrisma } from "../tenant";
import { storeBuffer } from "../storage";

export function uploadService(tenantId: string, client: PrismaClient) {
  const prisma = tenantScopedPrisma(tenantId, client);
  return {
    list() {
      return prisma.upload.findMany({
        orderBy: { createdAt: "desc" },
        take: 50
      });
    },
    async create(params: {
      userId?: string;
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

      return prisma.upload.create({
        data: {
          tenantId,
          userId: params.userId,
          filename: params.filename,
          mimeType: params.mimeType,
          sizeBytes: stored.sizeBytes,
          storageProvider: params.provider ?? "LOCAL",
          storageKey: stored.storageKey,
          url: stored.url
        }
      });
    }
  };
}
