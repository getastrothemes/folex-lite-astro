#!/usr/bin/env node
/**
 * Build the Sanity demo content (sanity/seed/demo-content.json).
 *
 * This script converts the ORIGINAL file based theme content (markdown,
 * json and toml files) into Sanity documents. It reads every file straight
 * from git (`git show <ref>:<path>`), so it keeps working after the
 * `src/content` folder was removed from the CMS edition.
 *
 * The generated JSON is used in two places:
 * - `npm run import-demo` uploads it to your Sanity project.
 * - The website uses it as a local fallback when Sanity is not configured.
 *
 * Usage:
 *   node scripts/sanity/build-seed.mjs              # use the pinned commit
 *   node scripts/sanity/build-seed.mjs --ref main   # use another git ref
 *
 * Re-running the script always produces the same output (stable ids and keys).
 */

import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import * as toml from "toml";
import { marked } from "marked";

// ---------- Paths & options ----------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const OUTPUT_FILE = path.join(ROOT, "sanity", "seed", "demo-content.json");

// Last commit of the file based theme (main before the Sanity migration).
// Pinned so the script still works after the CMS edition is merged to main.
const DEFAULT_REF = "6fdc26393cd0d918f3c2a8d6d55edf01e73b6208";

const refArgIndex = process.argv.indexOf("--ref");
const REF =
  refArgIndex > -1 && process.argv[refArgIndex + 1]
    ? process.argv[refArgIndex + 1]
    : DEFAULT_REF;

// Type name used for the `{ label, value }` items of a form field's options
const FORM_OPTION_TYPE = "formOption";

// ---------- Git helpers ----------

/** Run a git command, with a friendly message when the ref is missing */
const git = (args, options = {}) => {
  try {
    return execFileSync("git", args, {
      cwd: ROOT,
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
      ...options,
    });
  } catch (error) {
    console.error(
      `\x1b[31mCould not read the original theme content from git ref "${REF}".\x1b[0m` +
        "\nThis script needs the git history of the file based theme." +
        "\nUse `--ref <branch-or-commit>` to point to a commit that still has `src/content`.",
    );
    console.error(String(error.stderr || error.message).trim());
    process.exit(1);
  }
};

/** Read a file from the pinned git ref */
const gitFile = (filePath) => git(["show", `${REF}:${filePath}`]);

/** List files of a folder in the pinned git ref */
const gitList = (folder) =>
  git(["ls-tree", "-r", "--name-only", REF, "--", folder])
    .split("\n")
    .filter(Boolean)
    .sort();

const gitJson = (filePath) => JSON.parse(gitFile(filePath));

/** Read a markdown/mdx file and return `{ data, content }` */
const gitMatter = (filePath) => {
  const { data, content } = matter(gitFile(filePath));
  return { data, content };
};

/** File name without folder and extension (`portfolio-01`) */
const baseName = (filePath) => path.basename(filePath).replace(/\.mdx?$/, "");

// ---------- Small value helpers ----------

/** Deterministic `_key` generator, unique per document */
const createKeyGen = (docId) => {
  let counter = 0;
  return () =>
    createHash("sha1")
      .update(`${docId}:${counter++}`)
      .digest("hex")
      .slice(0, 12);
};

/** Trim strings and turn empty strings into `undefined` */
const text = (value) => {
  if (value === undefined || value === null) return undefined;
  const trimmed = String(value).trim();
  return trimmed === "" ? undefined : trimmed;
};

/** Turn `<br />` tags into real line breaks */
const brToNewline = (value) => text(value)?.replace(/\s*<br\s*\/?>\s*/gi, "\n");

/** Remove markdown links: `[label](url)` becomes `label` */
const stripMarkdownLinks = (value) =>
  text(value)?.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");

/** `2022-06-13` (or a Date parsed by gray-matter) as `YYYY-MM-DD` */
const isoDate = (value) => {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().slice(0, 10);
};

// Portable Text expects these arrays even when they are empty
const KEEP_EMPTY = ["markDefs", "marks"];

/** Remove `undefined` values and empty objects/arrays (keeps false and 0) */
const clean = (value) => {
  if (Array.isArray(value)) {
    const list = value.map(clean).filter((item) => item !== undefined);
    return list.length ? list : undefined;
  }
  if (value && typeof value === "object") {
    const result = {};
    for (const [key, child] of Object.entries(value)) {
      const cleaned = clean(child);
      if (cleaned !== undefined) result[key] = cleaned;
      else if (KEEP_EMPTY.includes(key)) result[key] = [];
    }
    const keys = Object.keys(result).filter((key) => key !== "_type");
    return keys.length ? result : undefined;
  }
  return value;
};

