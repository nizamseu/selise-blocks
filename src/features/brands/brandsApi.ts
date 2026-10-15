import { brandsApi, staffApi, themesApi } from "../domain/api";
import { slugify } from "../domain/plan";
import { defaultTheme, themeToJson } from "../theme/theme";
import type { Brand, StaffRole } from "../domain/types";
import type { BlocksUser } from "@seliseblocks/client";

export type CreateBrandInput = {
  name: string;
  owner: BlocksUser;
  startingLook?: string;
};

export async function brandNameTaken(name: string, exceptItemId?: string): Promise<boolean> {
  const slug = slugify(name);
  const result = await brandsApi.list({ filter: { slug }, pageSize: 5 });
  return result.items.some((brand) => brand.itemId !== exceptItemId);
}

export async function createBrand({ name, owner, startingLook = "Editorial" }: CreateBrandInput): Promise<Brand> {
  const slug = slugify(name);
  const userId = owner.itemId ?? "";
  const ownerName = [owner.firstName, owner.lastName].filter(Boolean).join(" ").trim();
  const createdOn = new Date().toISOString();

  await brandsApi.create({
    currency: "EUR",
    createdOn,
    domainState: "Waiting for DNS",
    name,
    ownerEmail: owner.email ?? "",
    ownerUserId: userId,
    slug,
    state: "Live"
  } as Partial<Brand>);

  const created = await brandsApi.list({ filter: { slug }, pageSize: 1 });
  const brand = created.items[0];
  if (!brand) throw new Error("The brand was created but could not be read back.");

  await staffApi.create({
    brandId: brand.itemId,
    email: owner.email ?? "",
    invitedOn: createdOn,
    language: "en",
    name: ownerName || owner.email || "",
    role: "Brand owner",
    state: "Active",
    userId
  });

  const theme = defaultTheme();
  theme.startingLook = startingLook as typeof theme.startingLook;
  await themesApi.create({
    accent: theme.accent,
    brandId: brand.itemId,
    cornerRoundness: theme.cornerRoundness,
    draftJson: themeToJson(theme),
    headingSize: theme.headingSize,
    publishedJson: themeToJson(theme),
    publishedAt: createdOn,
    startingLook: theme.startingLook,
    surface: theme.surface,
    text: theme.text
  });

  return brand;
}

export async function updateBrand(itemId: string, payload: Partial<Brand>): Promise<void> {
  await brandsApi.update(itemId, payload);
}

export function ownerRoleLabel(role: StaffRole): string {
  return role;
}
