import { brandsApi, categoriesApi, ordersApi, productsApi, variantsApi } from "../domain/api";
import type { Brand, Category, Order, OrderLine, Product, Variant } from "../domain/types";
import { parseJsonArray, type VariantOption } from "../domain/types";
import { listBrandVariants } from "../catalog/catalogApi";

export async function brandBySlug(slug: string): Promise<Brand | undefined> {
  const result = await brandsApi.list({ filter: { slug }, pageSize: 1 });
  return result.items[0];
}

export async function listPublishedProducts(brandId: string): Promise<Product[]> {
  const result = await productsApi.list({ filter: { brandId, state: "Published" }, pageSize: 500 });
  return result.items;
}

export async function listShopCategories(brandId: string, products: Product[]): Promise<Category[]> {
  const result = await categoriesApi.list({ filter: { brandId }, pageSize: 100 });
  const withProducts = new Set(products.map((product) => product.categoryId).filter(Boolean) as string[]);
  return result.items.filter((category) => withProducts.has(category.itemId)).sort((a, b) => a.position - b.position);
}

export async function variantsFor(productId: string): Promise<Variant[]> {
  const result = await variantsApi.list({ filter: { productId }, pageSize: 50 });
  return result.items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export function optionLabel(options: VariantOption[]): string {
  return options.map((option) => option.value).join(" / ");
}

export function variantOptionList(variant: Variant): VariantOption[] {
  return parseJsonArray<VariantOption>(variant.optionsJson);
}

export function nextOrderReference(brandSlug: string, count: number): string {
  const prefix = brandSlug.replace(/[^a-z]/gi, "").slice(0, 2).toUpperCase() || "OD";
  return `${prefix}-${1000 + count + 1}`;
}

export async function placeOrder(input: {
  brandId: string;
  brandSlug: string;
  shopperName: string;
  shopperEmail: string;
  shopperAddress: string;
  lines: OrderLine[];
  total: number;
  language: string;
}): Promise<Order> {
  const existing = await ordersApi.list({ filter: { brandId: input.brandId }, pageSize: 500 });
  const reference = nextOrderReference(input.brandSlug, existing.totalCount);
  await ordersApi.create({
    brandId: input.brandId,
    itemsJson: JSON.stringify(input.lines),
    language: input.language,
    placedOn: new Date().toISOString(),
    reference,
    shopperAddress: input.shopperAddress,
    shopperEmail: input.shopperEmail,
    shopperName: input.shopperName,
    state: "New",
    total: input.total
  } as Partial<Order>);
  const created = await ordersApi.list({ filter: { brandId: input.brandId, reference }, pageSize: 1 });
  const order = created.items[0];
  if (!order) throw new Error("The order was placed but could not be read back.");
  return order;
}

export async function orderByReference(brandId: string, reference: string): Promise<Order | undefined> {
  const result = await ordersApi.list({ filter: { brandId, reference }, pageSize: 1 });
  return result.items[0];
}

export async function allVariantsForShop(products: Product[]): Promise<Map<string, Variant[]>> {
  const map = new Map<string, Variant[]>();
  await Promise.all(
    products.map(async (product) => {
      map.set(product.itemId, await variantsFor(product.itemId));
    })
  );
  return map;
}

export { listBrandVariants };
