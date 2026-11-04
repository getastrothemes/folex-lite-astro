import type { APIRoute } from "astro";
import { experimental_createIslandRoute } from "@tinacms/astro/experimental";
import { islands } from "./islands";

// On-demand route used by the Tina live preview (injected by integration.ts).
// It only answers POST requests from the Tina editor and never runs for
// regular visitors.
export const prerender = false;
export const ALL: APIRoute = experimental_createIslandRoute(islands);
