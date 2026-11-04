#!/bin/bash
# Vercel build script for the static website (see "buildCommand" in vercel.json).
#
# Add these environment variables in Vercel (Project > Settings > Environment Variables):
#   PUBLIC_SANITY_PROJECT_ID   your Sanity project ID (empty = bundled demo content)
#   PUBLIC_SANITY_DATASET      usually "production"
#   PUBLIC_SANITY_STUDIO_URL   e.g. https://your-name.sanity.studio
# Do NOT set SANITY_API_READ_TOKEN or SANITY_VISUAL_EDITING here: the live site
# is a static build that only shows published content.
#
# To rebuild when you publish in Sanity, create a Deploy Hook
# (Project > Settings > Git > Deploy Hooks) and add its URL as a webhook in
# https://www.sanity.io/manage > your project > API > Webhooks.

set -e

# Check if the script is running in a production or preview environment
if [[ $VERCEL_ENV == "production" ]]; then
  # Use the production project URL and prepend 'https://'
  baseURL="https://${VERCEL_PROJECT_PRODUCTION_URL}"
else
  # Create the preview URL and prepend 'https://staging.'
  baseURL="https://staging.${VERCEL_PROJECT_PRODUCTION_URL}"
fi

# Same steps as `npm run build`, run one by one so `--site` reaches `astro build`
# (`npm run build -- --site` would pass it to the last step instead).
npm run toml:watch
npx astro build --site "$baseURL"
npm run remove-draft-from-sitemap
