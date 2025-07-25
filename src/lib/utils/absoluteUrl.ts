export function absoluteUrl(url: string, Astro: any) {
  const absoluteURL = new URL(url, Astro.url.href).href;

  return absoluteURL;
}
