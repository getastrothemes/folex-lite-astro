# SKILLS.md

Task playbooks for working on this Astro + Tailwind CSS theme with an AI assistant.

`AGENTS.md` holds the **rules** (structure, conventions, styling, verification). This file
holds the **recipes** — step-by-step "skills" for the jobs people do most often. Read
`AGENTS.md` first, then follow the relevant skill below. Always finish with the
[Verify](#skill-verify-changes) skill.

Key locations (see `AGENTS.md` for the full map):

- Sections: `src/layouts/components/sections/*.astro` + `src/content/sections/{language}/*.md`
- Section schemas: `src/sections.schema.ts`
- Pages: `src/pages/[...lang]/`
- Content collections: `src/content/` (portfolio, services, …)
- Config: `src/config/` (`config.toml`, `menu.{lang}.json`, `social.json`, `fonts.json`, `language.json`)
- Styles/tokens: `src/styles/` (`base.css`, `components.css`, `safe.css`, `theme.css`)
- Languages: `english`, `french`

---

## Skill: Add a new section

1. Create the component in `src/layouts/components/sections/<Name>Section.astro`. Reuse
   existing sections as a template; use `CustomButton.astro`, `Icons.astro`, and `OptimizedImage.astro` instead of rebuilding primitives.
2. Create a matching content file `src/content/sections/{language}/<name>-section.md` for
   **each** language (`english` and `french`). Keep editable copy, lists, links, and options here.
3. Add/extend the section's schema in `src/sections.schema.ts` and register it on the
   section options map. Reuse existing field names (e.g. `sharedButton`).
4. Render it on a page (e.g. `src/pages/[...lang]/index.astro`); pass page-specific overrides
   via a named frontmatter block.
5. List the supported nested options as comments in the `.md` so users and AI tools can discover them.

## Skill: Add a new page

1. Add the route under `src/pages/[...lang]/<page>.astro` (keep it language-aware).
2. Compose it from existing section components; put copy in content, not the component.
3. Add the page to the nav in `src/config/menu.en.json` and `src/config/menu.fr.json`.

## Skill: Add a homepage section / reorder the homepage

1. Edit `src/pages/[...lang]/index.astro` — add the `<XSection />` import and place it in the
   desired order. The visual top-to-bottom order is the JSX order here.
2. Edit the section's content under `src/content/sections/{language}/` to change its copy or list items.

## Skill: Edit a content collection (portfolio, services, …)

1. Add or edit the markdown/MDX entry in the matching `src/content/<collection>/` folder.
2. Match the existing frontmatter shape; the collection schema lives in `src/content.config.ts` (or `src/sections.schema.ts` for section option shapes).
3. Provide the entry for every language folder you ship.

## Skill: Add or remove a language

- Ship a single language: `npm run remove-multilingual`
- Update `src/config/language.json` and the per-language `menu.<lang>.json` accordingly.

## Skill: Rebrand colors / typography

1. Edit tokens in `src/styles/theme.css` (palette, spacing, radii, typography) — a rebrand is
   a few variables, not a find-and-replace.
2. Adjust fonts via `src/config/fonts.json`.
3. Do **not** add Tailwind arbitrary values; use the nearest existing theme token.

## Skill: Add an icon

- Import the Lucide icon in `src/layouts/helpers/Icons.astro` and add it to the icon map (`iconMap`).

## Skill: Configure forms / menu / social / SEO

- Contact form provider, sticky header, smooth scroll, animation, SEO defaults: `src/config/config.toml`.
- Navigation: `src/config/menu.en.json` / `menu.fr.json`. Social links: `src/config/social.json`.

## Skill: Verify changes

- After code or schema changes: `npm run astro-check`
- After broad changes (routing, content collections, assets): `npm run build`
- Format before committing: `npm run format`
- Never commit generated output such as `dist/`.
