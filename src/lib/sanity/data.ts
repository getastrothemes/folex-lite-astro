/**
 * Typed content getters used by pages and components.
 *
 * Each getter runs one GROQ query (see `queries.ts`) and maps the Sanity data
 * to the shapes the theme components already understand.
 *
 * About `stegaClean`: in preview mode, text from Sanity contains invisible
 * markers that power visual editing. They are fine in visible text, but must be
 * removed from anything used as a url, id, class, option, number or meta tag.
 */
import { stegaClean } from "@sanity/client/stega";
import { enabledLanguages, useTranslations } from "@/lib/utils/i18nUtils";
import { sanityFetch } from "./fetch";
import {
  footerQuery,
  homePageQuery,
  layoutQuery,
  navigationQuery,
  pageQuery,
  pageSlugsQuery,
  projectQuery,
  projectSlugsQuery,
  projectsQuery,
  servicesQuery,
  siteSettingsQuery,
} from "./queries";
import type {
  BannerSectionData,
  Button,
  ContactFormData,
  ContactFormInput,
  FooterData,
  HomePageData,
  LocalizedSlug,
  NavigationData,
  NavigationLink,
  PageData,
  PortableTextNode,
  PortableTextValue,
  PricingPlan,
  Project,
  ProjectCard,
  ProjectLink,
  SanityImageValue,
  SanityLink,
  SectionData,
  Seo,
  ServiceItem,
  SiteSettings,
} from "./types";

// Small helpers -------------------------------------------------------------------

// Loose type for raw query results
type Raw = Record<string, any>;

/** Removes stega markers and returns a trimmed string ("" for empty values) */
const clean = (value: unknown): string =>
  value === null || value === undefined ? "" : String(stegaClean(value)).trim();

/** Visible text: keeps stega markers, never returns null */
const text = (value: unknown): string =>
  typeof value === "string" ? value : "";

const toNumber = (value: unknown): number | undefined => {
  const cleaned = clean(value);
  const number = Number(cleaned);
  return cleaned !== "" && Number.isFinite(number) ? number : undefined;
};

const asArray = <T>(value: T[] | null | undefined): T[] =>
  Array.isArray(value) ? value.filter(Boolean) : [];

/** Language codes of the documents that share this slug (enabled languages only) */
const toTranslations = (list: unknown): string[] => [
  ...new Set(
    asArray(Array.isArray(list) ? list : [])
      .map(clean)
      .filter((lang) => enabledLanguages.includes(lang)),
  ),
];

/** Applies a section limit (empty or 0 means "show all") */
const applyLimit = <T>(list: T[], limit: unknown): T[] => {
  const max = toNumber(limit);
  return max && max > 0 ? list.slice(0, max) : list;
};

/** Converts a Sanity "Button / link" into the theme `Button` shape */
export const toButton = (
  link: SanityLink | null | undefined,
): Button | null => {
  if (!link || !link.label) return null;
  const url = clean(link.url);
  return {
    enable: link.enabled !== false,
    label: link.label,
    url,
    target: link.openInNewTab ? "_blank" : undefined,
    rel: link.openInNewTab ? "noopener noreferrer" : undefined,
  };
};

const cleanImage = (image: Raw | null | undefined): SanityImageValue | null =>
  image?.asset ? { ...image, alt: image.alt ? clean(image.alt) : "" } : null;

const imageList = (list: Raw[] | null | undefined): SanityImageValue[] =>
  asArray(list)
    .map(cleanImage)
    .filter((image): image is SanityImageValue => image !== null);

/** SEO data is used in meta tags, so every value is cleaned */
const cleanSeo = (seo: Raw | null | undefined): Seo => ({
  metaTitle: clean(seo?.metaTitle) || undefined,
  metaDescription: clean(seo?.metaDescription) || undefined,
  noIndex: seo?.noIndex === true,
  ogImage: cleanImage(seo?.ogImage),
});

