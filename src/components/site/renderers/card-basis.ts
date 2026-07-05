// Flex-basis per card by desktop column count. Always full-width (1-up) on
// mobile; the md: variants kick in at ≥768px. Literal strings so Tailwind's JIT
// emits the arbitrary calc() utilities (gap-6 = 1.5rem between cards).
export const CARD_BASIS: Record<number, string> = {
  1: "md:basis-full",
  2: "md:basis-[calc((100%-1.5rem)/2)]",
  3: "md:basis-[calc((100%-3rem)/3)]",
  4: "md:basis-[calc((100%-4.5rem)/4)]",
};

/** Tailwind classes making a card N-up on desktop (1-up mobile). Falls back to 3. */
export function cardBasis(perRow: number): string {
  return `flex shrink-0 basis-full snap-start ${CARD_BASIS[perRow] ?? CARD_BASIS[3]}`;
}

/** Clamp an arbitrary stored value to the supported column counts. */
export function normalizeCardsPerRow(value: number | null | undefined, fallback = 3): number {
  return value === 1 || value === 2 || value === 3 || value === 4 ? value : fallback;
}

/**
 * Desktop columns clamped to the number of items so a short list fills the row
 * instead of leaving empty tracks: 1 card → full width, 2 → halves, 3 → thirds.
 */
export function effectiveColumns(
  configured: number | null | undefined,
  itemCount: number,
  fallback = 3,
): number {
  const cols = normalizeCardsPerRow(configured, fallback);
  return Math.max(1, Math.min(cols, itemCount || 1));
}
