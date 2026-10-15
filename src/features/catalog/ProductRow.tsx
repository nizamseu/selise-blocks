import { EyeOff, ImageIcon, Pencil } from "lucide-react";
import type { Product, Variant } from "../domain/types";
import { formatMoney } from "../domain/plan";
import { stockTotal, variantOptions } from "./catalogApi";
import { StatusPill } from "../../shared/ui/StatusPill";

export function ProductRow({
  product,
  category,
  variants,
  image,
  onOpen,
  onHide
}: {
  product: Product;
  category?: string;
  variants: Variant[];
  image?: string;
  onOpen: () => void;
  onHide: () => void;
}) {
  const tone = product.state === "Published" ? "good" : product.state === "Hidden" ? "warn" : "neutral";
  const first = variants[0];

  return (
    <tr>
      <td>
        <div className="product-cell">
          <span className="product-thumb">
            {image ? <img src={image} alt="" /> : <ImageIcon size={18} />}
          </span>
          <div>
            <button className="link-strong" onClick={onOpen}>{product.title}</button>
            <small className="muted">
              {first ? `From ${formatMoney(first.price, "EUR")}` : "No price yet"}
            </small>
          </div>
        </div>
      </td>
      <td>{category ?? <span className="muted">Uncategorised</span>}</td>
      <td><StatusPill tone={tone}>{product.state}</StatusPill></td>
      <td>{variants.length === 1 ? formatVariant(variants[0]) : `${variants.length} variants`}</td>
      <td>{stockTotal(variants)}</td>
      <td className="cell-right">
        <div className="row-actions">
          <button className="icon-button" title="Edit" onClick={onOpen}><Pencil size={16} /></button>
          {product.state !== "Hidden" ? (
            <button className="icon-button" title="Hide" onClick={onHide}><EyeOff size={16} /></button>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

function formatVariant(variant: Variant | undefined): string {
  if (!variant) return "—";
  const label = variantOptions(variant).map((option) => option.value).join(" / ") || "Default";
  return `${label} · ${variant.stock} in stock`;
}
