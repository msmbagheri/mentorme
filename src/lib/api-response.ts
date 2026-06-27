import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { ApiErrorDetail } from "@/types/api";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ status: "success", data }, init);
}

export function created<T>(data: T) {
  return ok(data, { status: 201 });
}

export function fail(
  code: string,
  message: string,
  httpStatus = 400,
  details: ApiErrorDetail[] = [],
) {
  return NextResponse.json(
    {
      status: "error",
      error: {
        code,
        message,
        timestamp: new Date().toISOString(),
        details,
      },
    },
    { status: httpStatus },
  );
}

export function fromZodError(error: ZodError) {
  const details: ApiErrorDetail[] = error.errors.map((e) => ({
    path: e.path.join("."),
    message: e.message,
  }));
  return fail("VALIDATION_ERROR", "Validation failed.", 422, details);
}

export const unauthorized = (message = "Authentication required.") =>
  fail("UNAUTHORIZED", message, 401);

export const forbidden = (message = "You do not have permission.") =>
  fail("FORBIDDEN", message, 403);

export const notFound = (message = "Resource not found.") =>
  fail("NOT_FOUND", message, 404);

export const tooManyRequests = (message = "Too many requests. Please try again later.") =>
  fail("RATE_LIMITED", message, 429);

export const serverError = (message = "An unexpected error occurred.") =>
  fail("INTERNAL_ERROR", message, 500);
