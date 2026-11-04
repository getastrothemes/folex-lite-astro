import mdx from "@astrojs/mdx";
import { unified } from "@astrojs/markdown-remark";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { tinaAdminDevRedirect } from "@tinacms/astro/vite";
import tinaVisualEditing from "./src/lib/tina/integration.ts";
import tinaDevMedia from "./src/lib/tina/devMedia.ts";
import { loadAdapter, productionVisualEditing } from "./scripts/tina/hosting.mjs";
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

// Tina CMS: an adapter is only needed for live visual editing on the deployed
// site (see scripts/tina/hosting.mjs). Pages are always prerendered.
const adapter = productionVisualEditing() ? await loadAdapter() : undefined;

// https://astro.build/config
export default defineConfig({
  site: config.site.baseUrl ? config.site.baseUrl : "http://examplesite.com",
  trailingSlash: config.site.trailingSlash ? "always" : "never",
  output: "static",
  adapter,
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
    // Tina CMS visual editing (adds @tinacms/astro when available)
    tinaVisualEditing(),
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
  vite: {
    plugins: [tailwindcss(), tinaAdminDevRedirect(), tinaDevMedia()],
    ssr: {
      noExternal: ["@tinacms/astro", "@tinacms/bridge"],
    },
  },
});
