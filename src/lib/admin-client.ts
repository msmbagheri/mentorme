"use client";

import { toast } from "@/components/ui/use-toast";

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export class ApiClientError extends Error {
  code: string;
  details?: unknown;
  constructor(error: ApiError) {
    super(error.message);
    this.name = "ApiClientError";
    this.code = error.code;
    this.details = error.details;
  }
}

interface Envelope<T> {
  status: "success" | "error";
  data?: T;
  error?: ApiError;
}

async function parse<T>(res: Response): Promise<T> {
  const body = (await res.json().catch(() => null)) as Envelope<T> | null;
  if (!body) {
    throw new ApiClientError({ code: "NETWORK", message: "Empty or invalid response." });
  }
  if (body.status === "error" || !res.ok) {
    throw new ApiClientError(
      body.error ?? { code: "UNKNOWN", message: "Request failed." },
    );
  }
  return body.data as T;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: body instanceof FormData ? undefined : { "Content-Type": "application/json" },
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  return parse<T>(res);
}

export const apiClient = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
  upload: <T>(path: string, form: FormData) => request<T>("POST", path, form),
};

/**
 * Wrap a mutation with toast feedback. Returns the result or null on error.
 */
export async function runMutation<T>(
  fn: () => Promise<T>,
  opts: { success?: string; error?: string } = {},
): Promise<T | null> {
  try {
    const result = await fn();
    if (opts.success) toast({ title: opts.success, variant: "success" });
    return result;
  } catch (err) {
    const message =
      err instanceof ApiClientError ? err.message : opts.error ?? "Something went wrong.";
    toast({ title: opts.error ?? "Action failed", description: message, variant: "error" });
    return null;
  }
}
