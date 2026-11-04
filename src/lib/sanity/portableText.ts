/**
 * Converts Portable Text (Sanity rich text) to HTML.
 *
 * The HTML is meant for a container with the theme's prose styles, e.g.
 * `<div class="content" set:html={await portableTextToHtml(body)} />`.
 */
import { escapeHTML, toHTML, uriLooksSafe } from "@portabletext/to-html";
import { stegaClean } from "@sanity/client/stega";
import { getImage } from "astro:assets";
import {
  getImageDimensions,
  getResponsiveImage,
  isLocalImage,
  isPublicImage,
  isSvgImage,
  localImages,
} from "./image";
import type { PortableTextValue, SanityImageValue } from "./types";

type InlineImage = SanityImageValue & { _key?: string };
type ResolvedImage = {
  src: string;
  srcset?: string;
  width?: number;
  height?: number;
};

const IMAGE_SIZES = "(min-width: 1024px) 1024px, 100vw";

/** Builds src/srcset for one image (CDN, `public/` or `src/assets`) */
const resolveImage = async (
  image: InlineImage,
): Promise<ResolvedImage | null> => {
  const url = image.asset?.url;
  if (!url) return null;

  // Demo images in `public/` and SVGs are used as they are
  if (isPublicImage(image) || (isSvgImage(image) && !isLocalImage(image))) {
    return { src: url, ...getImageDimensions(image) };
  }

  // Demo images in `src/assets/images`: let Astro optimize them
  if (isLocalImage(image)) {
    const loadImage = localImages[`/src/assets${url}`];
    if (!loadImage) return null;
    const optimized = await getImage({ src: (await loadImage()).default });
    return {
      src: optimized.src,
      srcset: optimized.srcSet.attribute || undefined,
      width: Number(optimized.attributes.width) || undefined,
      height: Number(optimized.attributes.height) || undefined,
    };
  }

  // Sanity CDN image: several widths, never wider than the original
  return getResponsiveImage(image);
};

const isExternalUrl = (href: string) => /^https?:\/\//i.test(href);

/**
 * Heading ids like Markdown (github-slugger): lowercase, punctuation removed,
 * spaces become "-" ("Challenge & Solution" → "challenge--solution").
 * Repeated headings get "-1", "-2"… so every id on the page stays unique.
 */
const createSlugger = () => {
  const seen = new Map<string, number>();
  return (text: string) => {
    const base = stegaClean(text)
      .toLowerCase()
      .replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, "")
      .replace(/ /g, "-");
    const count = seen.get(base);
    seen.set(base, (count ?? -1) + 1);
    return count === undefined ? base : `${base}-${count + 1}`;
  };
};

/** Plain text of a block (used for heading ids) */
const blockText = (block: { children?: { text?: string }[] }) =>
  (block.children || []).map((child) => child.text || "").join("");

/**
 * Renders Portable Text blocks to an HTML string: headings h2–h4, lists,
 * quotes, bold/italic, links (external links open in a new tab) and images.
 */
export async function portableTextToHtml(
  blocks: PortableTextValue | null | undefined,
): Promise<string> {
  if (!Array.isArray(blocks) || blocks.length === 0) return "";

  // Images are resolved first (Astro image optimization is async)
  const images = new Map<unknown, ResolvedImage | null>();
  for (const block of blocks) {
    if (block._type === "image") {
      images.set(block._key ?? block, await resolveImage(block as InlineImage));
    }
  }

  // One slugger per document, so duplicate headings get unique ids
  const slugify = createSlugger();
  const heading =
    (tag: string) =>
    ({ children, value }: { children?: string; value: any }) => {
      const id = slugify(blockText(value));
      return `<${tag}${id ? ` id="${escapeHTML(id)}"` : ""}>${children}</${tag}>`;
    };

  return toHTML(blocks as never, {
    // Unknown custom blocks are skipped instead of printing a warning
    onMissingComponent: false,
    components: {
      unknownType: () => "",
      types: {
        image: ({ value }) => {
          const image = images.get(value._key ?? value);
          if (!image) return "";
          const alt = escapeHTML(String(value.alt || ""));
          const caption = value.caption
            ? `<figcaption>${escapeHTML(String(value.caption))}</figcaption>`
            : "";
          const attributes = [
            `src="${escapeHTML(image.src)}"`,
            image.srcset && `srcset="${escapeHTML(image.srcset)}"`,
            image.srcset && `sizes="${IMAGE_SIZES}"`,
            image.width && `width="${image.width}"`,
            image.height && `height="${image.height}"`,
            `alt="${alt}"`,
            `loading="lazy"`,
            `decoding="async"`,
          ]
            .filter(Boolean)
            .join(" ");
          return `<figure><img ${attributes} />${caption}</figure>`;
        },
      },
      marks: {
        link: ({ children, value }) => {
          const href = String(value?.href || "").trim();
          if (!href || !uriLooksSafe(href)) return children;
          const newTab = value?.openInNewTab === true || isExternalUrl(href);
          // Same attributes the original theme added to Markdown links
          const target = newTab
            ? ` rel="noopener noreferrer nofollow" target="_blank"`
            : "";
          return `<a href="${escapeHTML(href)}"${target}>${children}</a>`;
        },
      },
      block: {
        // Rich text never outputs a second <h1> (the page title is the h1)
        h1: heading("h2"),
        h2: heading("h2"),
        h3: heading("h3"),
        h4: heading("h4"),
      },
      // A list item that holds a sub-list gets its own text in a <p>, like
      // Markdown's "loose" lists, so the spacing matches the original theme
      listItem: ({ children = "", value }) => {
        const hasSubList = (value.children || []).some(
          (child: { _type?: string }) => child._type === "@list",
        );
        const split = hasSubList ? children.search(/<(ul|ol)>/) : -1;
        return split > 0
          ? `<li><p>${children.slice(0, split)}</p>${children.slice(split)}</li>`
          : `<li>${children}</li>`;
      },
    },
  });
}
