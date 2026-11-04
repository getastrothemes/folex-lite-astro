/**
 * GROQ queries for the website.
 *
 * Every page needs a single request: section lists (services, projects) and
 * image assets are resolved inside the query. Queries that depend on the
 * language receive it as the `$lang` parameter.
 */

// Reusable projections ------------------------------------------------------

// Image with its alt text, crop/hotspot and the asset url + size
export const imageFields = /* groq */ `
  _type,
  alt,
  hotspot,
  crop,
  asset->{
    _id,
    url,
    mimeType,
    metadata { dimensions { width, height, aspectRatio }, lqip }
  }
`;

// Button / link object
export const linkFields = /* groq */ `
  enabled,
  label,
  url,
  openInNewTab
`;

export const seoFields = /* groq */ `
  metaTitle,
  metaDescription,
  noIndex,
  ogImage{ ${imageFields} }
`;

// Portable Text with resolved inline images
export const portableTextFields = /* groq */ `
  ...,
  _type == "image" => { _key, caption, ${imageFields} }
`;

export const serviceFields = /* groq */ `
  _id,
  _type,
  title,
  description,
  order,
  language
`;

// Everything a portfolio card needs
export const projectCardFields = /* groq */ `
  _id,
  _type,
  title,
  "slug": slug.current,
  language,
  date,
  order,
  categories,
  description,
  coverImage{ ${imageFields} }
`;

// Ordering rules shared by every project/service list
const projectOrder = /* groq */ `order(coalesce(order, 9999) asc, date desc)`;
const serviceOrder = /* groq */ `order(coalesce(order, 9999) asc, title asc)`;

/**
 * Page sections. Hidden sections are skipped. `services`/`projects` contain
 * the hand-picked documents, or all documents of the page language when the
 * editor did not pick any. The section `limit` is applied in `data.ts`.
 */
export const sectionsFields = /* groq */ `
  sections[hidden != true]{
    _key,
    _type,
    _type == "bannerSection" => {
      title,
      titleSize,
      description,
      image{ ${imageFields} },
      button{ ${linkFields} }
    },
    _type == "clientsSection" => {
      title,
      appearance,
      columnsPerRow,
      logos[]{ _key, ${imageFields} }
    },
    _type == "servicesSection" => {
      title,
      sectionDirection,
      limit,
      "services": select(
        count(services) > 0 => services[]->{ ${serviceFields} },
        *[_type == "service" && language == $lang] | ${serviceOrder} { ${serviceFields} }
      )
    },
    _type == "portfolioSection" => {
      title,
      layout,
      appearance,
      limit,
      button{ ${linkFields} },
      "projects": select(
        count(projects) > 0 => projects[]->{ ${projectCardFields} },
        *[_type == "project" && language == $lang && defined(slug.current)] | ${projectOrder} { ${projectCardFields} }
      )
    },
    _type == "pricingSection" => {
      title,
      plans[]{
        _key,
        name,
        description,
        pricePrefix,
        price,
        priceSuffix,
        features,
        button{ ${linkFields} }
      }
    },
    _type == "contentSection" => {
      title,
      body[]{ ${portableTextFields} }
    }
  }
`;

// Global documents ----------------------------------------------------------

export const siteSettingsQuery = /* groq */ `
  *[_id == "siteSettings"][0]{
    _id,
    _type,
    title,
    tagline,
    description,
    logo{ ${imageFields} },
    logoLight{ ${imageFields} },
    logoText,
    logoWidth,
    logoHeight,
    contactInfo,
    socialLinks[]{ _key, platform, url },
    "defaultSeo": coalesce(defaultSeo, seo){
      author,
      keywords,
      robots,
      twitterHandle,
      ogImage{ ${imageFields} }
    },
    contactForm{ provider, action },
    stickyHeader,
    showCopyright,
    notFound
  }
`;

const menuEntryFields = /* groq */ `
  _key,
  label,
  url,
  badge{ label, color }
`;

