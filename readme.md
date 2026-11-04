> ⭐️ Love this theme? Star it to support our work!

# 🚀 Folex Lite Astro — Free Startup & Agency Astro Theme

**Folex Lite** is a lightweight, free version of the premium [Folex Astro Theme](https://getastrothemes.com/astro-themes/folex/), designed for fast, SEO-friendly startup and digital agency websites.

> ⚡ Built with Astro 7, Tailwind CSS 4, and Markdown — optimized for performance, SEO, and simplicity.

> 🧩 **Prefer a visual editor?** Folex Lite is also available as a [Tina CMS edition](https://github.com/getastrothemes/folex-lite-astro/blob/tina-cms/readme.md) and a [Sanity CMS edition](https://github.com/getastrothemes/folex-lite-astro/blob/sanity-cms/readme.md). See [Theme Editions](#-theme-editions).

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/getastrothemes/folex-lite-astro) [![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/getastrothemes/folex-lite-astro) [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/getastrothemes/folex-lite-astro?devcontainer_path=.devcontainer/devcontainer.json)

![Folex Lite Banner](/public/images/og-image.jpg)

## ✨ Features at a Glance

- ✅ Homepage layout: Startup / Agency
- ✅ Built with Astro 7 + Tailwind CSS 4
- ✅ Fully responsive and accessible
- ✅ 100/100 Lighthouse performance score
- ✅ SEO-ready: meta tags, Open Graph, JSON-LD schema
- ✅ Minimal but tasteful built-in animations
- ✅ Easily deploy to Vercel, Netlify, or Cloudflare Pages
- ✅ Edit all content using Markdown
- ✅ Contact form integration support (Formspree, Formsubmit, Netlify)

## 🔄 Lite vs. Pro — Feature Comparison

| Feature                                                       | Folex Lite | Folex Pro 💎 |
| ------------------------------------------------------------- | ---------- | ------------ |
| Homepage – Startup/Agency                                     | ✅         | ✅           |
| Creative/Digital/Portfolio Homepages                          | ❌         | ✅           |
| Fully Multilingual (i18n) Support                             | ✅         | ✅           |
| SEO Optimized (Meta + OpenGraph + JSON-LD)                    | ✅         | ✅           |
| 100/100 Lighthouse Score                                      | ✅         | ✅           |
| Deployment Ready (Vercel, Netlify, Cloudflare)                | ✅         | ✅           |
| Accessible & Responsive Design                                | ✅         | ✅           |
| Minimal Animations                                            | ✅         | ✅           |
| Premium Scroll & Hover Animations                             | ❌         | ✅           |
| Markdown Content Support                                      | ✅         | ✅           |
| Built-in Contact Form Support                                 | ✅         | ✅           |
| Creative UI Components (Tabs, Accordions, Testimonials, etc.) | ❌         | ✅           |
| Pre-built Pages: About, FAQ, Services, Pricing, etc.          | ❌         | ✅           |
| Blog System (with Markdown & Schema)                          | ❌         | ✅           |
| Projects/Portfolio Section                                    | ❌         | ✅           |
| Mega Menu Navigation                                          | ❌         | ✅           |
| Enhanced Footer (Newsletter, Links, Policies)                 | ❌         | ✅           |
| Terms & Privacy Pages (Auto-generated)                        | ❌         | ✅           |

> 🎯 **Need more pages and flexibility?**  
> Upgrade to [Folex Pro →](https://getastrothemes.com/astro-themes/folex/) for the full business-ready toolkit.

## 🧭 Theme Editions

Folex Lite comes in three editions with the same design and pages. Each one lives on its own Git branch and has its own setup guide:

| Edition                    | Branch                                                                             | Content management                                        | Setup guide                                                                                       |
| -------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Original** (this README) | [`main`](https://github.com/getastrothemes/folex-lite-astro/tree/main)             | Edit Markdown, JSON and TOML files in your code editor    | [Quick Start](#-quick-start)                                                                      |
| **Tina CMS edition**       | [`tina-cms`](https://github.com/getastrothemes/folex-lite-astro/tree/tina-cms)     | Visual editor on top of the same Git-based Markdown files | [Tina CMS README](https://github.com/getastrothemes/folex-lite-astro/blob/tina-cms/readme.md)     |
| **Sanity CMS edition**     | [`sanity-cms`](https://github.com/getastrothemes/folex-lite-astro/tree/sanity-cms) | Sanity Studio with structured content                     | [Sanity CMS README](https://github.com/getastrothemes/folex-lite-astro/blob/sanity-cms/readme.md) |

- **You are on `main`.** This branch is the original theme. You edit content in Markdown files under `src/content/` and settings in `src/config/`. It has no CMS.
- **Want to keep your content as files in Git, but edit it visually?** Use the [Tina CMS edition](https://github.com/getastrothemes/folex-lite-astro/blob/tina-cms/readme.md). Click text on your website, type, and see the change immediately. Add, remove and reorder page sections, create pages and upload images. Editing on your computer needs no account, and online editing works on Tina Cloud's free plan.
- **Prefer a hosted content platform?** Use the [Sanity CMS edition](https://github.com/getastrothemes/folex-lite-astro/blob/sanity-cms/readme.md). It is managed from Sanity Studio with live preview and click-to-edit, and it works on Sanity's free plan.

To get a CMS edition, clone its branch:

```bash
# Tina CMS edition
git clone --branch tina-cms https://github.com/getastrothemes/folex-lite-astro.git folex-lite-tina

# Sanity CMS edition
git clone --branch sanity-cms https://github.com/getastrothemes/folex-lite-astro.git folex-lite-sanity
```

## ⚡ Quick Start

```bash
git clone https://github.com/getastrothemes/folex-lite-astro.git
cd folex-lite-astro
npm install
npm run dev
```

## 📬 Contact Form Setup

Before you deploy, point the contact form at your own inbox. Open `src/config/config.toml` and set these two values under `[settings]`:

| Provider      | `contactFormProvider` | `contactFormAction`                             |
| ------------- | --------------------- | ----------------------------------------------- |
| FormSubmit    | `"formsubmit.co"`     | `"https://formsubmit.co/your_email@example.com"` |
| Formspree     | `"formspree"`         | `"https://formspree.io/f/your_form_id"`         |
| Netlify Forms | `"netlify"`           | `"/"`                                           |

- **FormSubmit**: the first submission sends a confirmation email to that address. Click the link in it to activate the form.
- **Formspree**: create a form at [formspree.io](https://formspree.io/) and paste its endpoint.
- **Netlify Forms**: deploy on Netlify with form detection turned on. See the [Netlify Forms docs](https://docs.netlify.com/forms/setup/).

The theme ships with the placeholder `your_email@example.com`, so the form will not deliver messages until you change it.

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
.
├── .vscode/
├── public/
├── scripts/
├── src/
│ ├── assets/
│ ├── config/
│ ├── content/
│ ├── i18n/
│ ├── layouts/
│ ├── lib/
│ ├── pages/
│ ├── styles/
│ ├── types/
│ ├── content.config.ts
│ └── env.d.ts
├── .editorconfig
├── .gitignore
├── .markdownlint.json
├── .prettierrc
├── astro.config.mjs
├── netlify.toml
├── vercel.json
├── vercel.sh
└── tsconfig.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

The `src/content/` directory contains "collections" of related Markdown and MDX documents. Use `getCollectionCTM()` to retrieve posts from `src/content/blog/`, and type-check your frontmatter using an optional schema. See [Astro's Content Collections docs](https://docs.astro.build/en/guides/content-collections/) to learn more.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 🚀 One-Click Deployment

Deploy the Folex Lite Astro theme instantly to your favorite platform:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/getastrothemes/folex-lite-astro)

## 👀 Want to learn more?

Full usage, customization, and deployment guide:

[Theme Documentation](https://docs.getastrothemes.com/folex/) · [Astro Documentation](https://docs.astro.build) · [Astro Discord server](https://astro.build/chat)

## 📄 License

Folex Lite is free and open source under the [MIT License](LICENSE.md).

No visible website attribution is required. The copyright and MIT permission notices must remain in copies or substantial portions of the software.

## 💬 Feedback & Suggestions

If you enjoy using Folex Lite or have ideas to improve it:

📣 [Give Feedback](https://getastrothemes.com/contact/)

## 🛠 Credits

Made with ❤️ by [Getastrothemes](https://getastrothemes.com/)

Folex Lite is inspired by the premium [Folex Pro Theme](https://getastrothemes.com/astro-themes/folex/)
