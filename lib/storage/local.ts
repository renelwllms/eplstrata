import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export type StoredObject = {
  storageKey: string;
  url: string;
  sizeBytes: number;
};

function ensureUploadsDir() {
  return path.join(process.cwd(), "public", "uploads");
}

function safeFilename(filename: string) {
  const base = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
  return base.length ? base : "upload.bin";
}

export async function storeBufferLocal(params: {
  filename: string;
  buffer: Buffer;
}): Promise<StoredObject> {
  const uploadsDir = ensureUploadsDir();
  await fs.mkdir(uploadsDir, { recursive: true });

  const safeName = safeFilename(params.filename);
  const storageKey = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safeName}`;
  const fullPath = path.join(uploadsDir, storageKey);

  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, params.buffer);

  return {
    storageKey,
    url: `/uploads/${storageKey}`,
    sizeBytes: params.buffer.length
  };
}
