import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().min(1),
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  SERVER_LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).optional(),
  RATE_LIMIT_MAX: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.string().optional(),
  CORS_ALLOWED_ORIGINS: z.string().optional(),
  SECURITY_HEADERS_MODE: z.enum(["relaxed", "strict"]).optional(),
  UPLOAD_MAX_BYTES: z.string().optional(),
  UPLOAD_ALLOWED_MIME: z.string().optional()
});

let cached: z.infer<typeof envSchema> | null = null;

export function getEnv() {
  if (cached) return cached;
  cached = envSchema.parse(process.env);
  return cached;
}