const navigationProjection = /* groq */ `
    _id,
    _type,
    menu[]{
      ${menuEntryFields},
      children[]{
        ${menuEntryFields},
        children[]{ ${menuEntryFields} }
      }
    },
    headerButton{ ${linkFields} },
    sidePanel{ enabled, description, button{ ${linkFields} } }
`;

const footerProjection = /* groq */ `
    _id,
    _type,
    title,
    description,
    copyright,
    contactForm{
      emailSubject,
      submitLabel,
      note,
      successMessage,
      errorMessage,
      fields[]{
        _key,
        fieldType,
        name,
        label,
        placeholder,
        required,
        halfWidth,
        rows,
        options[]{ _key, label, value },
        searchPlaceholder,
        groupLabel,
        checkboxValue
      }
    }
`;

export const navigationQuery = /* groq */ `
  *[_type == "navigation" && language == $lang][0]{ ${navigationProjection} }
`;

export const footerQuery = /* groq */ `
  *[_type == "footer" && language == $lang][0]{ ${footerProjection} }
`;

/**
 * Navigation menu + footer of one language in a single request (used by
 * every page). Site settings stay a separate query because they are always
 * fetched without visual-editing markers.
 */
export const layoutQuery = /* groq */ `{
  "navigation": *[_type == "navigation" && language == $lang][0]{ ${navigationProjection} },
  "footer": *[_type == "footer" && language == $lang][0]{ ${footerProjection} }
}`;

// Pages -----------------------------------------------------------------------

export const homePageQuery = /* groq */ `
  *[_type == "homePage" && language == $lang][0]{
    _id,
    _type,
    title,
    language,
    seo{ ${seoFields} },
    ${sectionsFields}
  }
`;

export const pageQuery = /* groq */ `
  *[_type == "page" && language == $lang && slug.current == $slug][0]{
    _id,
    _type,
    title,
    "slug": slug.current,
    language,
    image{ ${imageFields} },
    body[]{ ${portableTextFields} },
    seo{ ${seoFields} },
    ${sectionsFields},
    // Languages that have a page with the same slug (for hreflang links
    // and the language switcher)
    "translations": *[_type == "page" && slug.current == ^.slug.current && defined(language)].language
  }
`;

// Published pages of the enabled languages (for getStaticPaths)
export const pageSlugsQuery = /* groq */ `
  *[_type == "page" && defined(slug.current) && language in $languages && !(_id in path("drafts.**"))]{
    "slug": slug.current,
    language
  }
`;

// Portfolio -------------------------------------------------------------------

/**
 * One project plus the ordered list of all projects in the same language
 * (`siblings`), used to work out the previous/next project links.
 */
export const projectQuery = /* groq */ `
  *[_type == "project" && language == $lang && slug.current == $slug][0]{
    ${projectCardFields},
    gallery[]{ _key, ${imageFields} },
    details[]{ _key, label, valueType, value },
    body[]{ ${portableTextFields} },
    seo{ ${seoFields} },
    "siblings": *[_type == "project" && language == $lang && defined(slug.current)] | ${projectOrder} {
      title,
      "slug": slug.current
    },
    // Languages that have a project with the same slug
    "translations": *[_type == "project" && slug.current == ^.slug.current && defined(language)].language
  }
`;

export const projectsQuery = /* groq */ `
  *[_type == "project" && language == $lang && defined(slug.current)] | ${projectOrder} {
    ${projectCardFields}
  }
`;

export const projectSlugsQuery = /* groq */ `
  *[_type == "project" && defined(slug.current) && language in $languages && !(_id in path("drafts.**"))]{
    "slug": slug.current,
    language
  }
`;

// Services --------------------------------------------------------------------

export const servicesQuery = /* groq */ `
  *[_type == "service" && language == $lang] | ${serviceOrder} {
    ${serviceFields}
  }
`;
