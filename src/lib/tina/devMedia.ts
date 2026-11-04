import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

const MIME: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

/**
 * Dev-only: serves `/images/*` from `src/assets/images` when the file is not in
 * `public/`. Tina stores media paths as `/images/...` (see `media` in
 * `tina/config.ts`), and the theme optimizes those images at build time. This
 * lets the Tina media manager and editor previews show them during `npm run dev`.
 */
export default function tinaDevMedia(): Plugin {
  let root = process.cwd();

  return {
    name: "theme:tina-dev-media",
    apply: "serve",
    configResolved(config) {
      root = config.root;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = decodeURIComponent((req.url || "").split("?")[0]);
        if (!url.startsWith("/images/")) return next();

        const assetsDir = path.join(root, "src/assets");
        const file = path.normalize(path.join(assetsDir, url));
        const type = MIME[path.extname(file).toLowerCase()];

        if (
          !type ||
          !file.startsWith(assetsDir + path.sep) ||
          existsSync(path.join(root, "public", url)) ||
          !existsSync(file) ||
          !statSync(file).isFile()
        ) {
          return next();
        }

        res.setHeader("Content-Type", type);
        res.setHeader("Cache-Control", "no-cache");
        createReadStream(file).pipe(res);
      });
    },
  };
}
