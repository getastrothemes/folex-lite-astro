import type { AstroConfig } from "astro";
import { fontProviders } from "astro/config";

// Enhanced type definitions with better type safety
interface FontSrc {
  weight: string;
  style?: string;
  path?: string; // For local fonts
}

interface InputFontConfig {
  name: string;
  src: FontSrc[];
  preload?: boolean;
  provider: string;
  display?: "auto" | "block" | "swap" | "fallback" | "optional";
  cssVariable: string;
  fallback?: string;
  locallyHosted?: boolean;
  subsets?: string[];
  unicodeRange?: string[];
  optimizedFallbacks?: boolean;
  __comment?: string;
}

interface InputConfig {
  fontFamily: InputFontConfig[];
}

// More specific Astro Font types
type FontProvider =
  | ReturnType<typeof fontProviders.google>
  | ReturnType<typeof fontProviders.fontsource>
  | ReturnType<typeof fontProviders.bunny>
  | ReturnType<typeof fontProviders.fontshare>
  | ReturnType<typeof fontProviders.adobe>
  | "local";

interface BaseAstroFontConfig {
  provider: FontProvider;
  name: string;
  cssVariable: string;
  display?: "auto" | "block" | "swap" | "fallback" | "optional";
  fallbacks?: string[];
  optimizedFallbacks?: boolean;
}

interface RemoteAstroFontConfig extends BaseAstroFontConfig {
  provider: Exclude<FontProvider, "local">;
  weights?: (string | number)[];
  styles?: ("normal" | "italic" | "oblique")[];
  subsets?: string[];
  unicodeRange?: string[];
  stretch?: string;
  featureSettings?: string;
  variationSettings?: string;
}

interface LocalAstroFontConfig extends BaseAstroFontConfig {
  provider: "local";
  variants: Array<{
    weight: string | number;
    style: "normal" | "italic" | "oblique";
    src: string[];
    display?: "auto" | "block" | "swap" | "fallback" | "optional";
    unicodeRange?: string[];
    stretch?: string;
    featureSettings?: string;
    variationSettings?: string;
  }>;
}

type AstroFontConfig = RemoteAstroFontConfig | LocalAstroFontConfig;

// Error handling
class FontConversionError extends Error {
  constructor(
    message: string,
    public font?: InputFontConfig,
  ) {
    super(message);
    this.name = "FontConversionError";
  }
}

/**
 * Main conversion function with error handling
 * @param config - Input font configuration object
 * @returns Array of Astro font configurations
 * @throws FontConversionError if conversion fails
 */
export function convertToAstroFontConfig(
  config: InputConfig,
): AstroFontConfig[] {
  if (!config.fontFamily || !Array.isArray(config.fontFamily)) {
    throw new FontConversionError(
      "Invalid configuration: fontFamily must be an array",
    );
  }

  return config.fontFamily.map((font, index) => {
    try {
      return convertSingleFont(font);
    } catch (error) {
      throw new FontConversionError(
        `Failed to convert font at index ${index}: ${error instanceof Error ? error.message : "Unknown error"}`,
        font,
      );
    }
  });
}

/**
 * Converts a single font configuration with validation
 * @param font - Single font configuration
 * @returns Astro font configuration
 */
function convertSingleFont(font: InputFontConfig): AstroFontConfig {
  // Validate required fields
  if (!font.name) {
    throw new FontConversionError("Font name is required", font);
  }
  if (!font.cssVariable) {
    throw new FontConversionError("CSS variable is required", font);
  }
  if (!font.provider) {
    throw new FontConversionError("Font provider is required", font);
  }

  const cssVariable = normalizeCssVariable(font.cssVariable);
  const isLocal = font.provider.toLowerCase() === "local";

  if (isLocal) {
    return createLocalFontConfig(font, cssVariable);
  } else {
    return createRemoteFontConfig(font, cssVariable);
  }
}

/**
 * Creates configuration for local fonts
 */
function createLocalFontConfig(
  font: InputFontConfig,
  cssVariable: string,
): LocalAstroFontConfig {
  const variants = font.src.map((src) => {
    if (!src.path) {
      throw new FontConversionError(
        "Local fonts must have a path property in src",
        font,
      );
    }

    return {
      weight: convertWeightToNumber(src.weight) || src.weight,
      style: normalizeStyle(src.style),
      src: [src.path],
      ...(font.display && { display: font.display }),
    };
  });

  return {
    provider: "local",
    name: font.name,
    cssVariable,
    variants,
    ...(font.fallback && { fallbacks: [font.fallback] }),
    ...(font.optimizedFallbacks !== undefined && {
      optimizedFallbacks: font.optimizedFallbacks,
    }),
  };
}

/**
 * Creates configuration for remote fonts
 */
function createRemoteFontConfig(
  font: InputFontConfig,
  cssVariable: string,
): RemoteAstroFontConfig {
  const provider = getProvider(font.provider);
  const weights = extractWeights(font.src);
  const styles = extractStyles(font.src);

  const config: RemoteAstroFontConfig = {
    provider: provider as Exclude<FontProvider, "local">,
    name: font.name,
    cssVariable,
  };

  // Add optional properties only if they differ from defaults
  if (weights.length > 0 && !isDefaultWeights(weights)) {
    config.weights = weights;
  }

  if (styles.length > 0 && !isDefaultStyles(styles)) {
    config.styles = styles;
  }

  if (font.display && font.display !== "swap") {
    config.display = font.display;
  }

  if (font.fallback) {
    config.fallbacks = [font.fallback];
  }

  if (font.subsets && font.subsets.length > 0) {
    config.subsets = font.subsets;
  }

  if (font.unicodeRange && font.unicodeRange.length > 0) {
    config.unicodeRange = font.unicodeRange;
  }

  if (font.optimizedFallbacks !== undefined) {
    config.optimizedFallbacks = font.optimizedFallbacks;
  }

  return config;
}

