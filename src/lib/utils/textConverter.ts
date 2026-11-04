import slug_maker from "slugify";
import { marked } from "marked";

// slugify
export const slugifyyy = (content: string) => {
  if (!content) return "";

  return slug_maker(content, { lower: true });
};

// Escapes text for use in HTML (text and attribute values)
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Links may point to pages, anchors, websites, email addresses or phone
// numbers. Anything else (e.g. `javascript:`) is replaced with "#".
const SAFE_URL_SCHEMES = ["http", "https", "mailto", "tel"];
const safeHref = (href: string) => {
  // Browsers ignore spaces and control characters inside the scheme
  const compact = href.replace(/[\u0000-\u0020\u007f]+/g, "");
  const scheme = compact.match(/^([a-z][a-z0-9+.-]*):/i)?.[1]?.toLowerCase();
  return scheme && !SAFE_URL_SCHEMES.includes(scheme) ? "#" : href;
};

// Raw HTML typed into a text field is shown as text, except line breaks
// (`<br />`, used for multi-line titles)
const LINE_BREAK = /^<br\s*\/?>$/i;

// markdownify
export const markdownify = (content: string, container?: boolean) => {
  if (!content) return "";

  const renderer = new marked.Renderer();

  // Override the link renderer
  renderer.link = function (link) {
    const href = safeHref(link.href);
    const isExternal = href.startsWith("http");
    const targetAttrs = href.includes("getastrothemes")
      ? `target="_blank" rel="noopener"`
      : isExternal
        ? `target="_blank" rel="noopener noreferrer nofollow"`
        : "";

    // The link text goes through this same renderer (bold, raw HTML, ...)
    const text = this.parser.parseInline(link.tokens);
    return `<a href="${escapeHtml(href)}" ${targetAttrs}>${text}</a>`;
  };

  // Content comes from the CMS, so raw HTML is escaped instead of rendered
  renderer.html = ({ text }) =>
    LINE_BREAK.test(text.trim()) ? text : escapeHtml(text);

  // Set the custom renderer
  marked.setOptions({
    renderer,
  });

  return container ? marked.parse(content) : marked.parseInline(content);
};

// humanize
export const humanize = (content: string) => {
  if (content)
    return content
      .replace(/^[\s_]+|[\s_]+$/g, "")
      .replace(/[_\s]+/g, " ")
      .replace(/[-\s]+/g, " ")
      .replace(/^[a-z]/, function (m) {
        return m.toUpperCase();
      });
};

// Function for converting string to capitalized words
export const titleify = (content: string) => {
  if (!content) {
    console.warn("No content provided to titleify " + content);
    return "";
  }

  const humanized = humanize(content) || "";
  return humanized
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// plainify
export const plainify = (content: string) => {
  const parseMarkdown: any = marked.parse(content);
  const filterBrackets = parseMarkdown.replace(/<\/?[^>]+(>|$)/gm, "");
  const filterSpaces = filterBrackets.replace(/[\r\n]\s*[\r\n]/gm, "");
  const stripHTML = htmlEntityDecoder(filterSpaces);
  return stripHTML;
};

// strip entities for plainify
const htmlEntityDecoder = (htmlWithEntities: string) => {
  let entityList: { [key: string]: string } = {
    "&nbsp;": " ",
    "&lt;": "<",
    "&gt;": ">",
    "&amp;": "&",
    "&quot;": '"',
    "&#39;": "'",
  };
  let htmlWithoutEntities: string = htmlWithEntities.replace(
    /(&amp;|&lt;|&gt;|&quot;|&#39;)/g,
    (entity: string): string => {
      return entityList[entity];
    },
  );
  return htmlWithoutEntities;
};

// Convert to Uppercase
export const toUpperCase = (content: string) => {
  if (!content) {
    console.warn("No content provided to toUppercase " + content);
    return "";
  }
  return content.toUpperCase();
};

// Convert to Lowercase
export const toLowerCase = (content: string) => {
  if (!content) {
    console.warn("No content provided to toLowercase " + content);
    return "";
  }
  return content.toLowerCase();
};

// Convert to Sentence Case
export const toSentenceCase = (content: string) => {
  if (!content) {
    console.warn("No content provided to toSentenceCase " + content);
    return "";
  }
  const lowercased = content.toLowerCase();
  return lowercased.charAt(0).toUpperCase() + lowercased.slice(1);
};

// Remove whitespace characters
export function removeWhitespace(text: string) {
  return text.replace(/\s+/g, " ").trim();
}
