/**
 * Convert Prisma records (with Date/Decimal values) into plain JSON-safe rows
 * so they can cross the RSC → client component boundary. A JSON round-trip
 * turns Date instances into ISO strings and strips non-serializable values.
 */
export function serializeRows<T extends Record<string, unknown>>(
  rows: T[],
): (T & { id: string })[] {
  return JSON.parse(JSON.stringify(rows)) as (T & { id: string })[];
}

export function serializeRow<T extends Record<string, unknown>>(row: T): T {
  return JSON.parse(JSON.stringify(row)) as T;
}