/**
 * Normalizes CSS variable name
 */
function normalizeCssVariable(cssVar: string): string {
  if (cssVar.startsWith("--")) {
    return cssVar;
  }
  return `--${cssVar}`;
}

/**
 * Normalizes font style
 */
function normalizeStyle(style?: string): "normal" | "italic" | "oblique" {
  const normalized = (style?.toLowerCase() || "normal") as
    | "normal"
    | "italic"
    | "oblique";
  if (!["normal", "italic", "oblique"].includes(normalized)) {
    console.warn(`Invalid font style: ${style}, defaulting to 'normal'`);
    return "normal";
  }
  return normalized;
}

/**
 * Checks if weights are default
 */
function isDefaultWeights(weights: (string | number)[]): boolean {
  return weights.length === 1 && weights[0] === 400;
}

/**
 * Checks if styles are default
 */
function isDefaultStyles(styles: string[]): boolean {
  return (
    styles.length === 2 &&
    styles.includes("normal") &&
    styles.includes("italic") &&
    styles.length === 2
  );
}

/**
 * Gets the appropriate font provider with validation
 */
function getProvider(providerName: string): Exclude<FontProvider, "local"> {
  const normalizedProvider = providerName.toLowerCase().replace("-", "");

  const providerMap: Record<string, () => Exclude<FontProvider, "local">> = {
    google: fontProviders.google,
    fontsource: fontProviders.fontsource,
    bunny: fontProviders.bunny,
    fontshare: fontProviders.fontshare,
    adobe: () => fontProviders.adobe({ id: process.env.ADOBE_ID || "" }),
  };

  const providerFactory = providerMap[normalizedProvider];
  if (!providerFactory) {
    console.warn(
      `Unknown font provider: ${providerName}, defaulting to Google`,
    );
    return fontProviders.google();
  }

  return providerFactory();
}

/**
 * Extracts and deduplicates weights
 */
function extractWeights(sources: FontSrc[]): (string | number)[] {
  const weights = new Map<number, string | number>();

  sources.forEach((src) => {
    if (src.weight) {
      const numericWeight = convertWeightToNumber(src.weight);
      const key = numericWeight || parseInt(src.weight) || 400;
      weights.set(key, numericWeight || src.weight);
    }
  });

  return Array.from(weights.values()).sort((a, b) => {
    const aNum = typeof a === "number" ? a : parseInt(a as string);
    const bNum = typeof b === "number" ? b : parseInt(b as string);
    return aNum - bNum;
  });
}

/**
 * Extracts and deduplicates styles
 */
function extractStyles(
  sources: FontSrc[],
): ("normal" | "italic" | "oblique")[] {
  const styles = new Set<"normal" | "italic" | "oblique">();

  sources.forEach((src) => {
    styles.add(normalizeStyle(src.style));
  });

  return Array.from(styles);
}

/**
 * Comprehensive weight name to number conversion
 */
function convertWeightToNumber(weight: string): number | undefined {
  const weightMap: Record<string, number> = {
    thin: 100,
    hairline: 100,
    extralight: 200,
    "extra-light": 200,
    ultralight: 200,
    "ultra-light": 200,
    light: 300,
    normal: 400,
    regular: 400,
    medium: 500,
    semibold: 600,
    "semi-bold": 600,
    demibold: 600,
    "demi-bold": 600,
    bold: 700,
    extrabold: 800,
    "extra-bold": 800,
    ultrabold: 800,
    "ultra-bold": 800,
    black: 900,
    heavy: 900,
  };

  const lowerWeight = weight.toLowerCase();
  if (weightMap[lowerWeight]) {
    return weightMap[lowerWeight];
  }

  const parsed = parseInt(weight);
  if (!isNaN(parsed) && parsed >= 100 && parsed <= 900) {
    return parsed;
  }

  return undefined;
}

/**
 * Creates complete Astro configuration with fonts
 */
export function createAstroConfigWithFonts(
  inputConfig: InputConfig,
  additionalConfig?: Partial<AstroConfig>,
): AstroConfig {
  const fonts = convertToAstroFontConfig(inputConfig);

  return {
    ...additionalConfig,
    experimental: {
      ...additionalConfig?.experimental,
      fonts,
    },
  } as AstroConfig;
}

/**
 * Validates the converted configuration
 */
export function validateAstroFontConfig(config: AstroFontConfig[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  config.forEach((font, index) => {
    if (!font.name) {
      errors.push(`Font at index ${index} is missing a name`);
    }
    if (!font.cssVariable) {
      errors.push(`Font at index ${index} is missing a CSS variable`);
    }
    if (!font.cssVariable.startsWith("--")) {
      errors.push(`Font at index ${index} has invalid CSS variable format`);
    }
    if (
      font.provider === "local" &&
      (!font.variants || font.variants.length === 0)
    ) {
      errors.push(`Local font at index ${index} is missing variants`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

export async function convertFontsWithValidation(
  inputConfig: InputConfig,
): Promise<{
  config: AstroFontConfig[] | null;
  errors: string[];
}> {
  try {
    const astroFonts = convertToAstroFontConfig(inputConfig);
    const validation = validateAstroFontConfig(astroFonts);

    if (!validation.valid) {
      return {
        config: null,
        errors: validation.errors,
      };
    }

    return {
      config: astroFonts,
      errors: [],
    };
  } catch (error) {
    return {
      config: null,
      errors: [
        error instanceof Error ? error.message : "Unknown conversion error",
      ],
    };
  }
}
