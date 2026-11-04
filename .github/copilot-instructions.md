# GitHub Copilot Instructions

Follow `AGENTS.md` for the full project instructions.

This is the Sanity CMS edition of an Astro and Tailwind CSS theme. Generate code that matches the existing theme architecture:

- Reuse existing components, widgets, cards, schemas, queries, styles, and patterns.
- Content lives in Sanity and is edited in Sanity Studio. There is no `src/content/` folder; never hardcode editable copy, links, images, buttons, or options in components.
- Studio schemas live in `sanity/schemaTypes/` (registered in `index.ts`); the website data layer lives in `src/lib/sanity/` (GROQ in `queries.ts`, typed getters in `data.ts`, types in `types.ts`).
- A new page section needs: a schema in `sanity/schemaTypes/sections/`, registration in `index.ts` and `objects/pageSections.ts`, a projection in `sectionsFields` (`queries.ts`), a type in `types.ts`, a component in `src/layouts/components/sections/` (props `content`, `dataSanity`), a mapping in `PageSections.astro`, and demo data in `scripts/sanity/build-seed.mjs` (regenerate `sanity/seed/demo-content.json`).
- Without `PUBLIC_SANITY_PROJECT_ID`, the site runs the same GROQ queries against the demo seed, so keep the seed valid for every query.
- `stegaClean` every non-text value (enums, URLs, slugs, languages, form field names, SEO/meta) in `data.ts`; never derive ids or classes from possibly stega-encoded strings.
- Never use `SANITY_API_READ_TOKEN` in client code or commit `.env`.
- Use `CustomButton.astro`, `Icons.astro`, `SanityImage.astro` (Sanity images), and `OptimizedImage.astro` (local images) instead of rebuilding shared primitives.
- Use nearest Tailwind theme values from `src/styles/theme.css`.
- Avoid Tailwind arbitrary values.
- Do not add heading classes already covered by `base.css`, including default font weight, tracking, leading, or wrapping classes.
- Prefer static rendering and add client JavaScript only when interaction requires it.
- Keep copy generic for a shippable theme and avoid hardcoded brand names in reusable content, schema descriptions, and seed data.

Run `npm run astro-check` after code or schema changes. Run `SANITY_STUDIO_PROJECT_ID=<any-id> npx sanity schema validate` after Studio schema changes. Run `npm run build` for broad data layer, seed, route, or asset changes.
