import type { Category, Product, ThemeBlock, Variant } from "../domain/types";
import { ProductTile } from "./ProductTile";

type ShopBlockProps = {
  block: ThemeBlock;
  brandName: string;
  products: Product[];
  variantsByProduct: Map<string, Variant[]>;
  categories: Category[];
  currency: string;
  labels: { soldOut: string; shopAll: string };
  onOpenProduct: (product: Product) => void;
  onOpenCategory: (category: Category) => void;
};

export function ShopBlock(props: ShopBlockProps) {
  const { block } = props;
  if (!block.shown) return null;

  switch (block.kind) {
    case "Banner":
      return (
        <section className="shop-banner">
          <h1>{block.heading || props.brandName}</h1>
        </section>
      );
    case "Text":
      return (
        <section className="shop-text">
          {block.heading ? <h2>{block.heading}</h2> : null}
          <p>Write about this brand here. Edit this block in the design studio.</p>
        </section>
      );
    case "Category strip":
      return (
        <section className="shop-strip">
          {props.categories.length ? (
            props.categories.map((category) => (
              <button key={category.itemId} className="shop-strip-item" onClick={() => props.onOpenCategory(category)}>
                {category.name}
              </button>
            ))
          ) : (
            <p className="shop-empty-inline">Nothing here yet.</p>
          )}
        </section>
      );
    case "Product grid": {
      const columns = block.columns ?? 3;
      const count = block.count ?? 8;
      const shown = props.products.slice(0, count);
      return (
        <section className={`shop-grid-block cols-${columns}`}>
          {block.heading ? <h2>{block.heading}</h2> : null}
          {shown.length === 0 ? (
            <p className="shop-empty-inline">Nothing here yet.</p>
          ) : (
            <div className={`product-grid cols-${columns}`}>
              {shown.map((product) => (
                <ProductTile
                  key={product.itemId}
                  product={product}
                  variants={props.variantsByProduct.get(product.itemId) ?? []}
                  currency={props.currency}
                  onOpen={props.onOpenProduct}
                  soldOutLabel={props.labels.soldOut}
                />
              ))}
            </div>
          )}
        </section>
      );
    }
    default:
      return null;
  }
}