// ---------- Images ----------

/**
 * Turn a theme image path (`/images/portfolio/1.jpg`) into the value the
 * Sanity importer understands. Images live in `src/assets/images`; a few
 * (like the OpenGraph image) only exist in `public/images`.
 */
const image = (src, alt) => {
  if (!src) return undefined;
  const relative = src.replace(/^\/?images\//, "");
  const candidates = [
    `src/assets/images/${relative}`,
    `public/images/${relative}`,
  ];
  const found = candidates.find((file) => fs.existsSync(path.join(ROOT, file)));
  if (!found) {
    throw new Error(`Image not found for "${src}" (looked in ${candidates})`);
  }
  return {
    _type: "image",
    _sanityAsset: `image@file://./${found}`,
    alt: text(alt),
  };
};

/** Button / link object (contract type `link`) */
const link = (button, fallbackLabel) =>
  button
    ? {
        _type: "link",
        enabled: button.enable !== false,
        label: text(button.label) || text(fallbackLabel),
        url: text(button.url),
        openInNewTab: button.target === "_blank",
      }
    : undefined;

// ---------- Markdown to Portable Text ----------

const HTML_ENTITIES = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};
const decodeEntities = (value) =>
  value.replace(
    /&(amp|lt|gt|quot|#39|nbsp);/g,
    (match) => HTML_ENTITIES[match],
  );

/**
 * Converts inline markdown tokens to Portable Text spans.
 * - A single line break inside a paragraph becomes a space (like HTML).
 * - A hard line break (`<br>`, two trailing spaces) becomes "\n".
 */
const inlineToSpans = (tokens = [], marks, ctx) => {
  const spans = [];
  const push = (value) => {
    if (value) spans.push({ text: value, marks: [...marks] });
  };

  for (const token of tokens) {
    switch (token.type) {
      case "text":
        if (token.tokens?.length) {
          spans.push(...inlineToSpans(token.tokens, marks, ctx));
        } else {
          push(decodeEntities(token.text).replace(/\s*\n\s*/g, " "));
        }
        break;
      case "escape":
      case "codespan":
        push(decodeEntities(token.text));
        break;
      case "br":
        push("\n");
        break;
      case "html":
        if (/^<br\s*\/?>$/i.test(token.text.trim())) push("\n");
        break;
      case "strong":
        spans.push(...inlineToSpans(token.tokens, [...marks, "strong"], ctx));
        break;
      case "em":
        spans.push(...inlineToSpans(token.tokens, [...marks, "em"], ctx));
        break;
      case "link": {
        // External links opened in a new tab in the original theme
        const markKey = ctx.key();
        ctx.markDefs.push({
          _key: markKey,
          _type: "link",
          href: token.href,
          openInNewTab: /^https?:\/\//.test(token.href),
        });
        spans.push(...inlineToSpans(token.tokens, [...marks, markKey], ctx));
        break;
      }
      default:
        if (token.text) push(decodeEntities(token.text));
    }
  }
  return spans;
};

/** Create one Portable Text block from inline tokens */
const createBlock = (inlineTokens, options, key, transform) => {
  const ctx = { key, markDefs: [] };
  let spans = inlineToSpans(inlineTokens, [], ctx);
  if (transform)
    spans = spans.map((span) => ({ ...span, text: transform(span.text) }));

  // Merge neighbours that share the same marks
  const merged = [];
  for (const span of spans) {
    const previous = merged[merged.length - 1];
    if (previous && previous.marks.join() === span.marks.join()) {
      previous.text += span.text;
    } else {
      merged.push({ ...span });
    }
  }

  // Trim the outer whitespace of the block
  if (merged.length) {
    merged[0].text = merged[0].text.replace(/^\s+/, "");
    const last = merged[merged.length - 1];
    last.text = last.text.replace(/\s+$/, "");
  }
  const children = merged.filter((span) => span.text !== "");
  if (!children.length) return undefined;

  return {
    _type: "block",
    _key: key(),
    style: options.style || "normal",
    ...(options.listItem && {
      listItem: options.listItem,
      level: options.level,
    }),
    markDefs: ctx.markDefs,
    children: children.map((span) => ({
      _type: "span",
      _key: key(),
      text: span.text,
      marks: span.marks,
    })),
  };
};

/** Heading depth (and `[.text-h3]` class annotations) to a block style */
const headingStyle = (depth, classes) => {
  // `## Title [.text-h3]` rendered an h2 that looks like an h3: keep the look
  const sizeClass = classes.find((cls) => /^text-h\d$/.test(cls));
  const level = sizeClass ? Number(sizeClass.slice(-1)) : depth;
  return `h${Math.min(Math.max(level, 2), 4)}`;
};

/** Converts block level markdown tokens (recursive for nested lists) */
const tokensToBlocks = (tokens, key, list) => {
  const blocks = [];
  const add = (block) => block && blocks.push(block);

  for (const token of tokens) {
    switch (token.type) {
      case "heading": {
        // Remove class annotations like `[.text-h3 .mb-0]` from the heading
        const classRegex = /\[([^\]]+)\]/g;
        const classes = [...token.text.matchAll(classRegex)]
          .flatMap((match) => match[1].split(/\s+/))
          .filter((cls) => cls.startsWith("."))
          .map((cls) => cls.slice(1));
        add(
          createBlock(
            token.tokens,
            { style: headingStyle(token.depth, classes) },
            key,
            classes.length
              ? (value) => value.replace(classRegex, "")
              : undefined,
          ),
        );
        break;
      }
      case "paragraph":
      case "text":
        add(
          createBlock(
            token.tokens || [token],
            { style: "normal", ...list },
            key,
          ),
        );
        break;
      case "blockquote":
        for (const child of token.tokens) {
          if (child.tokens) {
            add(createBlock(child.tokens, { style: "blockquote" }, key));
          }
        }
        break;
      case "list": {
        const listItem = token.ordered ? "number" : "bullet";
        const level = list ? list.level + 1 : 1;
        for (const item of token.items) {
          blocks.push(...tokensToBlocks(item.tokens, key, { listItem, level }));
        }
        break;
      }
      case "code":
        add(
          createBlock(
            [{ type: "text", text: token.text }],
            { style: "normal" },
            key,
          ),
        );
        break;
      default:
        // `space`, `hr`, raw `html` and MDX components are not converted
        break;
    }
  }
  return blocks;
};

