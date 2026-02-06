import { storeBufferLocal, type StoredObject } from "./local";

export type StorageProviderCode = "LOCAL";

export async function storeBuffer(params: {
  provider: StorageProviderCode;
  filename: string;
  buffer: Buffer;
}): Promise<StoredObject> {
  switch (params.provider) {
    case "LOCAL":
      return storeBufferLocal({ filename: params.filename, buffer: params.buffer });
    default:
      throw new Error(`Unsupported storage provider: ${params.provider}`);
  }
}
