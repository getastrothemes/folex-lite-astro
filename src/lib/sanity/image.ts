/**
 * Image helpers.
 *
 * Images uploaded to Sanity are served (and resized) by the Sanity image CDN.
 * In demo mode, images point at local files instead (their url starts with
 * "/"), and are rendered with Astro's own image optimization.
 */
import {
  createImageUrlBuilder,
  type ImageUrlBuilder,
  type SanityImageSource,
} from "@sanity/image-url";
import type { ImageMetadata } from "astro";
import { getImage } from "astro:assets";
import { dataset, projectId } from "./env";
import { PUBLIC_ASSET_PREFIX } from "./fallbackDataset";
import type { SanityImageValue } from "./types";

const builder = createImageUrlBuilder({
  projectId: projectId || "demo",
  dataset,
});

/**
 * Image url builder for Sanity CDN images, with automatic format (WebP/AVIF)
 * and "fit max" (never upscales). Check `isLocalImage()` first: local demo
 * images have no CDN url.
 *
 * @example urlForImage(image).width(800).url()
 */
export const urlForImage = (source: SanityImageSource): ImageUrlBuilder =>
  builder.image(source).auto("format").fit("max");

/** True for demo-mode images stored in the project (`src/assets` or `public`) */
export const isLocalImage = (image?: SanityImageValue | null): boolean =>
  !!image?.asset?.url && image.asset.url.startsWith("/");

/** True for demo-mode images stored in `public/` (served as they are) */
export const isPublicImage = (image?: SanityImageValue | null): boolean =>
  !!image?.asset?._id?.startsWith(PUBLIC_ASSET_PREFIX);

/** True for SVG images (never resized) */
export const isSvgImage = (image?: SanityImageValue | null): boolean =>
  image?.asset?.mimeType === "image/svg+xml" ||
  !!image?.asset?.url?.toLowerCase().split("?")[0].endsWith(".svg");

/** Intrinsic size of a CDN image, when Sanity knows it */
export const getImageDimensions = (image?: SanityImageValue | null) => {
  const dimensions = image?.asset?.metadata?.dimensions;
  return dimensions?.width && dimensions?.height
    ? { width: dimensions.width, height: dimensions.height }
    : null;
};

// Demo images in `src/assets/images` (they need Astro to get a public url)
export const localImages = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/images/**/*.{jpeg,jpg,png,webp,gif,svg,avif}",
);

/**
 * A url that works in the browser for any image, e.g. for meta tags or CSS
 * backgrounds. Demo images in `src/assets` are processed by Astro; CDN images
 * can be resized with `width`.
 */
export const getImageSrc = async (
  image?: SanityImageValue | null,
  width?: number,
): Promise<string> => {
  const url = image?.asset?.url;
  if (!url) return "";
  if (isLocalImage(image) && !isPublicImage(image)) {
    const loadImage = localImages[`/src/assets${url}`];
    if (!loadImage) return "";
    const optimized = await getImage({
      src: (await loadImage()).default,
      ...(width && !isSvgImage(image) ? { width } : {}),
      // One file only: the theme's default "constrained" layout would also
      // generate a srcset that a plain url never uses
      layout: "none",
    });
    return optimized.src;
  }
  return getImageUrl(image, width);
};

/**
 * A plain url for an image, without Astro processing.
 * CDN images can be resized with `width`; local images return their path
 * (for `src/assets` images use `getImageSrc` to get a working url).
 */
export const getImageUrl = (
  image?: SanityImageValue | null,
  width?: number,
): string => {
  if (!image?.asset?.url) return "";
  if (isLocalImage(image) || isSvgImage(image)) return image.asset.url;
  const url = urlForImage(image as SanityImageSource);
  return (width ? url.width(width) : url).url();
};

// Widths offered to the browser for responsive CDN images
const IMAGE_WIDTHS = [320, 640, 960, 1280, 1600, 2400];

/**
 * Responsive `src`/`srcset` for a Sanity CDN raster image.
 * - `width` only: the display width, the height follows the image ratio.
 * - `width` + `height`: the image is cropped to that ratio (respects hotspot).
 * Widths never exceed the original image.
 */
export const getResponsiveImage = (
  image: SanityImageValue,
  options: { width?: number; height?: number } = {},
) => {
  const intrinsic = getImageDimensions(image);
  const maxWidth = intrinsic?.width ?? IMAGE_WIDTHS.at(-1)!;
  const ratio =
    options.width && options.height
      ? options.height / options.width
      : intrinsic
        ? intrinsic.height / intrinsic.width
        : undefined;
  const crop = !!(options.width && options.height);

  const urlFor = (width: number) => {
    let url = urlForImage(image as SanityImageSource).width(width);
    if (crop && ratio) url = url.height(Math.round(width * ratio)).fit("crop");
    return url.url();
  };

  const displayWidth = Math.min(
    options.width ?? Math.min(maxWidth, 1280),
    maxWidth,
  );
  const widths = [
    ...new Set([
      ...IMAGE_WIDTHS.filter((width) => width < maxWidth),
      Math.min(maxWidth, IMAGE_WIDTHS.at(-1)!),
    ]),
  ];

  return {
    src: urlFor(displayWidth),
    srcset: widths.map((width) => `${urlFor(width)} ${width}w`).join(", "),
    width: options.width ?? displayWidth,
    height:
      options.height ??
      (ratio ? Math.round((options.width ?? displayWidth) * ratio) : undefined),
  };
};
