# GitHub Copilot Instructions

Follow `AGENTS.md` for the full project instructions.

This is an Astro and Tailwind CSS theme. Generate code that matches the existing theme architecture:

- Reuse existing components, widgets, cards, schemas, styles, and content patterns.
- Keep editable section content in `src/content/sections/{language}/`.
- Add or update schemas in `src/sections.schema.ts` when adding content fields.
- For new sections, create both a `.astro` section component and a matching `.md` or `.mdx` content file.
- Use page frontmatter named blocks for page-specific overrides.
- Use `CustomButton.astro`, `Icons.astro`, and `OptimizedImage.astro` for shared UI primitives.
- Use nearest Tailwind theme values from `src/styles/theme.css`.
- Avoid Tailwind arbitrary values.
- Do not add heading classes already covered by `base.css`, including default font weight, tracking, leading, or wrapping classes.
- Prefer static rendering and avoid unnecessary client JavaScript.
- Keep reusable content generic for a shippable theme.

Run `npm run astro-check` after code or schema changes. Run `npm run build` for broad content, route, or asset changes.
