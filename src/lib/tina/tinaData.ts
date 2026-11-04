import { requestWithMetadata } from "@tinacms/astro/data";
import client from "../../../tina/__generated__/client";
import languages from "@/config/language.json";
import {
  PAGE_SECTIONS,
  type PageSectionKey,
  type SectionFileKey,
} from "@/lib/pageSections";
import {
  SECTION_COLLECTIONS,
  portfolioCollectionName,
  servicesCollectionName,
} from "./names";
import { cleanDocument, sortEntries, toEntry } from "./normalize";
import type { FooterData, SectionsBundle } from "./types";

// Tina data loaders for the live visual editing route only (server side).
// `requestWithMetadata()` registers each document as an editable form and
// returns the editor's unsaved values while someone is typing.
//
// The generated client carries the read-only TINA_TOKEN, so it must never be
// imported from code that runs in the browser.

type Query = (variables: Record<string, unknown>) => Promise<any>;
const queries = client.queries as unknown as Record<string, Query>;

export const contentDirFor = (languageCode: string) =>
  languages.find((lang) => lang.languageCode === languageCode)?.contentDir ??
  languages[0].contentDir;

export async function tinaDocument(
  collection: string,
  relativePath: string,
  primary = false,
) {
  const result = await requestWithMetadata<Record<string, any>>(
    queries[collection]({ relativePath }),
    primary ? { priority: "primary" } : undefined,
  );
  return result.data?.[collection] as Record<string, any> | undefined;
}

async function tinaList(collection: string) {
  const name = `${collection}Connection`;
  const result = await requestWithMetadata<Record<string, any>>(
    queries[name]({ first: 500 }),
  );
  const edges: { node: Record<string, any> }[] = result.data?.[name]?.edges ?? [];
  return edges.map((edge) => edge.node);
}

export async function loadSectionsFromTina(
  sections: PageSectionKey[],
  languageCode: string,
): Promise<SectionsBundle> {
  const contentDir = contentDirFor(languageCode);
  const bundle: SectionsBundle = { data: {}, services: [], projects: [] };

  const keys = [...new Set(sections)].filter(
    (key): key is SectionFileKey => key !== "content",
  );

  for (const key of keys) {
    const doc = await tinaDocument(
      SECTION_COLLECTIONS[key],
      `${contentDir}/${PAGE_SECTIONS[key].file}.md`,
    );
    bundle.data[key] = doc ? cleanDocument(doc) : undefined;
  }

  if (keys.includes("services")) {
    const nodes = await tinaList(servicesCollectionName(languageCode));
    bundle.services = sortEntries(
      nodes.flatMap((node) => toEntry(node, "services", contentDir) ?? []),
    );
  }
  if (keys.includes("portfolio")) {
    const nodes = await tinaList(portfolioCollectionName(languageCode));
    bundle.projects = sortEntries(
      nodes.flatMap((node) => toEntry(node, "portfolio", contentDir) ?? []),
    );
  }

  return bundle;
}

export async function loadFooterFromTina(
  languageCode: string,
): Promise<FooterData> {
  const contentDir = contentDirFor(languageCode);
  const [settings, cta, contact, social, dictionary] = [
    await tinaDocument("siteSettings", "config.toml"),
    await tinaDocument("callToAction", `${contentDir}/call-to-action.md`),
    await tinaDocument("contactSection", `${contentDir}/contact-section.md`),
    await tinaDocument("social", "social.json"),
    await tinaDocument("translations", `${languageCode}.json`),
  ].map((doc) => (doc ? cleanDocument(doc) : undefined));

  return {
    settings: settings?.settings,
    cta,
    form: contact?.form,
    social: social?.main,
    dictionary,
  };
}
