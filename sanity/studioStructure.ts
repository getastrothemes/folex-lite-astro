/**
 * The Studio sidebar ("desk"), organised for non-technical editors:
 *
 *   Site settings
 *   ─────────────
 *   Home page              → one per language
 *   Pages                  → per-language lists
 *   Portfolio projects     → per-language lists
 *   Services               → per-language lists
 *   ─────────────
 *   Navigation menu        → one per language
 *   Footer & contact form  → one per language
 *
 * Singletons open directly as a document with a fixed id, so editors can
 * never create a second copy by accident.
 */
import { CaseIcon } from "@sanity/icons/Case";
import { CogIcon } from "@sanity/icons/Cog";
import { DocumentsIcon } from "@sanity/icons/Documents";
import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { HomeIcon } from "@sanity/icons/Home";
import { MenuIcon } from "@sanity/icons/Menu";
import { WrenchIcon } from "@sanity/icons/Wrench";
import type { ComponentType } from "react";
import type { SortOrderingItem } from "sanity";
import type { StructureBuilder, StructureResolver } from "sanity/structure";
import { apiVersion } from "./env";
import { languages } from "./lib/languages";
import {
  SITE_SETTINGS_ID,
  languageTemplateId,
  singletonId,
} from "./lib/singletons";

interface ItemOptions {
  type: string;
  title: string;
  icon: ComponentType;
}

/**
 * A per-language singleton such as "Home page". With one language it opens the
 * document directly; with several it shows one entry per language.
 */
function languageSingleton(
  S: StructureBuilder,
  { type, title, icon }: ItemOptions,
) {
  const documentFor = (code: string, languageName: string) =>
    S.document()
      .schemaType(type)
      .documentId(singletonId(type, code))
      .initialValueTemplate(languageTemplateId(type, code))
      .title(languages.length > 1 ? `${title} (${languageName})` : title);

  if (languages.length === 1) {
    return S.listItem()
      .id(type)
      .title(title)
      .icon(icon)
      .child(documentFor(languages[0].id, languages[0].title));
  }

  return S.listItem()
    .id(type)
    .title(title)
    .icon(icon)
    .child(
      S.list()
        .id(`${type}-languages`)
        .title(title)
        .items(
          languages.map((language) =>
            S.listItem()
              .id(singletonId(type, language.id))
              .title(`${title} (${language.title})`)
              .icon(icon)
              .child(documentFor(language.id, language.title)),
          ),
        ),
    );
}

/**
 * A regular document type (pages, projects, services) split into one list per
 * language. Each list only shows that language, and its "Create" button
 * presets the language automatically.
 */
function languageDocumentList(
  S: StructureBuilder,
  {
    type,
    title,
    icon,
    ordering,
  }: ItemOptions & { ordering: SortOrderingItem[] },
) {
  const listFor = (id: string, listTitle: string, codes: string[]) =>
    S.documentList()
      .id(id)
      .title(listTitle)
      .schemaType(type)
      .apiVersion(apiVersion)
      .filter("_type == $type && language in $languages")
      .params({ type, languages: codes })
      .defaultOrdering(ordering)
      .initialValueTemplates(
        codes.map((code) =>
          S.initialValueTemplateItem(languageTemplateId(type, code)),
        ),
      );

  const allCodes = languages.map((language) => language.id);

  if (languages.length === 1) {
    return S.listItem()
      .id(type)
      .title(title)
      .icon(icon)
      .child(listFor(`${type}-all`, title, allCodes));
  }

  return S.listItem()
    .id(type)
    .title(title)
    .icon(icon)
    .child(
      S.list()
        .id(`${type}-languages`)
        .title(title)
        .items([
          ...languages.map((language) =>
            S.listItem()
              .id(`${type}-${language.id}`)
              .title(`${title} (${language.title})`)
              .icon(icon)
              .child(
                listFor(
                  `${type}-${language.id}-list`,
                  `${title} (${language.title})`,
                  [language.id],
                ),
              ),
          ),
          S.divider(),
          S.listItem()
            .id(`${type}-all`)
            .title(`All ${title.toLowerCase()}`)
            .icon(icon)
            .child(
              // Shows every document of this type, including any that are missing a language.
              S.documentList()
                .id(`${type}-all-list`)
                .title(`All ${title.toLowerCase()}`)
                .schemaType(type)
                .apiVersion(apiVersion)
                .filter("_type == $type")
                .params({ type })
                .defaultOrdering(ordering)
                .initialValueTemplates(
                  allCodes.map((code) =>
                    S.initialValueTemplateItem(languageTemplateId(type, code)),
                  ),
                ),
            ),
        ]),
    );
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Website content")
    .items([
      S.listItem()
        .id(SITE_SETTINGS_ID)
        .title("Site settings")
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId(SITE_SETTINGS_ID)
            .title("Site settings"),
        ),
      S.divider(),
      languageSingleton(S, {
        type: "homePage",
        title: "Home page",
        icon: HomeIcon,
      }),
      languageDocumentList(S, {
        type: "page",
        title: "Pages",
        icon: DocumentsIcon,
        ordering: [{ field: "title", direction: "asc" }],
      }),
      languageDocumentList(S, {
        type: "project",
        title: "Portfolio projects",
        icon: CaseIcon,
        ordering: [
          { field: "order", direction: "asc" },
          { field: "date", direction: "desc" },
        ],
      }),
      languageDocumentList(S, {
        type: "service",
        title: "Services",
        icon: WrenchIcon,
        ordering: [
          { field: "order", direction: "asc" },
          { field: "title", direction: "asc" },
        ],
      }),
      S.divider(),
      languageSingleton(S, {
        type: "navigation",
        title: "Navigation menu",
        icon: MenuIcon,
      }),
      languageSingleton(S, {
        type: "footer",
        title: "Footer & contact form",
        icon: EnvelopeIcon,
      }),
    ]);
