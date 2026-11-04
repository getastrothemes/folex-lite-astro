import type { ImageMetadata } from "astro";
import { getImage } from "astro:assets";

const images = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/images/**/*.{jpeg,jpg,png,webp,gif}",
);

/**
 * Returns a public URL for a social sharing image. Images in
 * `src/assets/images` (where the CMS uploads them) are exported as JPEG,
 * which every social network accepts. Other paths (e.g. files in `public/`)
 * are returned unchanged.
 */
export async function socialImageUrl(src?: string) {
  if (!src || /^https?:\/\//.test(src)) return src;

  const key = src.startsWith("/src/assets") ? src : `/src/assets${src}`;
  const load = images[key];
  if (!load) return src;

  const image = await getImage({ src: (await load()).default, format: "jpg" });
  return image.src;
}
