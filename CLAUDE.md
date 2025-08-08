# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

| Command | Action |
|---------|--------|
| `pnpm dev` | Start development server at localhost:4321 |
| `pnpm build` | Run type checks and build for production |
| `pnpm check` | Run Astro type checking |
| `pnpm lint` | Lint code with Biome |
| `pnpm format` | Format code with Biome |
| `pnpm pretty` | Format src files with Prettier |
| `pnpm preview` | Build and preview locally |

### Utility Scripts
- `pnpm run generate-favicons` - Generate favicon files from `src/config/config.toml` favicon settings
- `pnpm run remove-multilingual` - Remove multilingual content files when disabling i18n
- `pnpm run remove-draft-from-sitemap` - Remove draft content from sitemap (runs automatically in build)

## Architecture Overview

### Technology Stack
- **Framework**: Astro 5 with React integration
- **Styling**: Tailwind CSS 4
- **Content**: Markdown/MDX with Astro Content Collections
- **Internationalization**: Custom i18n system with TOML configuration
- **Package Manager**: pnpm (required - see engines in package.json)

### Configuration System
The project uses a centralized TOML configuration system:
- **Main config**: `src/config/config.toml` - Site settings, SEO, multilingual options
- **Languages**: `src/config/language.json` - Available languages and content directories
- **Menus**: `src/config/menu.{lang}.json` - Navigation menus per language
- **Social**: `src/config/social.json` - Social media links
- **Fonts**: `src/config/fonts.json` - Font configurations

Configuration is parsed by `src/lib/utils/tomlUtils.ts` with hot reloading support.

### Content Architecture
Content is organized by language using Content Collections:
- `src/content/homepage/{language}/` - Homepage content
- `src/content/pages/{language}/` - Static pages
- `src/content/portfolio/{language}/` - Portfolio items
- `src/content/services/{language}/` - Services content  
- `src/content/sections/{language}/` - Reusable sections

Content schemas are defined in `src/content.config.ts` with dynamic folder mapping based on TOML config.

### Internationalization System
- Language routing via `[...lang]` dynamic routes
- Content directories mapped to language codes in `language.json`
- Translation files in `src/i18n/{lang}.json`
- URL generation handled by `getLocaleUrlCTM()` in `src/lib/utils/i18nUtils.ts`
- Default language can be hidden from URLs via config

### Key Utilities
- `src/lib/utils/tomlUtils.ts` - TOML configuration parsing and hot reloading
- `src/lib/utils/i18nUtils.ts` - Language utilities and URL generation
- `src/lib/utils/textConverter.ts` - Text processing utilities
- `src/lib/utils/trailingSlashChecker.ts` - URL trailing slash handling

### Component Structure
- **Layouts**: `src/layouts/` - Base layouts and page components
- **Global Components**: `src/layouts/components/global/` - Header, footer, navigation
- **Sections**: `src/layouts/components/sections/` - Homepage sections
- **Cards**: `src/layouts/components/cards/` - Reusable card components
- **Widgets**: `src/layouts/components/widgets/` - Utility widgets and forms

### Styling System
- **Tailwind CSS 4**: Main styling framework
- **Custom CSS**: Organized in `src/styles/` by purpose (base, components, navigation, etc.)
- **Preline UI**: Third-party component library integration
- **Font Loading**: Optimized web font loading via astro-font

### Build Configuration
- **Astro Config**: `astro.config.mjs` - Main build configuration with i18n routing
- **TypeScript**: `tsconfig.json` - Path mapping with `@/` alias to `src/`
- **Biome**: `biome.json` - Linting and formatting rules (excludes `src/lib/**` and `src/plugins/**`)

### Deployment Configuration
- **Vercel**: `vercel.json` and `vercel.sh` for Vercel deployment
- **Netlify**: `netlify.toml` for Netlify deployment
- **Cloudflare**: `wrangler.toml` for Cloudflare Pages deployment

## Important Notes

### Content Management
- Draft content is excluded from production builds and sitemaps
- Portfolio images support multiple layout options: masonry, grid, full-width, slider
- All content supports frontmatter schema validation via Zod

### Multilingual Considerations
- When adding new languages, update `src/config/language.json` and create corresponding content directories
- Menu files must exist for each enabled language: `src/config/menu.{lang}.json`
- Translation files must exist for each enabled language: `src/i18n/{lang}.json`
- Server restart required when changing multilingual settings in TOML config

### Performance Features
- Sharp image optimization with specific version pinning
- Font preloading and optimization
- Automatic external link handling with security attributes
- Sitemap generation with draft exclusion