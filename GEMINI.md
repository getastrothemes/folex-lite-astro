# GEMINI.md

Follow `AGENTS.md` for the full project instructions.

This is an Astro and Tailwind CSS theme. When generating or editing code:

- Reuse existing components, widgets, cards, schemas, styles, and content patterns.
- Keep editable copy, links, images, buttons, and section options in `src/content/`.
- Add or update schemas in `src/sections.schema.ts` when adding content fields.
- For new sections, create both a section component and a matching content file.
- Use page frontmatter named blocks for page-specific section overrides.
- Use `CustomButton.astro`, `Icons.astro`, and `OptimizedImage.astro` instead of rebuilding shared primitives.
- Use nearest Tailwind theme values from `src/styles/theme.css`.
- Avoid Tailwind arbitrary values.
- Do not add heading classes already covered by `base.css`, including default font weight, tracking, leading, or wrapping classes.
- Prefer static rendering and add client JavaScript only when interaction requires it.
- Keep copy generic for a shippable theme and avoid hardcoded brand names in reusable content.

Before finishing code or schema changes, run `npm run astro-check`. Run `npm run build` for broad routing, content, or asset changes.