/** Portable Text: strips markers from link urls, keeps visible text */
const cleanBody = (body: Raw[] | null | undefined): PortableTextValue =>
  asArray(body).map((block): PortableTextNode => {
    if (block._type === "image") {
      return { _type: "image", ...cleanImage(block) };
    }
    if (!Array.isArray(block.markDefs)) return block as PortableTextNode;
    return {
      ...(block as PortableTextNode),
      markDefs: block.markDefs.map((mark: Raw) =>
        mark._type === "link" ? { ...mark, href: clean(mark.href) } : mark,
      ),
    };
  });

// Site settings -------------------------------------------------------------------

/** Global settings (fetched without visual-editing markers) */
export async function getSiteSettings(preview = false): Promise<SiteSettings> {
  const raw =
    (await sanityFetch<Raw | null>({
      query: siteSettingsQuery,
      preview,
      stega: false,
    })) || {};

  return {
    title: clean(raw.title),
    tagline: clean(raw.tagline),
    description: clean(raw.description),
    logo: cleanImage(raw.logo),
    logoLight: cleanImage(raw.logoLight),
    logoText: clean(raw.logoText),
    logoWidth: toNumber(raw.logoWidth) ?? 86,
    logoHeight: toNumber(raw.logoHeight) ?? 24,
    contactInfo: {
      address: clean(raw.contactInfo?.address),
      email: clean(raw.contactInfo?.email),
      phone: clean(raw.contactInfo?.phone),
    },
    socialLinks: asArray<Raw>(raw.socialLinks)
      .filter((link) => link.platform && link.url)
      .map((link) => ({
        enable: true,
        label: clean(link.platform),
        icon: `/images/icons/svg/${clean(link.platform)}.svg`,
        url: clean(link.url),
      })),
    seo: {
      author: clean(raw.defaultSeo?.author),
      keywords: asArray<string>(raw.defaultSeo?.keywords).map(clean),
      robots: clean(raw.defaultSeo?.robots) || "index, follow",
      twitterHandle: clean(raw.defaultSeo?.twitterHandle),
      ogImage: cleanImage(raw.defaultSeo?.ogImage),
    },
    contactForm: {
      provider: clean(raw.contactForm?.provider) || "formsubmit.co",
      action: clean(raw.contactForm?.action),
    },
    stickyHeader: raw.stickyHeader !== false,
    showCopyright: raw.showCopyright !== false,
    notFound: {
      title: clean(raw.notFound?.title),
      description: clean(raw.notFound?.description),
      buttonLabel: clean(raw.notFound?.buttonLabel),
    },
  };
}

// Navigation ------------------------------------------------------------------------

const toBadge = (badge: Raw | null | undefined) =>
  badge?.label
    ? {
        enable: true,
        label: text(badge.label),
        color: clean(badge.color) || "primary",
        type: "text" as const,
      }
    : undefined;

/** Converts a menu item (and its sub-menus) to the theme `NavigationLink` */
const toNavigationLink = (item: Raw): NavigationLink => {
  const children = asArray<Raw>(item.children).map(toNavigationLink);
  const url = clean(item.url);
  return {
    enable: true,
    name: text(item.label),
    url: url || undefined,
    hasChildren: children.length > 0,
    children: children.length > 0 ? children : undefined,
    badge: toBadge(item.badge),
  };
};

const toNavigation = (raw: Raw): NavigationData => ({
  _id: raw._id,
  _type: raw._type,
  menu: asArray<Raw>(raw.menu).map(toNavigationLink),
  headerButton: toButton(raw.headerButton),
  sidePanel: {
    enable: raw.sidePanel?.enabled === true,
    description: text(raw.sidePanel?.description),
    button: toButton(raw.sidePanel?.button),
  },
});

export async function getNavigation(
  lang: string,
  preview = false,
): Promise<NavigationData> {
  const raw = await sanityFetch<Raw | null>({
    query: navigationQuery,
    params: { lang },
    preview,
  });
  return toNavigation(raw || {});
}

// Footer & contact form -------------------------------------------------------------

/**
 * Turns a slug-like id from a field name, e.g. "Agreed Privacy" → "agreed-privacy".
 * Accented and non-Latin letters are kept ("Consentement confidentialité").
 */
