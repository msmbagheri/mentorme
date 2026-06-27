import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(
  date: Date | string,
  locale: "en" | "fa" = "en",
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const loc = locale === "fa" ? "fa-IR" : "en-US";
  return new Intl.DateTimeFormat(loc, {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  }).format(d);
}

export function formatTime(
  date: Date | string,
  locale: "en" | "fa" = "en",
  timeZone?: string,
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const loc = locale === "fa" ? "fa-IR" : "en-US";
  return new Intl.DateTimeFormat(loc, {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(d);
}

export function truncate(text: string, length = 160): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + "…";
}

export function absoluteUrl(path: string): string {
  const base = process.env.PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
