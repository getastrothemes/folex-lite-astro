# AGENTS.md

This project is an Astro and Tailwind CSS theme. Follow the existing component, content, schema, and styling patterns before adding new code.

## Project Structure

- Section components live in `src/layouts/components/sections/`.
- Shared widgets live in `src/layouts/components/widgets/`.
- Cards live in `src/layouts/components/cards/`.
- Content lives in `src/content/` and is grouped by collection and language.
- Section content files live in `src/content/sections/{language}/`.
- Section schemas and shared content option schemas live in `src/sections.schema.ts`.
- Global styles live in `src/styles/`; check `base.css`, `components.css`, `safe.css`, and `theme.css` before adding classes or values.

## Section Conventions

- For every new section, create two files: one `.astro` component and one `.md` or `.mdx` content file.
- Example: `TestimonialSection.astro` with `testimonial-section.md`.
- For page-specific section names, append `Section` to the component and `-section` to the content file.
- Do not create a section file with the same name as a page file.
- Keep section defaults in the section content file. Put page-specific overrides in the page frontmatter using a named block such as `teamSection`, `ctaSection`, or `contactSection`.
- If a section can appear on multiple pages, make the most common layout the default and expose only needed overrides through content options.

## Content And Schema

- Keep editable copy, labels, links, images, buttons, cards, and section options in content files when they are not purely structural.
- Update `src/sections.schema.ts` when adding new content fields.
- Existing schema-supported fields should be reused instead of inventing parallel names.
- Include available nested options in section `.md` files so users and AI tools can discover supported configuration.
- Button options should follow the `sharedButton` schema.

Example button block:

```yaml
button:
  # Refer to sharedButton in src/sections.schema.ts for all options.
  enable: true
  label: "Start a Project"
  url: "/contact/"
  hoverEffect: "magnetic-text-flip"
  variant: "fill"
  rel: ""
  target: ""
  class: ""
  icon:
    enable: true
    name: "ArrowUpRight"
    position: "right"
```

## Styling Rules

- Use mobile-first Tailwind CSS.
- Use the nearest existing Tailwind size and theme token.
- Check `src/styles/theme.css` before adding colors, spacing, radii, or typography values.
- Avoid Tailwind arbitrary values.
- Do not add classes to headings that are already handled by `base.css`, including default font weight, tracking, wrapping, or leading classes.
- Keep heading element classes focused on semantic size variants such as `text-h2`, `text-h3`, or layout spacing only when needed.
- Reuse existing utility classes and component classes from `base.css`, `components.css`, and `safe.css`.
- Do not add default CSS values that already exist in base styles.
- Avoid unused wrappers, duplicated cards, and nested card layouts.

## Component Rules

- Reuse existing components before creating new ones.
- Use `CustomButton.astro` for theme buttons.
- Use `Icons.astro` for icons.
- Use `OptimizedImage.astro` for local images.
- Use existing card components where a layout already matches.
- Keep imports clean and remove unused code.
- Prefer static rendering. Add client JavaScript only for real interaction.
- Initialize shared browser behavior through existing global/widget scripts instead of duplicating inline logic.

## Forms And Preline

- Use the theme contact/form components for inputs, selects, radios, checkboxes, and date fields.
- Use Preline components only through existing project patterns.
- Keep Preline initialization centralized where possible.
- Do not replace theme form classes with raw browser defaults.

## Copy And Theme Shipping

- Write generic product-theme copy that customers can use without replacing a specific brand name.
- Avoid hardcoding the theme name inside section copy unless the file is theme metadata.
- Keep content editable through `.md` or `.mdx` files.
- Do not leave placeholders like "Lorem ipsum" unless an existing file already uses placeholder content intentionally.

## Verification

- Run `npm run astro-check` after code or schema changes.
- Run `npm run build` for broad theme changes, content collection changes, or anything that affects routing/assets.
- Do not commit generated output such as `dist/`.
