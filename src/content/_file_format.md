---
# Frontmatter Options for Markdown files in the content folder

# image: Use this field to set an `og:image` for social media sharing.
# When the page is shared, this image will display as the preview thumbnail.
image: ""

# title & description: These act as the page's primary title and description, affecting the title bar and SEO.
title: ""
description: ""

# Content Date
date: 2020-02-05

# customSlug: Set a custom slug for the page. This will override the default slug based on the file name.
# NOTE: make sure slug is same across localized versions of the same page.
customSlug: my-custom-slug

# metaTitle & metaDescription: Override the page's default title and description specifically for SEO.
# If set, these will be used as the meta title and description instead of the primary title and description.
metaTitle: ""
metaDescription: ""

# canonical: Specify the canonical URL for this page to avoid duplicate content issues.
# Use this if the page has multiple versions or exists elsewhere, ensuring it points to the preferred URL.
canonical: ""

# keywords: Add keywords specific to the page for SEO optimization.
# This helps search engines understand the primary topics covered on the page.
keywords:
  - ""

# draft: Set to `true` to prevent this page from being generated in the site build or included in the sitemap.
# NOTE: Setting draft: true in a `-index.md` file (e.g., blog-index.md) will exclude all associated pages
# within that collection (e.g., blog posts and paginated blog pages) from site builds and the sitemap.
draft: false # true/false (default is false)

# robots: Customize search engine directives for this page.
# Example: Use "noindex, nofollow" to tell search engines not to index this page or follow links.
# Common values include "noindex", "nofollow", and "noarchive".
robots: "noindex, nofollow"

# excludeFromSitemap: Set to `true` to exclude this page from the sitemap, even if it’s generated.
excludeFromSitemap: false # true/false (default is false)

# excludeFromCollection: Set to `true` to exclude this page from the collection of pages for a specific collection.
excludeFromCollection: false # true/false (default is false)

# author: Specify the author of this page, if different from the global site author.
author: ""

# tagline: Set a custom tagline for this page.
tagline: ""

# disableTagline: Set to `true` to disable the tagline from `config.toml` for this page.
disableTagline: false
---
