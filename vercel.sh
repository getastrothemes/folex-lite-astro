#!/bin/bash

# Check if the script is running in a production or preview environment
if [[ $VERCEL_ENV == "production" ]]; then
  # Use the production project URL and prepend 'https://'
  baseURL="https://${VERCEL_PROJECT_PRODUCTION_URL}"
  npm run build -- --site "$baseURL"
else
  # Create the preview URL and prepend 'https://staging.'
  baseURL="https://staging.${VERCEL_PROJECT_PRODUCTION_URL}"
  npm run build -- --site "$baseURL"
fi