/**
 * Typographic quotes, like Astro's Markdown pipeline (smartypants) did for
 * page and project bodies: "a" → “a”, it's → it’s. Each quote is replaced by
 * one character, so the text is curled across span boundaries and split back
 * into the same spans.
 */
const OPENING_CONTEXT = /[\s([{\u2014\u2013-]/;
const smartQuotes = (blocks) =>
  blocks.map((block) => {
    if (!Array.isArray(block.children)) return block;
    const full = block.children.map((span) => span.text || "").join("");
    if (!/["']/.test(full)) return block;
    const curled = [...full]
      .map((char, index) => {
        if (char !== '"' && char !== "'") return char;
        const before = full[index - 1];
        const opening = before === undefined || OPENING_CONTEXT.test(before);
        if (char === '"') return opening ? "\u201C" : "\u201D";
        return opening ? "\u2018" : "\u2019";
      })
      .join("");
    let offset = 0;
    const children = block.children.map((span) => {
      const length = (span.text || "").length;
      const text = curled.slice(offset, offset + length);
      offset += length;
      return span.text === undefined ? span : { ...span, text };
    });
    return { ...block, children };
  });

/** Markdown string to a Portable Text array */
const markdownToPortableText = (markdown, key) =>
  smartQuotes(tokensToBlocks(marked.lexer(markdown || ""), key));

// ---------- Source data ----------

const languages = gitJson("src/config/language.json");
const config = toml.parse(gitFile("src/config/config.toml"));
const social = gitJson("src/config/social.json");

/** Read a file of a language folder: `section("sections", "banner", lang)` */
const contentEntry = (collection, name, lang) =>
  gitMatter(`src/content/${collection}/${lang.contentDir}/${name}.md`).data;

/** All entries of a collection (sorted by file name, `-index` excluded) */
const collectionEntries = (collection, lang) =>
  gitList(`src/content/${collection}/${lang.contentDir}`)
    .filter((file) => /\.mdx?$/.test(file) && !baseName(file).startsWith("-"))
    .map((file) => ({ file, slug: baseName(file), ...gitMatter(file) }));

/** The 404 page copy was hardcoded in `src/pages/404.astro` */
const notFoundCopy = () => {
  const source = gitFile("src/pages/404.astro");
  const heading = source.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1];
  const paragraph = source.match(/<p>([\s\S]*?)<\/p>/)?.[1];
  const button = source.match(/label="([^"]+)"/)?.[1];
  return {
    title: text(heading),
    description: text(paragraph)?.replace(/\s+/g, " "),
    buttonLabel: text(button),
  };
};

// ---------- Documents ----------

const buildSiteSettings = () => {
  const { site, seo, settings, opengraph } = config;
  const key = createKeyGen("siteSettings");
  const px = (value) => Number.parseFloat(value) || undefined;

  return {
    _id: "siteSettings",
    _type: "siteSettings",
    title: text(site.title),
    tagline: text(site.tagline),
    description: text(site.description),
    // Same alt text the original Logo component generated
    logo: image(site.logo, `Brand logo of ${site.title.toLowerCase()}`),
    logoLight: image(
      site.logoAlternate,
      `Brand logo of ${site.title.toLowerCase()}`,
    ),
    logoText: text(site.logoText),
    logoWidth: px(site.logoWidth),
    logoHeight: px(site.logoHeight),
    contactInfo: {
      address: brToNewline(settings.contactInfo.address),
      email: stripMarkdownLinks(settings.contactInfo.email),
      phone: stripMarkdownLinks(settings.contactInfo.phone),
    },
    socialLinks: social.main
      .filter((item) => item.enable)
      .map((item) => ({
        _type: "socialLink",
        _key: key(),
        platform: item.label,
        url: item.url,
      })),
    seo: {
      author: text(seo.author),
      keywords: seo.keywords,
      robots: text(seo.robots),
      ogImage: image(opengraph.image, site.title),
      twitterHandle: text(opengraph.twitter),
    },
    contactForm: {
      provider: settings.contactFormProvider,
      action: settings.contactFormAction,
    },
    stickyHeader: settings.stickyHeader !== false,
    showCopyright: settings.copyright?.enable !== false,
    notFound: notFoundCopy(),
  };
};

const buildHomePage = (lang) => {
  const _id = `homePage-${lang.languageCode}`;
  const key = createKeyGen(_id);
  const home = contentEntry("homepage", "-index", lang);
  const section = (name) => contentEntry("sections", name, lang);

  const banner = section("banner");
  const clients = section("clients");
  const services = section("services-section");
  const portfolio = section("portfolio-section");
  const pricing = section("pricing-section");
  const bannerTitle = brToNewline(banner.title);

  // Same order as the original `src/pages/[...lang]/index.astro`
  const sections = [
    {
      _type: "bannerSection",
      _key: key(),
      hidden: banner.enable === false,
      title: bannerTitle,
      titleSize: banner.titleSize,
      description: text(banner.description),
      image: image(banner.image, bannerTitle?.replace(/\n/g, " ")),
      button: link(banner.button),
    },
    {
      _type: "clientsSection",
      _key: key(),
      hidden: clients.enable === false,
      title: text(clients.title),
      logos: clients.list.map((logo) => ({
        ...image(logo.src, logo.alt),
        _key: key(),
      })),
      appearance: clients.options?.appearance,
      columnsPerRow: clients.options?.columnsPerRow,
    },
    {
      _type: "servicesSection",
      _key: key(),
      hidden: services.enable === false,
      title: text(services.title),
      sectionDirection: services.sectionDirection || "vertical",
      limit: services.options?.limit || undefined,
    },
    {
      _type: "portfolioSection",
      _key: key(),
      hidden: portfolio.enable === false,
      title: text(portfolio.title),
      layout: portfolio.options?.layout,
      appearance: portfolio.options?.appearance,
      limit: portfolio.options?.limit || undefined,
      button: link(portfolio.button),
    },
    {
      _type: "pricingSection",
      _key: key(),
      hidden: pricing.enable === false,
      title: text(pricing.title),
      plans: pricing.list
        .filter((plan) => plan.enable !== false)
        .map((plan) => ({
          _type: "pricingPlan",
          _key: key(),
          name: text(plan.name),
          description: text(plan.description),
          pricePrefix: plan.price?.prependValue,
          price: plan.price?.value,
          priceSuffix: plan.price?.appendValue,
          features: plan.features,
          button: link(plan.button),
        })),
    },
  ];

  return {
    _id,
    _type: "homePage",
    language: lang.languageCode,
    title: text(home.title),
    seo: {
      _type: "seo",
      metaTitle: text(home.metaTitle),
      metaDescription: text(home.metaDescription ?? home.description),
    },
    sections,
  };
};

const buildNavigation = (lang) => {
  const _id = `navigation-${lang.languageCode}`;
  const key = createKeyGen(_id);
  const menu = gitJson(`src/config/menu.${lang.languageCode}.json`);
  const t = gitJson(`src/i18n/${lang.languageCode}.json`);
  const { navigationButton, headerOffcanvas } = config.settings;

  // menuItem > menuChild > menuGrandchild
  const types = ["menuItem", "menuChild", "menuGrandchild"];
  const convert = (items = [], depth = 0) =>
    items
      .filter((item) => item.enable !== false)
      .map((item) => ({
        _type: types[depth],
        _key: key(),
        label: text(item.name),
        url: text(item.url),
        badge:
          item.badge?.enable !== false && item.badge?.label
            ? {
                _type: "menuBadge",
                label: item.badge.label,
                color: item.badge.color,
              }
            : undefined,
        children:
          depth < 2 && item.children
            ? convert(item.children, depth + 1)
            : undefined,
      }));

  return {
    _id,
    _type: "navigation",
    language: lang.languageCode,
    menu: convert(menu.headerPrimary),
    headerButton: link(navigationButton, t.navigation?.buttonLabel),
    sidePanel: {
      enabled: headerOffcanvas.enable !== false,
      description:
        text(headerOffcanvas.description) ||
        text(t.headerOffcanvas?.description),
      button: link(headerOffcanvas.button, t.headerOffcanvas?.buttonLabel),
    },
  };
};

/** Contact form inputs (theme format) to Sanity `formField` objects */
const buildFormFields = (inputs, key) => {
  const fields = [];
  const radioGroups = {};
  const messages = {};

  for (const input of inputs) {
    // Success / error notes shown after submitting
    if (input.note) {
      const type = /\berror\b/.test(input.parentClass || "")
        ? "error"
        : "success";
      messages[type] = text(input.content);
      continue;
    }

    const base = {
      _type: "formField",
      name: text(input.name),
      label: text(input.label),
      placeholder: text(input.placeholder),
      required: Boolean(input.required),
      halfWidth: Boolean(input.halfWidth),
    };

    // Radio inputs of the same `group` become one field with options
    if (input.type === "radio") {
      const groupName = input.group || input.name;
      if (!radioGroups[groupName]) {
        radioGroups[groupName] = {
          _key: key(),
          ...base,
          fieldType: "radio",
          label: undefined,
          placeholder: undefined,
          groupLabel: text(input.groupLabel),
          options: [],
        };
        fields.push(radioGroups[groupName]);
      }
      radioGroups[groupName].options.push({
        _type: FORM_OPTION_TYPE,
        _key: key(),
        label: text(input.label),
        // A radio without `value` submitted its label
        value: text(input.value) || text(input.label),
      });
      continue;
    }

    if (input.type === "checkbox") {
      fields.push({
        _key: key(),
        ...base,
        fieldType: "checkbox",
        placeholder: undefined,
        checkboxValue: text(input.value),
      });
      continue;
    }

    if (input.dropdown) {
      const isSearch = input.dropdown.type === "search";
      fields.push({
        _key: key(),
        ...base,
        fieldType: isSearch ? "searchSelect" : "select",
        searchPlaceholder: isSearch
          ? text(input.dropdown.search?.placeholder)
          : undefined,
        options: (input.dropdown.items || []).map((item) => ({
          _type: FORM_OPTION_TYPE,
          _key: key(),
          label: text(item.label),
          value: text(item.value) || text(item.label),
        })),
      });
      continue;
    }

    if (input.tag === "textarea") {
      fields.push({
        _key: key(),
        ...base,
        fieldType: "textarea",
        rows: Number(input.rows) || undefined,
      });
      continue;
    }

    fields.push({ _key: key(), ...base, fieldType: input.type || "text" });
  }

  return { fields, messages };
};

const buildFooter = (lang) => {
  const _id = `footer-${lang.languageCode}`;
  const key = createKeyGen(_id);
  const cta = contentEntry("sections", "call-to-action", lang);
  const { form } = contentEntry("sections", "contact-section", lang);
  const t = gitJson(`src/i18n/${lang.languageCode}.json`);
  const { fields, messages } = buildFormFields(form.inputs, key);

  return {
    _id,
    _type: "footer",
    language: lang.languageCode,
    title: text(cta.title),
    description: text(cta.description),
    copyright:
      text(config.settings.copyright?.text) || text(t.footer?.copyright),
    contactForm: {
      emailSubject: text(form.emailSubject),
      submitLabel: text(form.submitButton?.label),
      note: text(form.note),
      fields,
      successMessage: messages.success,
      errorMessage: messages.error,
    },
  };
};

const buildPages = (lang) =>
  collectionEntries("pages", lang)
    .filter((entry) => !entry.data.draft)
    .map(({ slug, data, content }) => {
      const _id = `page-${lang.languageCode}-${slug}`;
      const key = createKeyGen(_id);
      return {
        _id,
        _type: "page",
        title: text(data.title),
        slug: { _type: "slug", current: text(data.customSlug) || slug },
        language: lang.languageCode,
        image: data.image ? image(data.image, data.title) : undefined,
        body: markdownToPortableText(content, key),
        seo: {
          _type: "seo",
          metaTitle: text(data.metaTitle),
          metaDescription: text(data.metaDescription ?? data.description),
        },
      };
    });

const buildProjects = (lang) =>
  collectionEntries("portfolio", lang)
    .filter((entry) => !entry.data.draft)
    .map(({ slug, data, content }, index) => {
      const _id = `project-${lang.languageCode}-${slug}`;
      const key = createKeyGen(_id);
      const title = text(data.title);
      return {
        _id,
        _type: "project",
        title,
        slug: { _type: "slug", current: text(data.customSlug) || slug },
        language: lang.languageCode,
        date: isoDate(data.date),
        // File name order was the display order of the original theme
        order: index + 1,
        categories: data.categories,
        description: text(data.description),
        coverImage: image(data.image, title),
        gallery: (data.images || []).map((src, imageIndex) => ({
          ...image(src, `${title} image ${imageIndex + 1}`),
          _key: key(),
        })),
        // `value: "categories" | "date"` was filled in automatically
        details: (data.information || []).map((item) => {
          const valueType = ["categories", "date"].includes(item.value)
            ? item.value
            : "custom";
          return {
            _type: "projectDetail",
            _key: key(),
            label: text(item.label),
            valueType,
            value: valueType === "custom" ? text(item.value) : undefined,
          };
        }),
        body: markdownToPortableText(content, key),
        seo: {
          _type: "seo",
          metaTitle: text(data.metaTitle),
          metaDescription: text(data.metaDescription),
        },
      };
    });

const buildServices = (lang) =>
  collectionEntries("services", lang)
    .filter((entry) => !entry.data.draft)
    .map(({ slug, data }, index) => ({
      _id: `service-${lang.languageCode}-${slug}`,
      _type: "service",
      title: text(data.title),
      language: lang.languageCode,
      description: text(data.description),
      order: index + 1,
    }));

// ---------- Validation ----------

// Allowed fields of every object type (from the shared content model).
// `{ ... }` = inline object, `[type]` = array, other strings = type names.
const IMAGE = { _sanityAsset: "string", alt: "string", caption: "string" };
const LINK = {
  enabled: "boolean",
  label: "string",
  url: "string",
  openInNewTab: "boolean",
};
const SEO = {
  metaTitle: "string",
  metaDescription: "string",
  ogImage: "image",
  noIndex: "boolean",
};
const BADGE = { label: "string", color: "string" };
const SCHEMA = {
  image: IMAGE,
  link: LINK,
  seo: SEO,
  menuBadge: BADGE,
  slug: { current: "string" },
  block: {
    style: "string",
    listItem: "string",
    level: "number",
    markDefs: ["link"],
    children: ["span"],
  },
  span: { text: "string", marks: ["string"] },
  socialLink: { platform: "string", url: "string" },
  menuItem: {
    label: "string",
    url: "string",
    badge: "menuBadge",
    children: ["menuChild"],
  },
  menuChild: {
    label: "string",
    url: "string",
    badge: "menuBadge",
    children: ["menuGrandchild"],
  },
  menuGrandchild: { label: "string", url: "string", badge: "menuBadge" },
  formField: {
    fieldType: "string",
    name: "string",
    label: "string",
    placeholder: "string",
    required: "boolean",
    halfWidth: "boolean",
    rows: "number",
    options: [FORM_OPTION_TYPE],
    searchPlaceholder: "string",
    groupLabel: "string",
    checkboxValue: "string",
  },
  [FORM_OPTION_TYPE]: { label: "string", value: "string" },
  projectDetail: { label: "string", valueType: "string", value: "string" },
  pricingPlan: {
    name: "string",
    description: "string",
    pricePrefix: "string",
    price: "string",
    priceSuffix: "string",
    features: ["string"],
    button: "link",
  },
  bannerSection: {
    hidden: "boolean",
    title: "string",
    titleSize: "string",
    description: "string",
    image: "image",
    button: "link",
  },
  clientsSection: {
    hidden: "boolean",
    title: "string",
    logos: ["image"],
    appearance: "string",
    columnsPerRow: "number",
  },
  servicesSection: {
    hidden: "boolean",
    title: "string",
    sectionDirection: "string",
    services: ["reference"],
    limit: "number",
  },
  portfolioSection: {
    hidden: "boolean",
    title: "string",
    layout: "string",
    appearance: "string",
    projects: ["reference"],
    limit: "number",
    button: "link",
  },
  pricingSection: {
    hidden: "boolean",
    title: "string",
    plans: ["pricingPlan"],
  },
  contentSection: {
    hidden: "boolean",
    title: "string",
    body: ["block", "image"],
  },
  reference: { _ref: "string" },
  // Documents
  siteSettings: {
    title: "string",
    tagline: "string",
    description: "string",
    logo: "image",
    logoLight: "image",
    logoText: "string",
    logoWidth: "number",
    logoHeight: "number",
    contactInfo: { address: "string", email: "string", phone: "string" },
    socialLinks: ["socialLink"],
    seo: {
      author: "string",
      keywords: ["string"],
      robots: "string",
      ogImage: "image",
      twitterHandle: "string",
    },
    contactForm: { provider: "string", action: "string" },
    stickyHeader: "boolean",
    showCopyright: "boolean",
    notFound: { title: "string", description: "string", buttonLabel: "string" },
  },
  homePage: {
    language: "string",
    title: "string",
    seo: "seo",
    sections: [
      "bannerSection",
      "clientsSection",
      "servicesSection",
      "portfolioSection",
      "pricingSection",
      "contentSection",
    ],
  },
  navigation: {
    language: "string",
    menu: ["menuItem"],
    headerButton: "link",
    sidePanel: { enabled: "boolean", description: "string", button: "link" },
  },
  footer: {
    language: "string",
    title: "string",
    description: "string",
    copyright: "string",
    contactForm: {
      emailSubject: "string",
      submitLabel: "string",
      note: "string",
      fields: ["formField"],
      successMessage: "string",
      errorMessage: "string",
    },
  },
  page: {
    title: "string",
    slug: "slug",
    language: "string",
    image: "image",
    body: ["block", "image"],
    sections: [
      "bannerSection",
      "clientsSection",
      "servicesSection",
      "portfolioSection",
      "pricingSection",
      "contentSection",
    ],
    seo: "seo",
  },
  project: {
    title: "string",
    slug: "slug",
    language: "string",
    date: "string",
    order: "number",
    categories: ["string"],
    description: "string",
    coverImage: "image",
    gallery: ["image"],
    details: ["projectDetail"],
    body: ["block", "image"],
    seo: "seo",
  },
  service: {
    title: "string",
    language: "string",
    description: "string",
    order: "number",
  },
};

const PRIMITIVES = ["string", "number", "boolean"];
const SYSTEM_FIELDS = ["_id", "_type", "_key"];

/** Validate one value against a schema entry, collecting error messages */
const validateValue = (value, spec, where, errors) => {
  if (typeof spec === "string" && PRIMITIVES.includes(spec)) {
    if (typeof value !== spec) errors.push(`${where}: expected ${spec}`);
    return;
  }

  if (Array.isArray(spec)) {
    if (!Array.isArray(value)) return errors.push(`${where}: expected array`);
    const keys = new Set();
    value.forEach((item, index) => {
      const itemWhere = `${where}[${index}]`;
      if (item && typeof item === "object") {
        if (!item._key) errors.push(`${itemWhere}: missing _key`);
        else if (keys.has(item._key))
          errors.push(`${itemWhere}: duplicate _key ${item._key}`);
        else if (!/^[A-Za-z0-9_-]+$/.test(item._key))
          errors.push(`${itemWhere}: invalid _key`);
        keys.add(item._key);
        if (!spec.includes(item._type)) {
          errors.push(
            `${itemWhere}: _type "${item._type}" not allowed (${spec})`,
          );
          return;
        }
        validateValue(item, item._type, itemWhere, errors);
      } else {
        const type = typeof item;
        if (!spec.includes(type))
          errors.push(`${itemWhere}: ${type} not allowed`);
      }
    });
    return;
  }

  const fields = typeof spec === "string" ? SCHEMA[spec] : spec;
  if (!fields) return errors.push(`${where}: unknown type ${spec}`);
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return errors.push(`${where}: expected object`);
  }
  if (typeof spec === "string" && value._type && value._type !== spec) {
    errors.push(`${where}: _type "${value._type}" should be "${spec}"`);
  }

  for (const [field, child] of Object.entries(value)) {
    if (SYSTEM_FIELDS.includes(field)) continue;
    // `markDefs` link annotations use `href` instead of `url`
    if (spec === "link" && where.includes(".markDefs[") && field === "href")
      continue;
    if (!(field in fields)) {
      errors.push(`${where}.${field}: field not in the content model`);
      continue;
    }
    validateValue(child, fields[field], `${where}.${field}`, errors);
  }

  // Every local image must point to a file that exists
  if (value._sanityAsset) {
    const file = value._sanityAsset.replace(/^image@file:\/\/\.\//, "");
    if (!fs.existsSync(path.join(ROOT, file))) {
      errors.push(`${where}: image file missing ${file}`);
    }
  }
};

const validateDocuments = (documents) => {
  const errors = [];
  const ids = new Set();
  for (const doc of documents) {
    if (ids.has(doc._id)) errors.push(`${doc._id}: duplicate _id`);
    if (doc._id.includes("."))
      errors.push(`${doc._id}: _id must not contain "."`);
    ids.add(doc._id);
    validateValue(doc, doc._type, doc._id, errors);
  }
  return errors;
};

// ---------- Run ----------

const documents = [buildSiteSettings()];
for (const lang of languages) {
  documents.push(
    buildHomePage(lang),
    buildNavigation(lang),
    buildFooter(lang),
    ...buildPages(lang),
    ...buildProjects(lang),
    ...buildServices(lang),
  );
}

// Some original French texts lost their accented letters (they became spaces
// or disappeared). Repair those strings so the demo content reads correctly.
const TEXT_FIXES = [
  [/^Politique de confidentialit\s*$/, "Politique de confidentialité"],
  [/description m ta$/, "description méta"],
  [/^Agence cr atrice$/, "Agence créative"],
  [/^Agence de d$/, "Agence de démarrage"],
  [/^propos$/, "À propos"],
  [/^Mosa que$/, "Mosaïque"],
  [/^Largeur$/, "Pleine largeur"],
  [/^Cr atif$/, "Créatif"],
  [/^quipe$/, "Équipe"],
  [/^quipe simple$/, "Équipe simple"],
  [/^l ments$/, "Éléments"],
];
const fixText = (value) => {
  if (typeof value === "string") {
    return TEXT_FIXES.reduce((text, [from, to]) => text.replace(from, to), value);
  }
  if (Array.isArray(value)) return value.map(fixText);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, fixText(item)]),
    );
  }
  return value;
};

const cleaned = documents.map(clean).map(fixText);
const errors = validateDocuments(cleaned);
if (errors.length) {
  console.error(
    `\x1b[31mDemo content is invalid:\x1b[0m\n- ${errors.join("\n- ")}`,
  );
  process.exit(1);
}

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(
  OUTPUT_FILE,
  JSON.stringify({ documents: cleaned }, null, 2) + "\n",
);

const count = cleaned.reduce((total, doc) => {
  total[doc._type] = (total[doc._type] || 0) + 1;
  return total;
}, {});
console.log(
  `\x1b[32mWrote ${cleaned.length} documents to ${path.relative(ROOT, OUTPUT_FILE)}\x1b[0m`,
);
console.log(
  Object.entries(count)
    .map(([type, total]) => `  ${type}: ${total}`)
    .join("\n"),
);