const toId = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");

/**
 * Converts the Studio form fields to the inputs `ContactForm.astro` renders.
 * A radio field becomes one input per option sharing the same `group`.
 */
const toFormInputs = (field: Raw): ContactFormInput[] => {
  const fieldType = clean(field.fieldType) || "text";
  const name = clean(field.name) || clean(field.label);
  const base: ContactFormInput = {
    label: text(field.label),
    placeholder: clean(field.placeholder),
    name,
    required: field.required === true,
    halfWidth: field.halfWidth === true,
  };
  const options = asArray<Raw>(field.options).map((option) => ({
    label: text(option.label),
    value: clean(option.value) || clean(option.label),
  }));

  switch (fieldType) {
    case "email":
      return [{ ...base, type: "email" }];
    case "textarea":
      return [
        { ...base, tag: "textarea", rows: String(toNumber(field.rows) ?? 4) },
      ];
    case "select":
    case "searchSelect":
      return [
        {
          ...base,
          dropdown: {
            type: fieldType === "searchSelect" ? "search" : "select",
            search: { placeholder: clean(field.searchPlaceholder) },
            items: options.map((option) => ({ ...option, selected: false })),
          },
        },
      ];
    case "radio":
      return options.map((option, index) => ({
        ...base,
        type: "radio",
        label: option.label,
        value: option.value,
        group: name,
        // Unique per field and option, so two radio fields with the same
        // option labels (e.g. "Yes"/"No") never share an id
        id: [toId(name), toId(option.value)].filter(Boolean).join("-"),
        // The group label is shown once, above the first option
        groupLabel: index === 0 ? text(field.groupLabel) : "",
      }));
    case "checkbox":
      return [
        {
          ...base,
          type: "checkbox",
          id: toId(name),
          value: clean(field.checkboxValue) || "Yes",
        },
      ];
    default:
      return [{ ...base, type: "text" }];
  }
};

/** Message texts used when the Studio fields are left empty */
type FormMessageDefaults = { success: string; error: string };

const getFormMessageDefaults = async (
  lang: string,
): Promise<FormMessageDefaults> => {
  const t = await useTranslations(lang);
  return { success: t("common.formSuccess"), error: t("common.formError") };
};

const toContactForm = (
  form: Raw | null | undefined,
  defaults: FormMessageDefaults,
): ContactFormData => {
  const inputs = asArray<Raw>(form?.fields).flatMap(toFormInputs);

  // Hidden messages, shown by the form script after submitting. Both are
  // always added (even when the Studio fields are empty) because the form
  // script writes its "sending…" and error texts into them.
  inputs.push(
    {
      note: "success",
      parentClass: "hidden text-sm message success",
      content: text(form?.successMessage) || defaults.success,
    },
    {
      note: "deprecated",
      parentClass: "hidden text-sm message error",
      content: text(form?.errorMessage) || defaults.error,
    },
  );

  return {
    emailSubject: clean(form?.emailSubject) || undefined,
    note: text(form?.note) || undefined,
    submitButton: { enable: true, label: text(form?.submitLabel) || "Send" },
    inputs,
  };
};

const toFooter = (raw: Raw, defaults: FormMessageDefaults): FooterData => ({
  _id: raw._id,
  _type: raw._type,
  title: text(raw.title),
  description: text(raw.description),
  copyright: text(raw.copyright),
  form: toContactForm(raw.contactForm, defaults),
});

export async function getFooter(
  lang: string,
  preview = false,
): Promise<FooterData> {
  const [raw, defaults] = await Promise.all([
    sanityFetch<Raw | null>({ query: footerQuery, params: { lang }, preview }),
    getFormMessageDefaults(lang),
  ]);
  return toFooter(raw || {}, defaults);
}

/**
 * Navigation menu and footer of one language in ONE request. Used by every
 * page (see `Base.astro`), which keeps the preview server's API usage low.
 */
