/**
 * Tailwind CSS Plugin to Register Custom Font Families
 *
 * This plugin reads font definitions from `./src/config/fonts.json`,
 * generates CSS variables for each font, and creates corresponding utility classes.
 *
 * Example:
 * If fonts.json contains:
 * [
 *   {
 *     "name": "Inter",
 *     "cssVariable": "font-inter",
 *     "fallback": "sans-serif"
 *   }
 * ]
 *
 * It will generate:
 *   --font-inter: Inter, sans-serif;
 *   .font-inter {
 *     font-family: var(--font-inter);
 *   }
 */
import plugin from "tailwindcss/plugin";
import { fontFamily } from "../config/fonts.json";

const fontFamilies = Object.fromEntries(
  fontFamily.map((font) => [
    font.cssVariable?.replace("font-", "") || font.name.toLowerCase(),
    `${font.name}, ${font.fallback || "sans-serif"}`,
  ]),
);

const fontVars = Object.fromEntries(
  Object.entries(fontFamilies).map(([k, v]) => [`--font-${k}`, v]),
);

module.exports = plugin.withOptions(() => {
  return ({ addBase, addUtilities }) => {
    addBase({ ":root": fontVars });

    const fontUtilities = Object.fromEntries(
      Object.keys(fontFamilies).map((k) => [
        `.font-${k}`,
        { fontFamily: `var(--font-${k})` },
      ]),
    );

    addUtilities(fontUtilities); // variants not necessary unless customized
  };
});
