import type { APIRoute } from "astro";
import { parseTomlToJson } from "@/lib/utils/tomlUtils";

const config = parseTomlToJson();

const { enable, disallow } = config.seo.robotsTxt;

const getRobotsTxt = (
  sitemapURL: URL,
) => `# Robots.txt file for controlling web crawler access

User-agent: *

# Allowed pages
Allow: /

# Disallowed pages
${disallow.map((item: string) => `Disallow: ${item}`).join("\n")}

# Sitemap location
Sitemap: ${sitemapURL.href}
`;

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL("sitemap-index.xml", site);
  return enable
    ? new Response(getRobotsTxt(sitemapURL))
    : new Response(null, { status: 404 });
};