export async function getLayoutContent(
  lang: string,
  preview = false,
): Promise<{ navigation: NavigationData; footer: FooterData }> {
  const [raw, defaults] = await Promise.all([
    sanityFetch<Raw | null>({ query: layoutQuery, params: { lang }, preview }),
    getFormMessageDefaults(lang),
  ]);
  return {
    navigation: toNavigation(raw?.navigation || {}),
    footer: toFooter(raw?.footer || {}, defaults),
  };
}

// Services & projects ----------------------------------------------------------------

const toService = (service: Raw): ServiceItem => ({
  _id: service._id,
  _type: "service",
  title: text(service.title),
  description: text(service.description) || undefined,
  order: toNumber(service.order),
  language: clean(service.language),
});

const toProjectCard = (project: Raw): ProjectCard => ({
  _id: project._id,
  _type: "project",
  title: text(project.title),
  slug: clean(project.slug),
  language: clean(project.language),
  date: clean(project.date) || undefined,
  order: toNumber(project.order),
  categories: asArray<string>(project.categories).map(text),
  description: text(project.description) || undefined,
  coverImage: cleanImage(project.coverImage),
});

export async function getServices(
  lang: string,
  preview = false,
): Promise<ServiceItem[]> {
  const raw = await sanityFetch<Raw[] | null>({
    query: servicesQuery,
    params: { lang },
    preview,
  });
  return asArray(raw).map(toService);
}

export async function getProjects(
  lang: string,
  preview = false,
): Promise<ProjectCard[]> {
  const raw = await sanityFetch<Raw[] | null>({
    query: projectsQuery,
    params: { lang },
    preview,
  });
  return asArray(raw).map(toProjectCard);
}

/** Fills in the "categories" and "date" detail rows */
const toDetailValue = (detail: Raw, project: Raw, lang: string): string => {
  switch (clean(detail.valueType)) {
    case "categories":
      return asArray<string>(project.categories).map(text).join(", ");
    case "date": {
      const date = clean(project.date);
      if (!date) return "";
      return new Date(date).toLocaleDateString(lang, {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      });
    }
    default:
      return text(detail.value);
  }
};

export async function getProject(
  lang: string,
  slug: string,
  preview = false,
): Promise<Project | null> {
  const raw = await sanityFetch<Raw | null>({
    query: projectQuery,
    params: { lang, slug },
    preview,
  });
  if (!raw) return null;

  // Previous/next project, in the same order as the portfolio lists
  const siblings: ProjectLink[] = asArray<Raw>(raw.siblings).map((item) => ({
    title: text(item.title),
    slug: clean(item.slug),
  }));
  const index = siblings.findIndex((item) => item.slug === clean(raw.slug));

  return {
    ...toProjectCard(raw),
    gallery: imageList(raw.gallery),
    details: asArray<Raw>(raw.details)
      .map((detail) => ({
        _key: detail._key,
        label: text(detail.label),
        value: toDetailValue(detail, raw, lang),
      }))
      .filter((detail) => detail.label && detail.value),
    body: cleanBody(raw.body),
    seo: cleanSeo(raw.seo),
    prev: index > 0 ? siblings[index - 1] : null,
    next:
      index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null,
    translations: toTranslations(raw.translations),
  };
}

// Page sections -----------------------------------------------------------------------

const toPricingPlan = (plan: Raw): PricingPlan => ({
  _key: plan._key,
  enable: true,
  name: text(plan.name),
  description: text(plan.description),
  price: {
    prependValue: text(plan.pricePrefix),
    value: text(plan.price),
    appendValue: text(plan.priceSuffix),
  },
  features: asArray<string>(plan.features).map(text),
  button: toButton(plan.button) ?? { enable: false, label: "", url: "" },
});

const TITLE_SIZES = ["display-1", "display-2", "display-3"];

