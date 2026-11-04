import mdx from "@astrojs/mdx";
import { unified } from "@astrojs/markdown-remark";
import node from "@astrojs/node";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import rehypeExternalLinks from "rehype-external-links";
import remarkParseContent from "./src/lib/utils/remarkParseContent.ts";
import config from ".astro/config.generated.json";
import fontsJson from "./src/config/fonts.json";
import { generateAstroFontsConfig } from "./src/lib/utils/AstroFont.ts";
import { enabledLanguages } from "./src/lib/utils/i18nUtils.ts";

const fonts = generateAstroFontsConfig(fontsJson);
let {
  seo: { sitemap: sitemapConfig },
  settings: {
    multilingual: { showDefaultLangInUrl, defaultLanguage },
  },
} = config;

// Read `.env` files plus real environment variables (the shell wins)
const env = {
  ...loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), ""),
  ...process.env,
};

// `SANITY_VISUAL_EDITING=true` turns the site into a small Node server that
// can show unpublished (draft) content inside Sanity Studio. Otherwise the
// site is built as plain static files, exactly like the original theme.
// `npm run build` always makes the static site, even when `.env` turns preview
// on for local development. Preview servers are built with `npm run build:preview`.
// `astro preview` serves that static build too (`npm run preview`).
// This is the ONLY place that decides between static and server output; the
// site code reads the result through `__FOLEX_SERVER_OUTPUT__` (see below).
const isBuildOrPreview =
  process.argv.includes("build") || process.argv.includes("preview");
const visualEditing =
  env.SANITY_VISUAL_EDITING === "true" &&
  (!isBuildOrPreview || env.SANITY_PREVIEW_BUILD === "true");
console.log(
  visualEditing
    ? "[sanity] Preview mode: server output with draft mode and visual editing"
    : "[sanity] Static mode: published content only (set SANITY_VISUAL_EDITING=true for preview)",
);

// Registers the draft-mode endpoints, but only for the preview server
const sanityPreviewRoutes = {
  name: "folex-sanity-preview-routes",
  hooks: {
    "astro:config:setup": ({ injectRoute, updateConfig }) => {
      if (!visualEditing) return;
      injectRoute({
        pattern: "/api/draft-mode/enable",
        entrypoint: "./src/sanity-routes/draft-mode-enable.ts",
        prerender: false,
      });
      injectRoute({
        pattern: "/api/draft-mode/disable",
        entrypoint: "./src/sanity-routes/draft-mode-disable.ts",
        prerender: false,
      });
      // The Studio calls these URLs without a trailing slash. The built
      // server redirects them to the slash version, but `astro dev` answers
      // 404, so in dev we add the slash before Astro's own checks run.
      updateConfig({
        vite: {
          // Pre-bundle the visual editing island in dev. Its dependencies
          // import CommonJS lodash files that the browser can't load as-is.
          optimizeDeps: {
            include: ["@sanity/visual-editing/react", "@sanity/mutate"],
          },
          plugins: [
            {
              name: "folex-sanity-preview-routes-dev",
              enforce: "post",
              configureServer: (server) => () => {
                server.middlewares.stack.unshift({
                  route: "",
                  handle: (req, _res, next) => {
                    req.url = req.url?.replace(
                      /^\/api\/draft-mode\/(enable|disable)(?=\?|$)/,
                      "/api/draft-mode/$1/",
                    );
                    next();
                  },
                });
              },
            },
          ],
        },
      });
    },
  },
};

// https://astro.build/config
export default defineConfig({
  output: visualEditing ? "server" : "static",
  adapter: visualEditing ? node({ mode: "standalone" }) : undefined,
  site: config.site.baseUrl ? config.site.baseUrl : "http://examplesite.com",
  trailingSlash: config.site.trailingSlash ? "always" : "never",
  image: {
    layout: "constrained",
  },
  fonts,
  i18n: {
    locales: enabledLanguages,
    defaultLocale: defaultLanguage,
    routing: {
      prefixDefaultLocale: showDefaultLangInUrl,
    },
  },
  integrations: [
    sitemapConfig.enable ? sitemap() : null,
    mdx(),
    // Sanity's <VisualEditing /> island is a React component (preview only)
    visualEditing ? react() : null,
    sanityPreviewRoutes,
  ],
  markdown: {
    // Since @astrojs/mdx v6, remark/rehype plugins are configured on the
    // `unified()` processor instead of top-level `markdown.*` options.
    processor: unified({
      remarkPlugins: [remarkParseContent],
      rehypePlugins: [
        [
          rehypeExternalLinks,
          {
            rel: "noopener noreferrer nofollow",
            target: "_blank",
          },
        ],
      ],
    }),

    // Code Highlighter https://github.com/shikijs/shiki
    shikiConfig: {
      theme: "light-plus", // https://shiki.style/themes
      wrap: false,
    },
  },
  env: {
    schema: {
      // PRIVATE Viewer token for the preview server. Declared as a secret so
      // Astro reads it from the server's environment at runtime and never
      // writes its value into the built files.
      SANITY_API_READ_TOKEN: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
    // Tells the site code whether this is the preview server (see above)
    define: {
      __FOLEX_SERVER_OUTPUT__: JSON.stringify(visualEditing),
    },
    // Static builds swap <VisualEditing /> for an empty component, so the
    // live site loads none of its CSS/JS (see src/sanity-routes/)
    resolve: visualEditing
      ? undefined
      : {
          alias: {
            "@sanity/astro/visual-editing": fileURLToPath(
              new URL(
                "./src/sanity-routes/visual-editing-stub.ts",
                import.meta.url,
              ),
            ),
          },
        },
  },
});
