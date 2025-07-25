export function splitProtectedText(
  text: string,
  options?: { yearPlaceholder?: string },
): string[] {
  // Default year placeholder if not provided
  const yearPlaceholder = options?.yearPlaceholder || "{{ year }}";
  const currentYear = new Date().getFullYear().toString();

  // Step 1: Protect URLs by replacing them with placeholders
  const urlRegex = /https?:\/\/[^\s)]+/g;
  const urlPlaceholders: Record<string, string> = {};

  const protectedText = text.replace(urlRegex, (url, index) => {
    const placeholder = `__URL${index}__`;
    urlPlaceholders[placeholder] = url;
    return placeholder;
  });

  // Step 2: Split on slashes surrounded by optional spaces
  let parts = protectedText.split(/\s*\/\s*/);

  // Step 3: Restore URLs from placeholders
  parts = parts.map((part) =>
    part.replace(/__URL\d+__/g, (match) => urlPlaceholders[match] || match),
  );

  // Step 4: Replace the year placeholder (supports variations like {{year}}, {{ year }}, etc.)
  const yearRegex = new RegExp(
    yearPlaceholder.replace(/\s+/g, "\\s*").replace(/[{}]/g, "\\$&"),
    "g",
  );
  parts = parts.map((part) => part.replace(yearRegex, currentYear));

  return parts;
}
