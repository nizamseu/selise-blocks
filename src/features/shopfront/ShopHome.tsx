import type { Category, Product, ThemeConfig, Variant } from "../domain/types";
import { ShopBlock } from "./ShopBlock";
import { useShopLanguage } from "./ShopLanguageProvider";

export function ShopHome({
  brandName,
  theme,
  products,
  variantsByProduct,
  categories,
  currency,
  onOpenProduct,
  onOpenCategory
}: {
  brandName: string;
  theme: ThemeConfig;
  products: Product[];
  variantsByProduct: Map<string, Variant[]>;
  categories: Category[];
  currency: string;
  onOpenProduct: (product: Product) => void;
  onOpenCategory: (category: Category) => void;
}) {
  const { t } = useShopLanguage();
  const blocks = theme.layouts.Home.filter((block) => block.shown);

  if (products.length === 0) {
    return (
      <div className="shop-empty">
        <h1>{brandName}</h1>
        <p>{t("shop.empty")}</p>
      </div>
    );
  }

  return (
    <div className="shop-home">
      {blocks.map((block) => (
        <ShopBlock
          key={block.id}
          block={block}
          brandName={brandName}
          products={products}
          variantsByProduct={variantsByProduct}
          categories={categories}
          currency={currency}
          labels={{ soldOut: t("shop.soldOut"), shopAll: t("shop.all") }}
          onOpenProduct={onOpenProduct}
          onOpenCategory={onOpenCategory}
        />
      ))}
    </div>
  );
}
