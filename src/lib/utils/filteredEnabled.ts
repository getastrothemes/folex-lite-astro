import type { NavigationLink } from "@/types";

export function filteredEnabled(menu: NavigationLink[]): NavigationLink[] {
  return menu
    .filter((item) => item.enable)
    .map((item) => {
      const newItem: any = { ...item };

      // Recursively process nested objects and arrays
      for (const key in newItem) {
        if (Array.isArray(newItem[key])) {
          newItem[key] = filteredEnabled(newItem[key]);
        } else if (typeof newItem[key] === "object" && newItem[key] !== null) {
          newItem[key] = filteredEnabled([newItem[key]])[0] || {};
        }
      }

      return newItem;
    });
}
