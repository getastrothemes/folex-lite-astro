import { tinaField } from "@tinacms/astro/tina-field";

/**
 * `data-tina-field` value for click-to-edit in the Tina preview. Returns
 * undefined for static content (no Tina metadata), so built pages get no
 * extra attributes.
 */
export const tinaAttr = (
  object: unknown,
  property?: string,
  index?: number,
): string | undefined =>
  (tinaField as (object: unknown, property?: string, index?: number) => string)(
    object,
    property,
    index,
  ) || undefined;
