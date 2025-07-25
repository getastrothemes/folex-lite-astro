// For Astro Font
type GlobalValues = "inherit" | "initial" | "revert" | "revert-layer" | "unset";
interface Source {
  path?: string;
  preload?: boolean;
  css?: Record<string, string>;
  style:
    | "normal"
    | "italic"
    | "oblique"
    | `oblique ${number}deg`
    | GlobalValues
    | (string & {});
  weight?:
    | "normal"
    | "bold"
    | "lighter"
    | "bolder"
    | GlobalValues
    | 100
    | 200
    | 300
    | 400
    | 500
    | 600
    | 700
    | 800
    | 900
    | "100"
    | "200"
    | "300"
    | "400"
    | "500"
    | "600"
    | "700"
    | "800"
    | "900"
    | (string & {})
    | (number & {});
}
interface FontConfig {
  name: string;
  src: Source[];
  fetch?: boolean;
  verbose?: boolean;
  selector?: string;
  preload?: boolean;
  cacheDir?: string;
  basePath?: string;
  fallbackName?: string;
  googleFontsURL?: string;
  cssVariable?: string | boolean;
  fallback: "serif" | "sans-serif" | "monospace";
  display: "auto" | "block" | "swap" | "fallback" | "optional" | (string & {});
}

export type Button = {
  enable: boolean;
  label: string;
  url: string;
  rel?: string;
  target?: string;
};

export type Section = {
  enable?: boolean;
  title?: string;
  excerpt?: string;
  date?: Date | string;
  author?: string;
  subtitle?: string;
  categories?: string[];
  description?: string;
  button?: Button;
  image?: string;
  limit?: false | number;
};

export type SocialLink = {
  enable: boolean;
  label: string;
  icon: string;
  url: string;
};

export interface Badge {
  enable: boolean;
  label: string;
  color: "primary" | "success" | "danger" | "warning" | string;
  type: "dot" | "text";
}

export interface ChildNavigationLink {
  enable: boolean;
  name: string;
  url?: string;
  rel?: string;
  target?: string;
  hasChildren?: boolean;
  badge?: Badge;
  children?: ChildNavigationLink[];
}

export interface NavigationLink extends ChildNavigationLink {
  enable: boolean;
  hasMegaMenu?: boolean;
  testimonial?: Testimonial;
  services?: Service;
  menus?: NavigationLink[];
}
