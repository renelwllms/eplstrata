import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logger } from "./logger";

export function jsonOk(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export function handleError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError("Validation failed", 422, error.flatten());
  }

  if (error instanceof Error) {
    logger.error("api_error", { message: error.message, stack: error.stack });
    const status = error.message === "Unauthorized" ? 401 : 403;
    return jsonError(error.message, status);
  }

  logger.error("api_error", { error });
  return jsonError("Unexpected error", 500);
}
