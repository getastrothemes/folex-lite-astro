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
