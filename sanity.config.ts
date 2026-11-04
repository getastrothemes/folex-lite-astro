/**
 * Sanity Studio configuration.
 *
 * Run the Studio with `npm run studio` (http://localhost:3333).
 * Project ID and dataset come from the root `.env` file (see `.env.example`).
 */
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { apiVersion, assertProjectId, dataset, previewUrl } from "./sanity/env";
import {
  SINGLETON_HIDDEN_ACTIONS,
  SINGLETON_TYPES,
  hiddenTemplateIds,
  languageTemplates,
} from "./sanity/lib/singletons";
import { resolve } from "./sanity/presentation/resolve";
import { schemaTypes } from "./sanity/schemaTypes";
// Named `studioStructure.ts` (not `structure.ts`) because the tsconfig `baseUrl`
// would otherwise make `sanity/structure` resolve to that local file.
import { structure } from "./sanity/studioStructure";

export default defineConfig({
  name: "default",
  title: "Folex Website",

  projectId: assertProjectId(),
  dataset,

  plugins: [
    structureTool({ title: "Content", structure }),
    presentationTool({
      title: "Live preview",
      resolve,
      previewUrl: {
        initial: previewUrl,
        previewMode: {
          enable: "/api/draft-mode/enable",
          disable: "/api/draft-mode/disable",
        },
      },
    }),
    // The GROQ query playground is only useful while developing.
    ...(process.env.NODE_ENV === "development"
      ? [visionTool({ defaultApiVersion: apiVersion })]
      : []),
  ],

  schema: {
    types: schemaTypes,
    // Add templates that preset the language ("Page (French)", "Home page (English)"…).
    templates: (previous) => [...previous, ...languageTemplates],
  },

  document: {
    // Singletons can't be deleted, duplicated or unpublished.
    actions: (previous, { schemaType }) =>
      SINGLETON_TYPES.has(schemaType)
        ? previous.filter(
            ({ action }) => !action || !SINGLETON_HIDDEN_ACTIONS.has(action),
          )
        : previous,

    // Hide singletons and language-less templates from every "Create" menu.
    newDocumentOptions: (previous) =>
      previous.filter(({ templateId }) => !hiddenTemplateIds.has(templateId)),
  },
});
