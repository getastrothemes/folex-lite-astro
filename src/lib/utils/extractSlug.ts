interface SlugOptions {
  customSlug?: string;
}

/**
 * Extracts a clean slug from an ID or customSlug.
 * Automatically removes known file extensions.
 *
 * @param id - The default identifier (e.g., filename with extension).
 * @param options - Optional object containing a customSlug.
 * @returns A clean, extension-less slug string.
 */
const extractSlug = (content: { id: string; data: SlugOptions }) => {
  const { customSlug } = content.data || {};

  if (!content.data.customSlug && !content.id) {
    throw new Error("Invalid 'id' provided to extractSlug function.");
  }

  const source = customSlug?.trim() || content.id.trim();

  // Remove known extensions (.md, .mdx)
  return source.replace(/\.(mdx?|MDX?)$/, "");
};

export default extractSlug;
