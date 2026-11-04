/**
 * Types for the content returned by `data.ts`.
 *
 * "Raw" types mirror the GROQ query results. The other types are the shapes
 * the theme components already use (buttons, menus, contact form, ...).
 */
import type { Button, NavigationLink, SocialLink } from "@/types";

export type { Button, NavigationLink, SocialLink };

// Images ----------------------------------------------------------------------

export type SanityImageAsset = {
  _id: string;
  url: string;
  mimeType?: string | null;
  metadata?: {
    dimensions?: {
      width: number;
      height: number;
      aspectRatio: number;
    } | null;
    lqip?: string | null;
  } | null;
};

/** An image field with its alt text and resolved asset */
export type SanityImageValue = {
  _type?: string;
  _key?: string;
  alt?: string | null;
  caption?: string | null;
  hotspot?: { x: number; y: number; height: number; width: number } | null;
  crop?: { top: number; bottom: number; left: number; right: number } | null;
  asset?: SanityImageAsset | null;
};

// Portable Text (rich text) -----------------------------------------------------

export type PortableTextNode = {
  _type: string;
  _key?: string;
  [key: string]: unknown;
};

export type PortableTextValue = PortableTextNode[];

// Shared objects ----------------------------------------------------------------

/** The "Button / link" object as stored in Sanity */
export type SanityLink = {
  enabled?: boolean | null;
  label?: string | null;
  url?: string | null;
  openInNewTab?: boolean | null;
};

export type Seo = {
  metaTitle?: string;
  metaDescription?: string;
  noIndex?: boolean;
  ogImage?: SanityImageValue | null;
};

// Site settings -------------------------------------------------------------------

export type SiteSettings = {
  title: string;
  tagline: string;
  description: string;
  logo: SanityImageValue | null;
  logoLight: SanityImageValue | null;
  logoText: string;
  /** Logo size in px */
  logoWidth: number;
  logoHeight: number;
  contactInfo: { address: string; email: string; phone: string };
  /** Same shape as the old `social.json` entries */
  socialLinks: SocialLink[];
  seo: {
    author: string;
    keywords: string[];
    robots: string;
    twitterHandle: string;
    ogImage: SanityImageValue | null;
  };
  contactForm: {
    provider: "formsubmit.co" | "formspree" | "netlify" | string;
    action: string;
  };
  stickyHeader: boolean;
  showCopyright: boolean;
  notFound: { title: string; description: string; buttonLabel: string };
};

// Navigation ------------------------------------------------------------------------

export type NavigationData = {
  _id?: string;
  _type?: string;
  menu: NavigationLink[];
  headerButton: Button | null;
  sidePanel: {
    enable: boolean;
    description: string;
    button: Button | null;
  };
};

// Footer & contact form -------------------------------------------------------------

/**
 * One contact form input, in the shape `ContactForm.astro` renders
 * (`inputFieldSchema` in `src/sections.schema.ts`).
 */
export type ContactFormInput = {
  label?: string;
  placeholder?: string;
  required?: boolean;
  halfWidth?: boolean;
  defaultValue?: string;
  name?: string;
  value?: string;
  checked?: boolean;
  type?: "text" | "email" | "radio" | "checkbox";
  id?: string;
  tag?: "textarea";
  rows?: string;
  group?: string;
  groupLabel?: string;
  dropdown?: {
    type?: "select" | "search";
    search?: { placeholder?: string };
    items: { label: string; value: string; selected?: boolean }[];
  };
  content?: string;
  note?: "info" | "warning" | "success" | "deprecated" | "hint";
  parentClass?: string;
};

export type ContactFormData = {
  emailSubject?: string;
  note?: string;
  submitButton: { enable: boolean; label: string };
  inputs: ContactFormInput[];
};

export type FooterData = {
  _id?: string;
  _type?: string;
  title: string;
  description: string;
  /** May contain `{{ year }}` and markdown links */
  copyright: string;
  form: ContactFormData;
};

// Services & projects ------------------------------------------------------------------

export type ServiceItem = {
  _id: string;
  _type: "service";
  title: string;
  description?: string;
  order?: number;
  language: string;
};

export type ProjectCard = {
  _id: string;
  _type: "project";
  title: string;
  slug: string;
  language: string;
  date?: string;
  order?: number;
  categories: string[];
  description?: string;
  coverImage: SanityImageValue | null;
};

export type ProjectDetail = {
  _key?: string;
  label: string;
  /** Final text to show (categories and date are already filled in) */
  value: string;
};

export type ProjectLink = { title: string; slug: string };

export type Project = ProjectCard & {
  gallery: SanityImageValue[];
  details: ProjectDetail[];
  body: PortableTextValue;
  seo: Seo;
  prev: ProjectLink | null;
  next: ProjectLink | null;
};

// Page sections --------------------------------------------------------------------------

type SectionBase = { _key: string };

export type BannerSectionData = SectionBase & {
  _type: "bannerSection";
  /** Raw title; line breaks are kept */
  title: string;
  /** The title split on line breaks (one entry per line) */
  titleLines: string[];
  titleSize: "display-1" | "display-2" | "display-3";
  description: string;
  image: SanityImageValue | null;
  button: Button | null;
};

export type ClientsSectionData = SectionBase & {
  _type: "clientsSection";
  title: string;
  logos: SanityImageValue[];
  appearance: "light" | "dark";
  columnsPerRow: 4 | 6;
};

export type ServicesSectionData = SectionBase & {
  _type: "servicesSection";
  title: string;
  sectionDirection: "vertical" | "horizontal";
  /** Services to show, `limit` already applied */
  services: ServiceItem[];
};

export type PortfolioSectionData = SectionBase & {
  _type: "portfolioSection";
  title: string;
  layout: "grid" | "masonry";
  appearance: "light" | "dark";
  /** Projects to show, `limit` already applied */
  projects: ProjectCard[];
  button: Button | null;
};

/** Same shape as `pricingSectionSchema.list[number]` used by `PricingCard` */
export type PricingPlan = {
  _key?: string;
  enable: boolean;
  name: string;
  description: string;
  price: { prependValue: string; value: string; appendValue: string };
  features: string[];
  button: Button & { enable: boolean };
};

export type PricingSectionData = SectionBase & {
  _type: "pricingSection";
  title: string;
  plans: PricingPlan[];
};

export type ContentSectionData = SectionBase & {
  _type: "contentSection";
  title: string;
  body: PortableTextValue;
};

export type SectionData =
  | BannerSectionData
  | ClientsSectionData
  | ServicesSectionData
  | PortfolioSectionData
  | PricingSectionData
  | ContentSectionData;

// Pages ---------------------------------------------------------------------------------

export type HomePageData = {
  _id: string;
  _type: "homePage";
  title: string;
  language: string;
  seo: Seo;
  sections: SectionData[];
};

export type PageData = {
  _id: string;
  _type: "page";
  title: string;
  slug: string;
  language: string;
  image: SanityImageValue | null;
  body: PortableTextValue;
  seo: Seo;
  sections: SectionData[];
};

export type LocalizedSlug = { lang: string; slug: string };
