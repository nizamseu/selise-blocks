import { ImageIcon } from "lucide-react";
import type { Product, Variant } from "../domain/types";
import { formatMoney } from "../domain/plan";
import { productImages } from "../catalog/catalogApi";

export function ProductTile({
  product,
  variants,
  currency,
  onOpen,
  soldOutLabel
}: {
  product: Product;
  variants: Variant[];
  currency: string;
  onOpen: (product: Product) => void;
  soldOutLabel: string;
}) {
  const image = productImages(product)[0];
  const prices = variants.map((variant) => variant.price);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const soldOut = variants.length > 0 && variants.every((variant) => variant.stock <= 0);

  return (
    <button className="product-tile" onClick={() => onOpen(product)}>
      <span className="product-tile-image">
        {image ? <img src={image} alt="" loading="lazy" /> : (
          <span className="product-tile-placeholder"><ImageIcon size={26} /></span>
        )}
        {soldOut ? <span className="product-tile-badge">{soldOutLabel}</span> : null}
      </span>
      <strong>{product.title}</strong>
      <span className="product-tile-price">{formatMoney(minPrice, currency)}</span>
    </button>
  );
}
