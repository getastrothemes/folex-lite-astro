import type { AstroIntegration } from "astro";
import tina from "@tinacms/astro/integration";
import { productionVisualEditing } from "../../../scripts/tina/hosting.mjs";

/**
 * Adds Tina visual editing support with the official `@tinacms/astro`
 * integration:
 * - Loads `@tinacms/astro` (edit-mode middleware and the editor bridge script)
 *   only when visual editing is available, so static builds stay Tina-free.
 * - Injects the on-demand `/tina-island/[name]` route that re-renders editable
 *   regions while an editor types. Always on in `astro dev`; on production
 *   builds only when the host has an adapter and Tina Cloud credentials.
 * - Exposes `import.meta.env.TINA_VISUAL_EDITING` so pages only emit the
 *   editing markers when the route exists.
 */
export default function tinaVisualEditing(): AstroIntegration {
  return {
    name: "theme:tina-visual-editing",
    hooks: {
      "astro:config:setup": ({ command, injectRoute, updateConfig, logger }) => {
        const enabled = command === "dev" || productionVisualEditing();

        if (enabled) {
          updateConfig({ integrations: [tina()] });
          injectRoute({
            pattern: "/tina-island/[name]",
            entrypoint: "./src/lib/tina/island-route.ts",
            prerender: false,
          });
        } else if (command === "build") {
          logger.info(
            "Live visual editing is off for this build (static hosting or missing Tina Cloud credentials). The Tina admin still works with form editing.",
          );
        }

        updateConfig({
          vite: {
            define: {
              "import.meta.env.TINA_VISUAL_EDITING": JSON.stringify(enabled),
            },
          },
        });
      },
    },
  };
}
