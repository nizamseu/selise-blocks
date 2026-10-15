import { useMemo, useState } from "react";
import { LayoutGrid, List, Search } from "lucide-react";
import type { Category, Product, ThemeConfig, Variant } from "../domain/types";
import { ProductTile } from "./ProductTile";
import { useShopLanguage } from "./ShopLanguageProvider";

const PAGE_SIZE = 24;
const VIEW_KEY = "meridian:shop-listing-view";

export function ShopListing({
  brandName,
  brandSlug,
  theme,
  products,
  variantsByProduct,
  categories,
  currency,
  activeCategorySlug,
  onOpenProduct,
  onOpenCategory
}: {
  brandName: string;
  brandSlug: string;
  theme: ThemeConfig;
  products: Product[];
  variantsByProduct: Map<string, Variant[]>;
  categories: Category[];
  currency: string;
  activeCategorySlug?: string;
  onOpenProduct: (product: Product) => void;
  onOpenCategory: (slug: string) => void;
}) {
  const { t } = useShopLanguage();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"grid" | "list">(() => (localStorage.getItem(VIEW_KEY) === "list" ? "list" : "grid"));

  const activeCategory = categories.find((category) => category.slug === activeCategorySlug);
  const columns = (theme.layouts.Listing.find((block) => block.kind === "Product grid")?.columns ?? 3) as 2 | 3 | 4;

  const filtered = useMemo(() => {
    let items = activeCategory
      ? products.filter((product) => product.categoryId === activeCategory.itemId)
      : products;
    const term = search.trim().toLowerCase();
    if (term) items = items.filter((product) => product.title.toLowerCase().includes(term));
    const sorted = [...items];
    sorted.sort((a, b) => {
      if (sort === "price-low" || sort === "price-high") {
        const priceA = Math.min(...(variantsByProduct.get(a.itemId) ?? []).map((v) => v.price), Infinity);
        const priceB = Math.min(...(variantsByProduct.get(b.itemId) ?? []).map((v) => v.price), Infinity);
        return sort === "price-low" ? priceA - priceB : priceB - priceA;
      }
      return a.itemId < b.itemId ? 1 : -1;
    });
    return sorted;
  }, [activeCategory, products, search, sort, variantsByProduct]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function switchView(next: "grid" | "list") {
    localStorage.setItem(VIEW_KEY, next);
    setView(next);
  }

  return (
    <div className="shop-listing">
      <div className="shop-listing-head">
        <h1>{activeCategory?.name ?? t("shop.all")}</h1>
        <span className="muted">{filtered.length} products</span>
      </div>

      <div className="shop-listing-toolbar">
        <label className="search-field">
          <Search size={16} />
          <input placeholder={t("shop.search")} value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        </label>
        {categories.length ? (
          <select value={activeCategorySlug ?? ""} onChange={(event) => { onOpenCategory(event.target.value); setPage(1); }}>
            <option value="">{t("shop.all")}</option>
            {categories.map((category) => (
              <option key={category.itemId} value={category.slug}>{category.name}</option>
            ))}
          </select>
        ) : null}
        <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}>
          <option value="newest">{t("shop.sortNewest")}</option>
          <option value="price-low">{t("shop.sortPriceLow")}</option>
          <option value="price-high">{t("shop.sortPriceHigh")}</option>
        </select>
        <div className="view-toggle">
          <button className={view === "grid" ? "active" : ""} onClick={() => switchView("grid")} title={t("shop.gridView")}><LayoutGrid size={16} /></button>
          <button className={view === "list" ? "active" : ""} onClick={() => switchView("list")} title={t("shop.listView")}><List size={16} /></button>
        </div>
      </div>

      {pageItems.length === 0 ? (
        <p className="shop-empty-inline">{t("shop.noMatches")}</p>
      ) : (
        <div className={`product-grid cols-${columns} view-${view}`}>
          {pageItems.map((product) => (
            <ProductTile
              key={product.itemId}
              product={product}
              variants={variantsByProduct.get(product.itemId) ?? []}
              currency={currency}
              onOpen={onOpenProduct}
              soldOutLabel={t("shop.soldOut")}
            />
          ))}
        </div>
      )}

      <div className="pager">
        <button className="icon-button" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>{t("shop.back")}</button>
        <span>Page {currentPage} of {pageCount}</span>
        <button className="icon-button" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}>Next</button>
      </div>
    </div>
  );
}
