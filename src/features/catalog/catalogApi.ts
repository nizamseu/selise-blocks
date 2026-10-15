import { categoriesApi, historyApi, productsApi, variantsApi } from "../domain/api";
import { parseJsonArray, type Category, type HistoryEntry, type Product, type ProductState, type Variant, type VariantOption } from "../domain/types";

export type VariantDraft = {
  options: VariantOption[];
  price: string;
  stock: string;
};

export type ProductDraft = {
  title: string;
  description: string;
  categoryId: string;
  state: ProductState;
  images: string[];
  variants: VariantDraft[];
};

export function emptyVariant(): VariantDraft {
  return { options: [{ label: "Size", value: "Small" }, { label: "Colour", value: "Blue" }], price: "", stock: "0" };
}

export function emptyProductDraft(): ProductDraft {
  return { categoryId: "", description: "", images: [], state: "Draft", title: "", variants: [emptyVariant()] };
}

export function variantLabel(options: VariantOption[]): string {
  return options.map((option) => option.value).filter(Boolean).join(" / ");
}

export async function listProductVariants(productId: string): Promise<Variant[]> {
  const result = await variantsApi.list({ filter: { productId }, pageSize: 100, sort: { sortOrder: 1 } });
  return result.items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export async function listBrandVariants(brandId: string): Promise<Variant[]> {
  const result = await variantsApi.list({ filter: { brandId }, pageSize: 500 });
  return result.items;
}

export function productImages(product: Product): string[] {
  return parseJsonArray<string>(product.imagesJson);
}

export async function createProduct(
  brandId: string,
  draft: ProductDraft,
  slug: string,
  actor: { name: string; userId?: string }
): Promise<Product> {
  await productsApi.create({
    brandId,
    categoryId: draft.categoryId || undefined,
    createdBy: actor.userId,
    description: draft.description,
    imagesJson: JSON.stringify(draft.images),
    publishedAt: draft.state === "Published" ? new Date().toISOString() : undefined,
    slug,
    state: draft.state,
    title: draft.title
  } as Partial<Product>);

  const created = await productsApi.list({ filter: { brandId, slug }, pageSize: 1 });
  const product = created.items[0];
  if (!product) throw new Error("The product was saved but could not be read back.");

  await saveVariants(brandId, product.itemId, draft.variants);
  await record(brandId, product.itemId, `Created ${draft.title}`, actor);
  return product;
}

export async function saveVariants(brandId: string, productId: string, variants: VariantDraft[], existing?: Variant[]): Promise<void> {
  const keptIds = new Set<string>();
  for (let index = 0; index < variants.length; index += 1) {
    const variant = variants[index];
    if (!variant) continue;
    const payload = {
      brandId,
      optionsJson: JSON.stringify(variant.options.filter((option) => option.value)),
      price: Number(variant.price) || 0,
      productId,
      sortOrder: index,
      stock: Math.max(0, Math.floor(Number(variant.stock) || 0))
    };
    const match = existing?.[index];
    if (match) {
      keptIds.add(match.itemId);
      await variantsApi.update(match.itemId, payload as Partial<Variant>);
    } else {
      await variantsApi.create(payload as Partial<Variant>);
    }
  }
  if (existing) {
    for (const variant of existing) {
      if (!keptIds.has(variant.itemId)) await variantsApi.delete(variant.itemId);
    }
  }
}

export async function record(brandId: string, productId: string | undefined, whatChanged: string, actor: { name: string; userId?: string }): Promise<void> {
  await historyApi.create({
    actorName: actor.name || "Unknown",
    actorUserId: actor.userId,
    brandId,
    productId,
    whatChanged,
    when: new Date().toISOString()
  } as Partial<HistoryEntry>);
}

export async function listHistory(brandId: string, productId: string): Promise<HistoryEntry[]> {
  const result = await historyApi.list({ filter: { brandId, productId }, pageSize: 50, sort: { when: -1 } });
  return result.items.sort((a, b) => (a.when < b.when ? 1 : -1));
}

export async function listCategories(brandId: string): Promise<Category[]> {
  const result = await categoriesApi.list({ filter: { brandId }, pageSize: 100 });
  return result.items.sort((a, b) => a.position - b.position);
}

export function stockTotal(variants: Variant[]): number {
  return variants.reduce((sum, variant) => sum + (variant.stock ?? 0), 0);
}

export function variantOptions(variant: Variant): VariantOption[] {
  return parseJsonArray<VariantOption>(variant.optionsJson);
}

export function parseVariantOptions(variant: Variant): VariantOption[] {
  const parsed = parseJsonArray<VariantOption>(variant.optionsJson);
  return parsed.length ? parsed : [{ label: "Option", value: "" }];
}

// Writes one history entry per meaningful change to a product, naming the
// person who made it. Kept here so the detail page stays presentational.
export async function logProductChanges(
  before: Product,
  after: ProductDraft,
  previousVariants: Variant[],
  actor: { name: string; userId?: string },
  brandId: string,
  productId: string
): Promise<void> {
  if (before.title !== after.title) {
    await record(brandId, productId, `renamed the product from ${before.title} to ${after.title}`, actor);
  }
  if (before.state !== after.state) {
    await record(brandId, productId, `changed the state from ${before.state} to ${after.state}`, actor);
  }
  for (let index = 0; index < after.variants.length; index += 1) {
    const previous = previousVariants[index];
    const next = after.variants[index];
    if (!next) continue;
    const label = variantLabel(next.options) || `Variant ${index + 1}`;
    if (previous && Number(previous.price) !== Number(next.price)) {
      await record(brandId, productId, `raised the price of ${label} from ${previous.price} to ${next.price}`, actor);
    }
    if (previous && Number(previous.stock) !== Number(next.stock)) {
      await record(brandId, productId, `changed stock of ${label} from ${previous.stock} to ${next.stock}`, actor);
    }
  }
}
