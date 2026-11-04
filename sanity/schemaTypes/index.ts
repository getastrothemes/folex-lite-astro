/**
 * Every schema type used by the Studio. Order does not matter for Sanity,
 * but grouping keeps it easy to find things.
 */
import type { SchemaTypeDefinition } from "sanity";

// Documents
import { page } from "./documents/page";
import { project } from "./documents/project";
import { service } from "./documents/service";

// Singletons (one per site / one per language)
import { footer } from "./singletons/footer";
import { homePage } from "./singletons/homePage";
import { navigation } from "./singletons/navigation";
import { siteSettings } from "./singletons/siteSettings";

// Page sections
import { bannerSection } from "./sections/bannerSection";
import { clientsSection } from "./sections/clientsSection";
import { contentSection } from "./sections/contentSection";
import { portfolioSection } from "./sections/portfolioSection";
import { pricingSection } from "./sections/pricingSection";
import { servicesSection } from "./sections/servicesSection";

// Shared objects
import { defaultSeo } from "./objects/defaultSeo";
import { formField } from "./objects/formField";
import { formOption } from "./objects/formOption";
import { link } from "./objects/link";
import { menuBadge } from "./objects/menuBadge";
import { menuChild } from "./objects/menuChild";
import { menuGrandchild } from "./objects/menuGrandchild";
import { menuItem } from "./objects/menuItem";
import { pageSections } from "./objects/pageSections";
import { portableText } from "./objects/portableText";
import { pricingPlan } from "./objects/pricingPlan";
import { projectDetail } from "./objects/projectDetail";
import { seo } from "./objects/seo";
import { socialLink } from "./objects/socialLink";

export const schemaTypes: SchemaTypeDefinition[] = [
  // Documents
  siteSettings,
  homePage,
  page,
  project,
  service,
  navigation,
  footer,
  // Sections
  bannerSection,
  clientsSection,
  servicesSection,
  portfolioSection,
  pricingSection,
  contentSection,
  // Objects
  pageSections,
  portableText,
  link,
  seo,
  defaultSeo,
  menuBadge,
  menuItem,
  menuChild,
  menuGrandchild,
  socialLink,
  formField,
  formOption,
  pricingPlan,
  projectDetail,
];
