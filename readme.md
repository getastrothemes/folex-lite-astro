> ⭐️ Love this theme? Star it to support our work!

# 🚀 Folex Lite Astro — Tina CMS Edition

**Folex Lite** is a lightweight, free version of the premium [Folex Astro Theme](https://getastrothemes.com/astro-themes/folex/), designed for fast, SEO-friendly startup and digital agency websites.

This is the **Tina CMS edition**. Your website looks and works exactly like the original theme, and you can edit it in a visual editor: click text on the page, type, and see the change immediately. No code needed.

> ⚡ Built with Astro 7, Tailwind CSS 4, Markdown and [Tina CMS](https://tina.io).

## 🌿 Editions

| Branch     | Edition                                                    |
| ---------- | ---------------------------------------------------------- |
| `main`     | Original theme (edit Markdown files directly)              |
| `tina-cms` | Tina CMS edition (this branch): visual editing in the browser |

Both editions use the same content files, design and features.

## 📚 Contents

- [What you can edit](#-what-you-can-edit)
- [How it works (in plain words)](#-how-it-works-in-plain-words)
- [1. Start the website on your computer](#1-start-the-website-on-your-computer)
- [2. Edit your website](#2-edit-your-website)
- [3. Save and publish your changes](#3-save-and-publish-your-changes)
- [4. Edit the live website online (Tina Cloud)](#4-edit-the-live-website-online-tina-cloud)
- [Live visual editing on the deployed site](#-live-visual-editing-on-the-deployed-site)
- [Environment variables](#-environment-variables)
- [Tina Cloud plans and limits](#-tina-cloud-plans-and-limits)
- [Contact form setup](#-contact-form-setup)
- [Troubleshooting](#-troubleshooting)
- [For developers](#-for-developers)
- [Updating the theme](#-updating-the-theme)

## ✨ What you can edit

Everything below is editable in the CMS, in every language of the site (English and French by default):

| In the CMS menu                    | What it controls                                                                 |
| ---------------------------------- | -------------------------------------------------------------------------------- |
| **Homepage**                       | Page title, SEO, and the **order of the homepage sections** (add, remove, drag)   |
| **Pages**                          | Pages like Privacy Policy. Create new pages, add sections, write the page text   |
| **Portfolio**                      | Projects: title, cover image, gallery, categories, project details, story        |
| **Services**                       | The services in the homepage services list                                       |
| **Section · Hero banner**          | The big headline, text, image and button at the top of the homepage              |
| **Section · Client logos**         | Client logos and their descriptions                                              |
| **Section · Services / Portfolio** | Heading and layout options of those homepage sections                            |
| **Section · Pricing plans**        | Plans, prices, features and buttons                                              |
| **Section · Footer call to action**| The large heading and text in the footer                                         |
| **Section · Footer contact form**  | Contact form fields, send button, email subject and messages                     |
| **Settings · Site**                | Website name, logo, contact details, SEO, social sharing image, header button, contact form service |
| **Settings · Navigation menu**     | Header menu with dropdowns (three levels)                                        |
| **Settings · Social links**        | Social profiles shown in the footer and side menu                                |
| **Settings · Interface text**      | Small texts like "Previous", "Next" and the copyright line, per language        |

Every field has a plain-language label, a short explanation and, where it matters, a check that tells you what to fix (for example, a link that does not start with `/` or `https://`).

### Page builder

The **Homepage** and every **Page** have a **Page sections** list. You can:

- **Add** a section: Hero banner, Client logos, Services, Portfolio, Pricing plans, or (on pages) Page text.
- **Remove** a section with the trash icon.
- **Reorder** sections by dragging them.
- **Create new pages** under **Pages**: give the page a title, pick its sections, write its text.

Each section type has one shared content file per language, edited under **Section · …** or by clicking the section in the preview. So the Pricing section shows the same plans on every page that uses it. This is how the original theme works too.

What the page builder does **not** do: it does not let you design new layouts, move elements freely or change colors and fonts. It arranges the theme's existing, ready-made sections.

## 💡 How it works (in plain words)

- Your website's content is stored in **files** inside this project (Markdown, JSON and TOML files in `src/content`, `src/config` and `src/i18n`). There is no database.
- **Tina CMS** is an editor that reads and writes those same files. Whatever you change in Tina ends up in the files, and the website is built from the files.
- **Editing on your computer** (`npm run dev`) saves straight to the files on your computer. Nobody else sees the changes until you publish them.
- **Publishing** means sending the changed files to your Git repository (for example on GitHub). Your hosting provider (Netlify, Vercel or Cloudflare) notices the change and rebuilds the live website, which takes a minute or two.
- **Editing the live website online** uses **Tina Cloud**, a hosted service by the makers of Tina. When you save, Tina Cloud saves the change to your GitHub repository for you, and the website rebuilds automatically.

## 1. Start the website on your computer

You need [Node.js](https://nodejs.org/) version 22 or newer. To check, open a terminal and run `node -v`.

```bash
git clone https://github.com/getastrothemes/folex-lite-astro.git
cd folex-lite-astro
git checkout tina-cms
npm install
npm run dev
```

When it is ready, you will see the address of your website in the terminal, usually:

- Website: <http://localhost:4321/>
- Visual editor: <http://localhost:4321/admin/>

You do **not** need a Tina account for this. Stop the server with `Ctrl + C`.

## 2. Edit your website

1. Open <http://localhost:4321/admin/> and click **Enter Edit Mode**.
2. The editor opens your homepage: the form is on the left, your website on the right.
3. **Click any text or image on the website** that turns blue when you point at it. The matching field opens on the left.
4. **Type.** The website on the right updates as you type, before you save.
5. Click **Save**.

Other ways to find content:

- Click **Referenced Files** (bottom left) to see every piece of content used on the page you are viewing.
- Click the **☰ menu** (top left) to browse all content types, for example **Portfolio · English**, and to **create** new pages, projects and services.
- Use the language switcher on the website (EN / FR) to edit the other language.

**Images:** click an image field to open the media manager. You can upload new images or choose existing ones. Uploads are stored in `src/assets/images`, and the theme automatically optimizes them (resized, modern formats) when the website is built. Use simple file names (lowercase letters, numbers, dashes).

**Drafts:** pages, projects and services have a **Draft** switch. Drafts show while you edit on your computer but are left out of the published website.

**What updates live:** the page content and the footer update as you type. The header (logo and menu) and some site settings update after you save. While editing on your computer, the preview reloads automatically when you save.

## 3. Save and publish your changes

Saving in the editor on your computer changes files on your computer. To put the changes on the live website, publish them to Git:

**With GitHub Desktop (no command line):**

1. Open the project in [GitHub Desktop](https://desktop.github.com/).
2. You will see the changed files. Write a short summary (e.g. "Update homepage text").
3. Click **Commit**, then **Push origin**.

**With the terminal:**

```bash
git add -A
git commit -m "Update website content"
git push
```

Your hosting provider then rebuilds the website. Changes are usually live within a few minutes.

### Deploy the website

Connect your repository to a host. The build settings are already included:

| Host                 | Settings                                                     | Online visual editing |
| -------------------- | ------------------------------------------------------------ | --------------------- |
| **Netlify**          | Uses `netlify.toml` automatically                            | ✅                    |
| **Vercel**           | Uses `vercel.json` automatically                             | ✅                    |
| **Cloudflare Pages** | Build command `npm run build`, output directory `dist`        | Form editing only     |

## 4. Edit the live website online (Tina Cloud)

Do this once if you (or your client) want to edit the website from any browser, without running anything on a computer.

**Is Tina Cloud required?** Only for online editing. Your website works without it, and editing on your computer never needs it. If Tina Cloud is not set up, `/admin/` on your live site shows a short page explaining how to connect it.

**Setup:**

1. **Put your project on GitHub.** Your website must be deployed from a GitHub repository (see [Deploy the website](#deploy-the-website)). Push the `tina/tina-lock.json` file too: Tina Cloud reads your content structure from it.
2. **Create a Tina Cloud account** at [app.tina.io](https://app.tina.io). You can sign up with GitHub or with an email address.
3. **Create a project:** click **Create Project**, authorize the Tina.io GitHub app, and pick your repository.
4. **Add your website addresses** under the project's **Site URLs**, for example `https://www.example.com` and `http://localhost:4321`. Tina only opens the editor on these addresses.
5. **Copy two values** from the project:
   - **Client ID** (on the **Overview** tab)
   - a **Content (read-only) token** (on the **Tokens** tab)
6. **Add them to your host** (Netlify: *Site configuration → Environment variables*; Vercel: *Settings → Environment Variables*; Cloudflare Pages: *Settings → Environment variables*):

   | Name                    | Value                      |
   | ----------------------- | -------------------------- |
   | `PUBLIC_TINA_CLIENT_ID` | the Client ID              |
   | `TINA_TOKEN`            | the read-only token        |

7. **Redeploy** the website (Netlify: *Deploys → Trigger deploy*; Vercel: *Deployments → Redeploy*).
8. Open `https://your-website/admin/`, click **Log in**, and edit.

**How saving works online:** when you click **Save**, Tina Cloud saves the change straight to your GitHub repository (on the branch the site is built from). Your host notices it and rebuilds the website. After a minute or two, the change is live. New images are uploaded to the repository too.

**Logging in and inviting people:** editors log in with their Tina Cloud account. Invite people in your Tina Cloud project under **Collaborators** (roles: Admin or Editor). Editors do not need a GitHub account.

**Which branch is edited?** The branch your host builds from is detected automatically on Netlify, Vercel, Cloudflare Pages and GitHub Actions. Otherwise `main` is used. Set `TINA_BRANCH` to choose another branch.

**Security:** the Client ID is public by design. `TINA_TOKEN` is private: it is only used while building the site and inside the small server function used for live editing, never in the browser. Never commit your `.env` file.

## 👀 Live visual editing on the deployed site

| Where you edit                                   | Click-to-edit and live preview while typing | Form editing |
| ------------------------------------------------ | ------------------------------------------- | ------------ |
| Your computer (`npm run dev`)                    | ✅                                          | ✅           |
| Online, website on **Netlify** or **Vercel**     | ✅                                          | ✅           |
| Online, website on **Cloudflare Pages** or another static host | ❌ (the editor shows forms instead) | ✅           |

Why the difference: the live preview re-renders a piece of the page on the server while you type. Netlify and Vercel run this as one small serverless function, set up automatically; all normal pages stay static. Cloudflare Pages cannot run it with the current Astro Cloudflare adapter, so on Cloudflare Pages you edit with forms and see changes after saving and redeploying.

For a self-hosted Node.js server, run `npm install @astrojs/node` and set `TINA_HOSTING=node`.

## 🔐 Environment variables

All variables are optional. Without any of them the website builds and local editing works. See [`.env.example`](.env.example).

| Variable                   | Public or private | Needed for                                    |
| -------------------------- | ----------------- | --------------------------------------------- |
| `PUBLIC_TINA_CLIENT_ID`    | Public            | Online editing (Tina Cloud project ID)        |
| `TINA_TOKEN`               | **Private**       | Online editing (read-only content token)      |
| `TINA_BRANCH`              | Public            | Choosing the edited branch (default: detected, else `main`) |
| `TINA_HOSTING`             | Public            | Forcing `netlify`, `vercel`, `node` or `static` (default: detected) |
| `PUBLIC_TINA_ADMIN_ORIGIN` | Public            | Admin on another domain (e.g. GitHub Codespaces) |

To test Tina Cloud on your computer, copy `.env.example` to `.env` and fill in the values. `.env` is ignored by Git.

## 💳 Tina Cloud plans and limits

Tina Cloud pricing is per project. At the time of writing (November 2026, see [tina.io/pricing](https://tina.io/pricing) for current details):

- **Free plan:** $0, includes visual editing, **2 users**, unlimited content, 100 GB bandwidth per month. Enough for a small business site with one or two editors.
- **Paid plans** (Team and up) add more users and the **editorial workflow**: saving to a separate branch and publishing through a pull request after review. The free plan saves directly to the live branch.

Everything in this theme works on the free plan. Editing on your own computer is always free and needs no account.

## 📬 Contact form setup

Before you deploy, point the contact form at your own inbox. In the CMS open **Settings · Site → Theme settings** and set **Contact form service** and **Contact form address** (or edit `src/config/config.toml` under `[settings]`):

| Provider      | `contactFormProvider` | `contactFormAction`                              |
| ------------- | --------------------- | ------------------------------------------------ |
| FormSubmit    | `"formsubmit.co"`     | `"https://formsubmit.co/your_email@example.com"` |
| Formspree     | `"formspree"`         | `"https://formspree.io/f/your_form_id"`          |
| Netlify Forms | `"netlify"`           | `"/"`                                            |

- **FormSubmit**: the first submission sends a confirmation email to that address. Click the link in it to activate the form.
- **Formspree**: create a form at [formspree.io](https://formspree.io/) and paste its endpoint.
- **Netlify Forms**: deploy on Netlify with form detection turned on. See the [Netlify Forms docs](https://docs.netlify.com/forms/setup/).

The theme ships with the placeholder `your_email@example.com`, so the form will not deliver messages until you change it.

## 🧰 Troubleshooting

**`/admin/` says "The CMS is not connected yet".** The live site was built without `PUBLIC_TINA_CLIENT_ID` and `TINA_TOKEN`. Add both to your host and redeploy (see [step 4](#4-edit-the-live-website-online-tina-cloud)).

**The build fails after adding the Tina variables.** Check that the Client ID and token belong to the same Tina Cloud project, that the token is a **Content (read-only)** token, and that the project is connected to the repository and branch your host builds. Tina Cloud may need a minute to index a new branch: redeploy after a short wait. Also make sure `tina/tina-lock.json` is pushed.

**The online editor shows forms but no live preview.** Your host has no live preview support (e.g. Cloudflare Pages), see [Live visual editing](#-live-visual-editing-on-the-deployed-site). Changes still save and appear after the site rebuilds.

**My change is saved but not on the live site yet.** The site rebuilds after every save, which takes a few minutes. Check the deploy log of your host. When editing on your computer, remember to [publish your changes](#3-save-and-publish-your-changes).

**"Login" in the online editor fails or loops.** Add your website address (exactly, with `https://`) to **Site URLs** in your Tina Cloud project.

**A newly uploaded image is missing in the online preview.** Images uploaded online are added to the site with the next build. The preview shows them from Tina Cloud until then.

**`npm run dev` says a port is in use.** Tina uses ports 4001 and 9000 and the website uses 4321. Stop other running copies (`Ctrl + C` in their terminal) and try again. If 4321 is busy, Astro picks the next free port: use the address shown in the terminal.

**The menu or logo did not change in the preview.** The header updates after you save, not while typing.

**Comments disappeared from a content file after saving in the CMS.** Tina rewrites a file when you save it, so comments in content files are removed. Everything the theme uses is in the CMS, with explanations in the field descriptions.

**`npm run dev` stops right after starting when run by an AI coding assistant.** Astro starts its dev server in the background when it detects an AI agent, which ends the Tina server. Run it from your own terminal, or set `ASTRO_DEV_BACKGROUND=1` for that command.

## 🧑‍💻 For developers

### Commands

| Command                   | Action                                                              |
| :------------------------ | :------------------------------------------------------------------ |
| `npm install`             | Installs dependencies                                               |
| `npm run dev`             | Website and Tina editor at `localhost:4321` (Tina API on port 4001) |
| `npm run build`           | Builds the Tina admin and the website into `./dist/`                |
| `npm run preview`         | Builds, then previews the build locally                             |
| `npm run astro-check`     | Type checks the project (generates the Tina client first if needed) |
| `npm run tina:audit`      | Checks every content file against the Tina schema                   |

### How the Tina integration is built

- **One content source.** Tina collections point at the existing files (`tina/collections/`). Astro content collections still render every page from the same files, so a build needs no Tina service. Production HTML is the same as the original theme when live editing is off.
- **Schema.** `tina/config.ts` with collections in `tina/collections/` and shared field builders in `tina/fields.ts`. Pages, portfolio and services have one collection per language from `src/config/language.json`. Keep it in sync with `src/content.config.ts` and `src/sections.schema.ts`: Tina drops nested fields that are not in its schema when saving.
- **Visual editing** uses the official [`@tinacms/astro`](https://www.npmjs.com/package/@tinacms/astro) integration. Editable regions (`src/layouts/components/tina/EditableRegion.astro`) wrap the homepage, pages, portfolio items and the footer. While an editor types, `src/lib/tina/island-route.ts` re-renders a region with Tina data (`src/lib/tina/tinaData.ts`, `islands.ts`) using the same components. Section components accept their content through props (`data`, `lang`) and mark editable elements with `data-tina-field`.
- **Hosting detection** lives in `scripts/tina/hosting.mjs` and is shared by `astro.config.mjs` and `scripts/tina/run.mjs`.
- **Media** is stored in `src/assets/images` and saved as `/images/...`, the path format `OptimizedImage.astro` already uses.
- **Page builder:** the `sections` list in page frontmatter (`src/lib/pageSections.ts`, `src/layouts/components/PageSections.astro`). Without it, the homepage uses the original section order and pages show their text.
- `tina/__generated__` is generated and ignored by Git. `tina/tina-lock.json` must be committed.

### Project structure

```text
.
├── public/            # static files (admin/ is generated by Tina)
├── scripts/           # build helpers, including scripts/tina/
├── src/
│   ├── assets/        # images (Tina media library: src/assets/images)
│   ├── config/        # config.toml, menus, social links, languages
│   ├── content/       # pages, portfolio, services, sections (Markdown/MDX)
│   ├── i18n/          # interface text per language
│   ├── layouts/       # components, sections, Tina editable regions
│   ├── lib/           # utilities, page sections, Tina data loaders
│   ├── pages/         # routes
│   └── styles/
├── tina/              # Tina CMS schema and configuration
├── astro.config.mjs
├── netlify.toml
├── vercel.json
└── wrangler.toml
```

## 🔄 Updating the theme

This edition lives on the `tina-cms` branch of the theme repository. To pull in updates:

```bash
git remote add upstream https://github.com/getastrothemes/folex-lite-astro.git
git fetch upstream
git merge upstream/tina-cms
```

Then run `npm install` and `npm run dev`, and check your content in the editor. If a merge conflict appears in a content file, keep your own content. To update Tina itself, run `npm update tinacms @tinacms/cli @tinacms/astro`, then `npm run build`. Push the regenerated `tina/tina-lock.json` so Tina Cloud picks up schema changes.

## 👀 Want to learn more?

[Theme Documentation](https://docs.getastrothemes.com/folex/) · [Tina CMS Documentation](https://tina.io/docs) · [Astro Documentation](https://docs.astro.build)

## 📄 License

Folex Lite is free and open source under the [MIT License](LICENSE.md).

No visible website attribution is required. The copyright and MIT permission notices must remain in copies or substantial portions of the software.

## 💬 Feedback & Suggestions

If you enjoy using Folex Lite or have ideas to improve it:

📣 [Give Feedback](https://getastrothemes.com/contact/)

## 🛠 Credits

Made with ❤️ by [Getastrothemes](https://getastrothemes.com/)

Folex Lite is inspired by the premium [Folex Pro Theme](https://getastrothemes.com/astro-themes/folex/)
