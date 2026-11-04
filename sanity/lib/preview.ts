/**
 * Small helpers for readable list previews in the Studio.
 */

/** Shortens text to its first line and `max` characters, adding "…" when cut. */
export function shorten(text: unknown, max = 40): string {
  if (typeof text !== "string") return "";
  const lines = text.trim().split(/\r?\n/);
  const firstLine = lines[0].trim();
  const cut =
    firstLine.length > max
      ? `${firstLine.slice(0, max).trimEnd()}…`
      : firstLine;
  return lines.length > 1 && !cut.endsWith("…") ? `${cut}…` : cut;
}

/** "1 logo", "8 logos", "0 logos". */
export function countLabel(
  count: unknown,
  singular: string,
  plural = `${singular}s`,
): string {
  const n = typeof count === "number" ? count : 0;
  return `${n} ${n === 1 ? singular : plural}`;
}

/** Number of items in an array value selected for a preview (0 when not an array). */
export function arrayLength(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

/** "Banner — We Help to Grow…", or just "Banner" when the title is empty. */
export function sectionTitle(
  sectionName: string,
  title: unknown,
  hidden?: unknown,
): string {
  const text = shorten(title);
  const label = text ? `${sectionName} — ${text}` : sectionName;
  return hidden ? `${label} (hidden)` : label;
}
