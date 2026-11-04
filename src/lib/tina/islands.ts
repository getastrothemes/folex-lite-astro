import type { IslandConfig, IslandRegistry } from "@tinacms/astro/experimental";
import config from ".astro/config.generated.json";
import PageSections from "@/components/PageSections.astro";
import PortfolioSingle from "@/components/PortfolioSingle.astro";
import FooterThree from "@/components/global/FooterThree.astro";
import {
  DEFAULT_HOME_SECTIONS,
  DEFAULT_PAGE_SECTIONS,
  resolveSections,
} from "@/lib/pageSections";
import { pagesCollectionName, portfolioCollectionName } from "./names";
import { toEntry } from "./normalize";
import { REGIONS, type RegionName } from "./regions";
import {
  contentDirFor,
  loadFooterFromTina,
  loadSectionsFromTina,
  safeFileName,
  tinaDocument,
} from "./tinaData";

// Island registry for the live visual editing route. Each entry loads a
// region's content from Tina (including unsaved edits) and renders the same
// component the built page uses.

const languageOf = (params: URLSearchParams) =>
  params.get("lang") || config.settings.multilingual.defaultLanguage;

// Drafts are never rendered by the public route of a deployed site.
const assertPublished = (node: Record<string, any> | undefined) => {
  if (import.meta.env.PROD && node?.draft) {
    throw new Error("Drafts are not previewed on the deployed site.");
  }
  return node;
};

// The island route answers every failure with a bare 500, so log the cause.
const logged =
  (name: RegionName, fetch: IslandConfig["fetch"]): IslandConfig["fetch"] =>
  async (request, params) => {
    try {
      return await fetch(request, params);
    } catch (error) {
      console.error(`[tina] Could not load the "${name}" preview region:`, error);
      throw error;
    }
  };

const island = (
  name: RegionName,
  options: Omit<IslandConfig, "wrapper" | "fetch"> & {
    fetch: IslandConfig["fetch"];
  },
): IslandConfig => ({
  ...options,
  fetch: logged(name, options.fetch),
  wrapper: { ...REGIONS[name] },
});

export const islands: IslandRegistry = {
  home: island("home", {
    component: PageSections,
    fetch: async (_request, params) => {
      const lang = languageOf(params);
      const page = await tinaDocument(
        "homepage",
        `${contentDirFor(lang)}/-index.md`,
        true,
      );
      const sections = resolveSections(page?.sections, DEFAULT_HOME_SECTIONS);
      return { lang, sections, bundle: await loadSectionsFromTina(sections, lang) };
    },
    propsFromData: (data) => data as Record<string, unknown>,
  }),

  page: island("page", {
    component: PageSections,
    fetch: async (_request, params) => {
      const lang = languageOf(params);
      const contentDir = contentDirFor(lang);
      const node = assertPublished(
        await tinaDocument(
          pagesCollectionName(lang),
          safeFileName(params.get("file")),
          true,
        ),
      );
      const page = toEntry(node, "pages", contentDir);
      const sections = resolveSections(
        page?.data.sections,
        DEFAULT_PAGE_SECTIONS,
      );
      return {
        lang,
        page,
        sections,
        bundle: await loadSectionsFromTina(sections, lang),
      };
    },
    propsFromData: (data) => data as Record<string, unknown>,
  }),

  portfolio: island("portfolio", {
    component: PortfolioSingle,
    fetch: async (_request, params) => {
      const lang = languageOf(params);
      const node = assertPublished(
        await tinaDocument(
          portfolioCollectionName(lang),
          safeFileName(params.get("file")),
          true,
        ),
      );
      return {
        lang,
        content: toEntry(
          node,
          config.settings.portfolioFolder,
          contentDirFor(lang),
        ),
      };
    },
    propsFromData: (data) => data as Record<string, unknown>,
  }),

  footer: island("footer", {
    component: FooterThree,
    fetch: async (_request, params) => {
      const lang = languageOf(params);
      return {
        lang,
        footerSpaceTop: params.get("spaceTop") !== "false",
        data: await loadFooterFromTina(lang),
      };
    },
    propsFromData: (data) => data as Record<string, unknown>,
  }),
};
