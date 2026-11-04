# SKILLS.md

Task playbooks for working on the **Sanity CMS edition** of this Astro + Tailwind CSS theme with an AI assistant.

`AGENTS.md` holds the **rules** (architecture, conventions, styling, verification). This file
holds the **recipes** — step-by-step "skills" for the jobs people do most often. Read
`AGENTS.md` first, then follow the relevant skill below. Always finish with the
[Verify](#skill-verify-changes) skill.

Key locations (see `AGENTS.md` for the full map):

- Studio schemas: `sanity/schemaTypes/` (`documents/`, `singletons/`, `sections/`, `objects/`) + `index.ts`
- Studio sidebar and live preview: `sanity/studioStructure.ts`, `sanity/presentation/resolve.ts`
- Data layer: `src/lib/sanity/` (`queries.ts`, `data.ts`, `types.ts`, `fetch.ts`)
- Sections: `src/layouts/components/sections/*.astro`, mapped in `PageSections.astro`
- Pages: `src/pages/[...lang]/`
- Demo seed: `scripts/sanity/build-seed.mjs` → `sanity/seed/demo-content.json`
- Config: `src/config/` (`config.toml`, `language.json`, `fonts.json`)
- Styles/tokens: `src/styles/` (`base.css`, `components.css`, `safe.css`, `theme.css`)
- Languages: `en` (default), `fr`, from `src/config/language.json`

Content (texts, images, menus, footer, pages, projects, services) is edited in Sanity Studio,
not in files. Code changes are only needed for new fields, sections, document types, or design.

---

## Skill: Add a new section

1. Create the schema `sanity/schemaTypes/sections/<name>Section.ts`. Copy an existing section
   (e.g. `bannerSection.ts`): use `sectionGroups`, `hiddenSectionField()`, `imageField()`, and the
   `link` type for buttons. Write beginner-friendly titles and descriptions.
2. Register it in `sanity/schemaTypes/index.ts` and in `sanity/schemaTypes/objects/pageSections.ts`
   (the `of` array and an `insertMenu` group).
3. Add a projection branch to `sectionsFields` in `src/lib/sanity/queries.ts`.
4. Add a `<Name>SectionData` type to the `SectionData` union in `src/lib/sanity/types.ts`; map/clean
   values in `src/lib/sanity/data.ts` (`toButton()`, `stegaClean` for non-text values).
5. Create `src/layouts/components/sections/<Name>Section.astro` with `content` and `dataSanity` props.
   Use `CustomButton.astro`, `Icons.astro`, and `SanityImage.astro` instead of rebuilding primitives.
6. Map `_type` → component in `src/layouts/components/sections/PageSections.astro`.
7. Add demo data in `scripts/sanity/build-seed.mjs` and regenerate the seed:
   `node scripts/sanity/build-seed.mjs`. Demo mode runs the real queries against this file.

## Skill: Add a field to an existing section or document

1. Add the field to the schema in `sanity/schemaTypes/` (reuse existing types and field names).
2. Add it to the matching projection in `src/lib/sanity/queries.ts` and to the type in `types.ts`.
3. Use it in the component. Keep the old behavior when the field is empty (existing projects won't have it).
4. Add a value in `build-seed.mjs` if the demo should show it, and regenerate the seed.

## Skill: Add a new page (editor task, no code)

1. In Studio: **Pages → Pages (En)** → create, title, generate slug, add text/sections, publish.
2. Add it to **Navigation menu** for each language.
3. Only add code if the page needs a layout no section can provide; then add a new section instead
   of a hardcoded route.

## Skill: Add a new document type

1. Schema in `sanity/schemaTypes/documents/`, registered in `index.ts`; add `languageField()` if it is per language.
2. Studio sidebar entry in `sanity/studioStructure.ts` (and language templates in `sanity/lib/singletons.ts`).
3. Query + getter in `queries.ts` / `data.ts`, type in `types.ts`.
4. Route under `src/pages/[...lang]/` that resolves data from `Astro.params` in the page body.
5. Live preview mapping in `sanity/presentation/resolve.ts`.
6. Seed data in `build-seed.mjs`.

## Skill: Reorder or change the homepage

- Editor task: Studio → **Home page (En/Fr)** → **Page sections**. Drag to reorder, "Hide this section"
  to hide, **Add item** to add. No code change needed.

## Skill: Add or remove a language

- Turn a language off: `disableLanguages = ["fr"]` (or `enable = false`) under
  `[settings.multilingual]` in `src/config/config.toml`.
- Add a language: add an entry to `src/config/language.json` with `languageName`, `languageCode`,
  `contentDir` (the label in the language switcher), and `weight` (the Studio and site both read it),
  optionally add `src/i18n/<code>.json` for the UI labels, restart, then create that language's
  Home page, Navigation menu, and Footer in the Studio.

## Skill: Rebrand colors / typography

1. Edit tokens in `src/styles/theme.css` (palette, spacing, radii, typography) — a rebrand is
   a few variables, not a find-and-replace.
2. Adjust fonts via `src/config/fonts.json`.
3. Do **not** add Tailwind arbitrary values; use the nearest existing theme token.
4. Logos, site name, and texts are content: change them in Studio → **Site settings**.

## Skill: Add an icon

- Import the Lucide icon in `src/layouts/helpers/Icons.astro` and add it to the icon map (`iconMap`).

## Skill: Configure forms / menu / social / SEO

- Contact form provider and endpoint, contact info, social links, default SEO, sticky header,
  copyright toggle: Studio → **Site settings**.
- Menu, header button, side panel: Studio → **Navigation menu** (per language).
- Footer texts and contact form fields: Studio → **Footer & contact form** (per language).
- Technical settings (domain, sitemap, robots.txt, multilingual switches, head scripts):
  `src/config/config.toml`.

## Skill: Verify changes

- After code or schema changes: `npm run astro-check`
- After Studio schema changes: `SANITY_STUDIO_PROJECT_ID=<any-id> npx sanity schema validate`
- After broad changes (routing, data layer, seed, assets): `npm run build`
- After preview/visual-editing changes: `npm run build:preview`
- Format before committing: `npm run format`
- Never commit generated output such as `dist/`, `studio-dist/`, or `.sanity/`, and never commit `.env`.
