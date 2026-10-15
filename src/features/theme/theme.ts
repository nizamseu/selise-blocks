import type { HeadingSize, ThemeBlock, ThemeConfig, ThemeLayouts, CornerRoundness, StartingLook, PageType } from "../domain/types";

export const HEADING_SCALES: Record<HeadingSize, number> = {
  Compact: 0.9,
  Regular: 1,
  Large: 1.15
};

export const ROUNDNESS: Record<CornerRoundness, string> = {
  Square: "0px",
  Soft: "8px",
  Round: "16px"
};

export const STARTING_LOOKS: { value: StartingLook; accent: string; surface: string; text: string }[] = [
  { value: "Editorial", accent: "#1f2937", surface: "#ffffff", text: "#111827" },
  { value: "Boutique", accent: "#b45309", surface: "#fffbf5", text: "#3f2d1b" },
  { value: "Minimal", accent: "#0f766e", surface: "#ffffff", text: "#1f2937" },
  { value: "Market", accent: "#be123c", surface: "#fff7f8", text: "#27272a" }
];

export function block(kind: ThemeBlock["kind"], overrides: Partial<ThemeBlock> = {}): ThemeBlock {
  return {
    id: `${kind.toLowerCase().replace(/\s+/g, "-")}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    shown: true,
    ...overrides
  };
}

export function defaultLayouts(): ThemeLayouts {
  return {
    Home: [
      block("Banner", { heading: "Welcome to our shop" }),
      block("Category strip"),
      block("Product grid", { heading: "Featured products", count: 8, columns: 3 })
    ],
    Listing: [block("Product grid", { heading: "Products", count: 24, columns: 3 })],
    Product: [
      block("Variant picker"),
      block("Price"),
      block("Add to cart"),
      block("Description")
    ]
  };
}

export function defaultTheme(): ThemeConfig {
  const base = STARTING_LOOKS[0]!;
  return {
    accent: base.accent,
    cornerRoundness: "Soft",
    headingSize: "Regular",
    layouts: defaultLayouts(),
    startingLook: "Editorial",
    surface: base.surface,
    text: base.text
  };
}

export function themeFromJson(json: string | undefined): ThemeConfig {
  if (!json) return defaultTheme();
  try {
    const parsed = JSON.parse(json) as Partial<ThemeConfig>;
    const base = defaultTheme();
    return {
      accent: parsed.accent ?? base.accent,
      cornerRoundness: parsed.cornerRoundness ?? base.cornerRoundness,
      headingSize: parsed.headingSize ?? base.headingSize,
      layouts: { ...base.layouts, ...(parsed.layouts ?? {}) },
      startingLook: parsed.startingLook ?? base.startingLook,
      surface: parsed.surface ?? base.surface,
      text: parsed.text ?? base.text
    };
  } catch {
    return defaultTheme();
  }
}

export function themeToJson(config: ThemeConfig): string {
  return JSON.stringify(config);
}

export function themeStyleVars(config: ThemeConfig): Record<string, string> {
  return {
    "--meridian-accent": config.accent,
    "--meridian-surface": config.surface,
    "--meridian-text": config.text,
    "--meridian-radius": ROUNDNESS[config.cornerRoundness],
    "--meridian-heading-scale": String(HEADING_SCALES[config.headingSize])
  };
}

// Named presets fill one page's block list. Applying a preset never mutates
// the preset itself -- it clones fresh blocks into the draft.
export const LAYOUT_PRESETS: { name: string; page: PageType; description: string; blocks: () => ThemeBlock[] }[] = [
  {
    blocks: () => [
      block("Banner", { heading: "Stories from the workshop" }),
      block("Text", { heading: "About us" }),
      block("Product grid", { heading: "Our picks", count: 6, columns: 3 })
    ],
    description: "A large banner, a text block and a product grid.",
    name: "Editorial home",
    page: "Home"
  },
  {
    blocks: () => [
      block("Category strip"),
      block("Product grid", { heading: "Everything in store", count: 12, columns: 4 })
    ],
    description: "Category strip over a four-column grid.",
    name: "Market home",
    page: "Home"
  },
  {
    blocks: () => [
      block("Banner", { heading: "New in" }),
      block("Product grid", { heading: "Newest", count: 8, columns: 2 })
    ],
    description: "A banner over a two-column grid.",
    name: "Boutique home",
    page: "Home"
  },
  {
    blocks: () => [block("Product grid", { heading: "Products", count: 24, columns: 3 })],
    description: "A single three-column grid.",
    name: "Grid listing",
    page: "Listing"
  },
  {
    blocks: () => [
      block("Product grid", { heading: "Products", count: 24, columns: 2 }),
      block("Text", { heading: "Need help?" })
    ],
    description: "A two-column grid with a helper note.",
    name: "Room listing",
    page: "Listing"
  },
  {
    blocks: () => [
      block("Variant picker"),
      block("Price"),
      block("Add to cart"),
      block("Description")
    ],
    description: "The full purchase flow, in order.",
    name: "Standard product",
    page: "Product"
  },
  {
    blocks: () => [
      block("Variant picker"),
      block("Add to cart"),
      block("Price"),
      block("Description"),
      block("Text", { heading: "Delivery & returns" })
    ],
    description: "Purchase flow with a delivery note.",
    name: "Detailed product",
    page: "Product"
  }
];
