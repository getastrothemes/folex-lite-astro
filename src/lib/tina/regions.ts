// Editable regions of the live preview. Each one is re-rendered on the server
// by the island route while an editor types (see islands.ts). The wrapper here
// must match the element <EditableRegion> renders on the page.

export const REGIONS = {
  home: { tag: "div" },
  page: { tag: "div" },
  portfolio: { tag: "div" },
  footer: { tag: "div" },
} as const;

export type RegionName = keyof typeof REGIONS;
