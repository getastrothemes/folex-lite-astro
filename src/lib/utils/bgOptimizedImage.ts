import { getImage } from "astro:assets";

const bgOptimizedImage = async (
  src: string,
  format?: "auto" | "avif" | "jpeg" | "png" | "svg" | "webp",
) => {
  if (!src) {
    throw new Error("No image source provided.");
  }

  const images = import.meta.glob(
    "/src/assets/images/**/*.{jpeg,jpg,png,svg,gif}",
  );

  const normalizedPath = src.startsWith("/src/assets")
    ? src
    : `/src/assets${src}`;

  if (!images[normalizedPath]) {
    throw new Error(
      `Image not found: ${normalizedPath}. Ensure the image exists in /src/assets/images.`,
    );
  }

  let imageModule;
  try {
    imageModule = (await images[normalizedPath]()) as {
      default: ImageMetadata;
    };
  } catch {
    throw new Error(
      `Failed to load image module: ${normalizedPath}. Check file existence and permissions.`,
    );
  }

  try {
    const optimizedImage = await getImage({
      src: imageModule.default,
      format,
    });
    return optimizedImage.src;
  } catch (err) {
    throw new Error(
      `Image optimization failed for ${normalizedPath}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
};

export default bgOptimizedImage;