/** Maps one raw section to its typed shape (unknown types are dropped) */
const toSection = (section: Raw): SectionData | null => {
  const base = { _key: section._key, title: text(section.title) };

  switch (section._type) {
    case "bannerSection":
      return {
        ...base,
        _type: "bannerSection",
        titleLines: base.title.split(/\r?\n/).filter((line) => line.trim()),
        titleSize: TITLE_SIZES.includes(clean(section.titleSize) as never)
          ? (clean(section.titleSize) as BannerSectionData["titleSize"])
          : "display-2",
        description: text(section.description),
        image: cleanImage(section.image),
        button: toButton(section.button),
      };
    case "clientsSection":
      return {
        ...base,
        _type: "clientsSection",
        logos: imageList(section.logos),
        appearance: clean(section.appearance) === "dark" ? "dark" : "light",
        columnsPerRow: toNumber(section.columnsPerRow) === 6 ? 6 : 4,
      };
    case "servicesSection":
      return {
        ...base,
        _type: "servicesSection",
        sectionDirection:
          clean(section.sectionDirection) === "horizontal"
            ? "horizontal"
            : "vertical",
        services: applyLimit(
          asArray<Raw>(section.services).map(toService),
          section.limit,
        ),
      };
    case "portfolioSection":
      return {
        ...base,
        _type: "portfolioSection",
        layout: clean(section.layout) === "masonry" ? "masonry" : "grid",
        appearance: clean(section.appearance) === "dark" ? "dark" : "light",
        projects: applyLimit(
          asArray<Raw>(section.projects)
            .filter((project) => project.slug)
            .map(toProjectCard),
          section.limit,
        ),
        button: toButton(section.button),
      };
    case "pricingSection":
      return {
        ...base,
        _type: "pricingSection",
        plans: asArray<Raw>(section.plans).map(toPricingPlan),
      };
    case "contentSection":
      return {
        ...base,
        _type: "contentSection",
        body: cleanBody(section.body),
      };
    default:
      return null;
  }
};

const toSections = (sections: Raw[] | null | undefined): SectionData[] =>
  asArray(sections)
    .map(toSection)
    .filter((section): section is SectionData => section !== null);

// Pages ---------------------------------------------------------------------------------

export async function getHomePage(
  lang: string,
  preview = false,
): Promise<HomePageData | null> {
  const raw = await sanityFetch<Raw | null>({
    query: homePageQuery,
    params: { lang },
    preview,
  });
  if (!raw) return null;

  return {
    _id: raw._id,
    _type: "homePage",
    title: text(raw.title),
    language: clean(raw.language) || lang,
    seo: cleanSeo(raw.seo),
    sections: toSections(raw.sections),
  };
}

export async function getPage(
  lang: string,
  slug: string,
  preview = false,
): Promise<PageData | null> {
  const raw = await sanityFetch<Raw | null>({
    query: pageQuery,
    params: { lang, slug },
    preview,
  });
  if (!raw) return null;

  return {
    _id: raw._id,
    _type: "page",
    title: text(raw.title),
    slug: clean(raw.slug),
    language: clean(raw.language),
    image: cleanImage(raw.image),
    body: cleanBody(raw.body),
    seo: cleanSeo(raw.seo),
    sections: toSections(raw.sections),
    translations: toTranslations(raw.translations),
  };
}

// Static paths --------------------------------------------------------------------------

const toLocalizedSlugs = (list: Raw[] | null | undefined): LocalizedSlug[] =>
  asArray(list)
    .map((item) => ({ lang: clean(item.language), slug: clean(item.slug) }))
    .filter((item) => item.slug && enabledLanguages.includes(item.lang));

/** Published pages of every enabled language (for `getStaticPaths`) */
export async function getAllPageSlugs(): Promise<LocalizedSlug[]> {
  const raw = await sanityFetch<Raw[] | null>({
    query: pageSlugsQuery,
    params: { languages: enabledLanguages },
  });
  return toLocalizedSlugs(raw);
}

/** Published projects of every enabled language (for `getStaticPaths`) */
export async function getAllProjectSlugs(): Promise<LocalizedSlug[]> {
  const raw = await sanityFetch<Raw[] | null>({
    query: projectSlugsQuery,
    params: { languages: enabledLanguages },
  });
  return toLocalizedSlugs(raw);
}
