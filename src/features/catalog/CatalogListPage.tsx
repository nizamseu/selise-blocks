import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import type { Product, Variant } from "../domain/types";
import { productsApi } from "../domain/api";
import { useBrand } from "../domain/BrandProvider";
import { FREE_PLAN } from "../domain/plan";
import { listBrandVariants, listCategories, productImages, record } from "./catalogApi";
import { ProductRow } from "./ProductRow";
import { EmptyState } from "../../shared/ui/EmptyState";
import { LoadingScreen } from "../../shared/ui/LoadingScreen";

const PAGE_SIZE = 25;

export function CatalogListPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { activeBrand, staffEntry } = useBrand();
  const brandId = activeBrand?.itemId;
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const productsQuery = useQuery({
    enabled: Boolean(brandId),
    queryFn: async () => {
      const [products, variants, categories] = await Promise.all([
        productsApi.list({ filter: { brandId }, pageSize: 500 }),
        listBrandVariants(brandId as string),
        listCategories(brandId as string)
      ]);
      return { categories, products: products.items, variants };
    },
    queryKey: ["catalog", brandId]
  });

  const variantsByProduct = useMemo(() => {
    const map = new Map<string, Variant[]>();
    for (const variant of productsQuery.data?.variants ?? []) {
      const list = map.get(variant.productId) ?? [];
      list.push(variant);
      map.set(variant.productId, list);
    }
    return map;
  }, [productsQuery.data]);

  const filtered = useMemo(() => {
    let items = productsQuery.data?.products ?? [];
    const term = search.trim().toLowerCase();
    if (term) {
      items = items.filter((product) => product.title.toLowerCase().includes(term));
    }
    if (stateFilter) items = items.filter((product) => product.state === stateFilter);
    if (categoryFilter) items = items.filter((product) => (product.categoryId ?? "") === categoryFilter);
    const sorted = [...items];
    sorted.sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "oldest") return a.itemId < b.itemId ? -1 : 1;
      return a.itemId < b.itemId ? 1 : -1;
    });
    return sorted;
  }, [categoryFilter, productsQuery.data, search, sort, stateFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  async function hideProduct(product: Product) {
    if (!brandId) return;
    await productsApi.update(product.itemId, { state: "Hidden" });
    await record(brandId, product.itemId, `Hid ${product.title}`, {
      name: staffEntry?.name || staffEntry?.email || "Staff",
      userId: staffEntry?.userId
    });
    await productsQuery.refetch();
  }

  if (productsQuery.isLoading) return <LoadingScreen />;
  if (!activeBrand) return null;

  const categories = productsQuery.data?.categories ?? [];
  const total = productsQuery.data?.products.length ?? 0;

  return (
    <section>
      <header className="page-header">
        <div>
          <h2>Catalog</h2>
          <p>{filtered.length} product{filtered.length === 1 ? "" : "s"}{stateFilter || categoryFilter || search ? " matching" : ""} · free plan holds {FREE_PLAN.products}</p>
        </div>
        <div className="page-actions">
          <button className="primary-button" onClick={() => onNavigate("/app/catalog/new")}>
            <Plus size={18} /> Add product
          </button>
        </div>
      </header>

      <div className="catalog-toolbar">
        <label className="search-field">
          <Search size={16} />
          <input
            placeholder="Search products"
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(1); }}
          />
        </label>
        <select value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); setPage(1); }}>
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.itemId} value={category.itemId}>{category.name}</option>
          ))}
        </select>
        <select value={stateFilter} onChange={(event) => { setStateFilter(event.target.value); setPage(1); }}>
          <option value="">All states</option>
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
          <option value="Hidden">Hidden</option>
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="title">Title A–Z</option>
        </select>
      </div>

      {total === 0 ? (
        <EmptyState
          icon={<Plus size={22} />}
          title="No products yet"
          description="No products yet. Add your first one."
          action={<button className="primary-button" onClick={() => onNavigate("/app/catalog/new")}>Add product</button>}
        />
      ) : pageItems.length === 0 ? (
        <EmptyState icon={<Search size={22} />} title="Nothing matches" description="No products match these filters." />
      ) : (
        <>
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Product</th><th>Category</th><th>State</th><th>Variants</th><th>Stock</th><th className="cell-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((product) => (
                  <ProductRow
                    key={product.itemId}
                    product={product}
                    category={categories.find((category) => category.itemId === product.categoryId)?.name}
                    variants={variantsByProduct.get(product.itemId) ?? []}
                    image={productImages(product)[0]}
                    onOpen={() => onNavigate(`/app/catalog/${product.itemId}`)}
                    onHide={() => hideProduct(product)}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div className="pager">
            <button className="icon-button" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Previous</button>
            <span>Page {currentPage} of {pageCount}</span>
            <button className="icon-button" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}>Next</button>
          </div>
        </>
      )}
    </section>
  );
}
