import { useState } from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import type { Category, PageType, Product, ThemeConfig, Variant } from "../domain/types";
import { themeStyleVars } from "./theme";
import { ShopBlock } from "../shopfront/ShopBlock";
import { ProductTile } from "../shopfront/ProductTile";

type Device = "desktop" | "tablet" | "phone";

const WIDTHS: Record<Device, number> = { desktop: 1100, phone: 390, tablet: 768 };

export function ThemePreview({
  config,
  page,
  brandName,
  products,
  variantsByProduct,
  categories,
  currency
}: {
  config: ThemeConfig;
  page: PageType;
  brandName: string;
  products: Product[];
  variantsByProduct: Map<string, Variant[]>;
  categories: Category[];
  currency: string;
}) {
  const [device, setDevice] = useState<Device>("desktop");
  const blocks = config.layouts[page].filter((entry) => entry.shown);

  return (
    <div className="theme-preview">
      <div className="device-toggle">
        <button className={device === "phone" ? "active" : ""} onClick={() => setDevice("phone")} title="Phone"><Smartphone size={16} /></button>
        <button className={device === "tablet" ? "active" : ""} onClick={() => setDevice("tablet")} title="Tablet"><Tablet size={16} /></button>
        <button className={device === "desktop" ? "active" : ""} onClick={() => setDevice("desktop")} title="Desktop"><Monitor size={16} /></button>
      </div>
      <div className="preview-frame" style={{ width: WIDTHS[device] }}>
        <div className="preview-inner" style={themeStyleVars(config) as React.CSSProperties}>
          <header className="preview-header">
            <strong>{brandName}</strong>
            <span className="preview-nav">{categories.slice(0, 4).map((category) => category.name).join(" · ")}</span>
          </header>
          {page === "Product" ? (
            <PreviewProduct blocks={blocks} products={products} variantsByProduct={variantsByProduct} currency={currency} />
          ) : (
            blocks.map((entry) => (
              <ShopBlock
                key={entry.id}
                block={entry}
                brandName={brandName}
                products={products}
                variantsByProduct={variantsByProduct}
                categories={categories}
                currency={currency}
                labels={{ soldOut: "Sold out", shopAll: "All" }}
                onOpenProduct={() => undefined}
                onOpenCategory={() => undefined}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewProduct({
  blocks,
  products,
  variantsByProduct,
  currency
}: {
  blocks: ThemeConfig["layouts"]["Product"];
  products: Product[];
  variantsByProduct: Map<string, Variant[]>;
  currency: string;
}) {
  const product = products[0];
  return (
    <div className="preview-product">
      <ProductTile
        product={product ?? ({ itemId: "preview", title: "Your first product", slug: "preview" } as Product)}
        variants={product ? variantsByProduct.get(product.itemId) ?? [] : []}
        currency={currency}
        onOpen={() => undefined}
        soldOutLabel="Sold out"
      />
      <div className="preview-product-info">
        {blocks.map((block) => {
          if (block.kind === "Price") return <p className="preview-price" key={block.id}>{currency === "EUR" ? "€" : ""}49.00</p>;
          if (block.kind === "Variant picker") return <p key={block.id} className="preview-chip">Small / Blue</p>;
          if (block.kind === "Add to cart") return <p key={block.id} className="preview-button">Add to cart</p>;
          if (block.kind === "Description") return <p key={block.id} className="muted">Product description appears here.</p>;
          if (block.heading) return <h3 key={block.id}>{block.heading}</h3>;
          return null;
        })}
      </div>
    </div>
  );
}
