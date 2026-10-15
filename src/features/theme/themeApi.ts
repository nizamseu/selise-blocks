import { themesApi, themeVersionsApi } from "../domain/api";
import type { Theme, ThemeConfig, ThemeVersion } from "../domain/types";
import { themeFromJson, themeToJson } from "./theme";

export async function getTheme(brandId: string): Promise<Theme | undefined> {
  const result = await themesApi.list({ filter: { brandId }, pageSize: 1 });
  return result.items[0];
}

export async function ensureTheme(brandId: string): Promise<Theme> {
  const existing = await getTheme(brandId);
  if (existing) return existing;
  const config = themeFromJson(undefined);
  await themesApi.create({
    accent: config.accent,
    brandId,
    cornerRoundness: config.cornerRoundness,
    draftJson: themeToJson(config),
    headingSize: config.headingSize,
    publishedJson: themeToJson(config),
    publishedAt: new Date().toISOString(),
    startingLook: config.startingLook,
    surface: config.surface,
    text: config.text
  } as Partial<Theme>);
  const created = await getTheme(brandId);
  if (!created) throw new Error("The theme could not be created.");
  return created;
}

export function draftConfig(theme: Theme | undefined): ThemeConfig {
  return themeFromJson(theme?.draftJson ?? theme?.publishedJson);
}

export function publishedConfig(theme: Theme | undefined): ThemeConfig {
  return themeFromJson(theme?.publishedJson ?? theme?.draftJson);
}

export async function saveDraft(theme: Theme, config: ThemeConfig): Promise<void> {
  await themesApi.update(theme.itemId, {
    accent: config.accent,
    cornerRoundness: config.cornerRoundness,
    draftJson: themeToJson(config),
    headingSize: config.headingSize,
    startingLook: config.startingLook,
    surface: config.surface,
    text: config.text
  });
  theme.draftJson = themeToJson(config);
}

export type PublishInput = {
  theme: Theme;
  config: ThemeConfig;
  summary: string;
  publishedBy?: string;
};

export async function publishTheme({ theme, config, summary, publishedBy }: PublishInput): Promise<void> {
  const publishedOn = new Date().toISOString();
  await themesApi.update(theme.itemId, {
    accent: config.accent,
    cornerRoundness: config.cornerRoundness,
    draftJson: themeToJson(config),
    headingSize: config.headingSize,
    publishedAt: publishedOn,
    publishedJson: themeToJson(config),
    startingLook: config.startingLook,
    surface: config.surface,
    text: config.text
  });
  theme.publishedJson = themeToJson(config);
  theme.publishedAt = publishedOn;
  await themeVersionsApi.create({
    brandId: theme.brandId,
    publishedBy,
    publishedOn,
    snapshotJson: JSON.stringify(config),
    summary
  } as Partial<ThemeVersion>);
}

export async function listVersions(brandId: string): Promise<ThemeVersion[]> {
  const result = await themeVersionsApi.list({ filter: { brandId }, pageSize: 50, sort: { publishedOn: -1 } });
  return result.items.sort((a, b) => (a.publishedOn < b.publishedOn ? 1 : -1));
}

export async function restoreVersion(theme: Theme, version: ThemeVersion): Promise<ThemeConfig> {
  const config = themeFromJson(version.snapshotJson);
  await saveDraft(theme, config);
  return config;
}

// Describes what changed between two theme configs, for a publish summary.
export function describeChange(before: ThemeConfig, after: ThemeConfig): string {
  const parts: string[] = [];
  if (before.accent !== after.accent) parts.push("Accent colour changed");
  if (before.surface !== after.surface) parts.push("Surface colour changed");
  if (before.text !== after.text) parts.push("Text colour changed");
  if (before.startingLook !== after.startingLook) parts.push("Starting look changed");
  if (before.headingSize !== after.headingSize) parts.push("Heading size changed");
  if (before.cornerRoundness !== after.cornerRoundness) parts.push("Corner roundness changed");
  for (const page of ["Home", "Listing", "Product"] as const) {
    const beforeBlocks = JSON.stringify(before.layouts[page]);
    const afterBlocks = JSON.stringify(after.layouts[page]);
    if (beforeBlocks !== afterBlocks) parts.push(`${page} layout changed`);
  }
  return parts.length ? parts.join(", ") : "Design republished";
}
