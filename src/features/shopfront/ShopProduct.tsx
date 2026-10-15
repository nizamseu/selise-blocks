import { useMemo, useState } from "react";
import { ArrowLeft, ImageIcon, ShoppingCart } from "lucide-react";
import type { Product, ThemeConfig, Variant } from "../domain/types";
import { formatMoney } from "../domain/plan";
import { productImages } from "../catalog/catalogApi";
import { optionLabel, variantOptionList } from "./shopApi";
import { useShopLanguage } from "./ShopLanguageProvider";
import { useShopCart } from "./ShopCartProvider";

export function ShopProduct({
  product,
  variants,
  theme,
  currency,
  brandSlug,
  onBack,
  onAdded
}: {
  product: Product;
  variants: Variant[];
  theme: ThemeConfig;
  currency: string;
  brandSlug: string;
  onBack: () => void;
  onAdded: () => void;
}) {
  const { t } = useShopLanguage();
  const cart = useShopCart();
  const [selectedId, setSelectedId] = useState(() => variants[0]?.itemId ?? "");
  const [notice, setNotice] = useState<string | undefined>();
  const selected = variants.find((variant) => variant.itemId === selectedId);
  const images = productImages(product);

  const blocks = useMemo(() => theme.layouts.Product.filter((block) => block.shown), [theme]);
  const selectedLabel = selected ? optionLabel(variantOptionList(selected)) : "";

  function addToCart() {
    if (!selected) return;
    if (selected.stock <= 0) {
      setNotice(`${selectedLabel} ${t("shop.soldOut").toLowerCase()}`);
      return;
    }
    cart.add({
      image: images[0],
      productId: product.itemId,
      productSlug: product.slug,
      productTitle: product.title,
      quantity: 1,
      unitPrice: selected.price,
      variantId: selected.itemId,
      variantLabel: selectedLabel
    });
    setNotice(undefined);
    onAdded();
  }

  return (
    <div className="shop-product">
      <button className="link-button" onClick={onBack}><ArrowLeft size={16} /> {t("shop.back")}</button>
      <div className="shop-product-layout">
        <div className="shop-product-gallery">
          {images.length ? images.map((image, index) => (
            <img key={`${image}-${index}`} src={image} alt="" />
          )) : (
            <div className="shop-product-placeholder"><ImageIcon size={40} /></div>
          )}
        </div>
        <div className="shop-product-info">
          <h1>{product.title}</h1>
          {blocks.map((block) => {
            switch (block.kind) {
              case "Variant picker":
                return variants.length ? (
                  <div className="variant-picker" key={block.id}>
                    <span className="muted">{block.heading || t("shop.chooseVariant")}</span>
                    <div className="variant-choices">
                      {variants.map((variant) => {
                        const label = optionLabel(variantOptionList(variant));
                        const sold = variant.stock <= 0;
                        return (
                          <button
                            key={variant.itemId}
                            className={`variant-choice ${selectedId === variant.itemId ? "selected" : ""} ${sold ? "sold" : ""}`}
                            onClick={() => { setSelectedId(variant.itemId); setNotice(undefined); }}
                          >
                            {label || "Default"}
                            {sold ? <small>{t("shop.soldOut")}</small> : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null;
              case "Price":
                return selected ? (
                  <div className="shop-price" key={block.id}>{formatMoney(selected.price, currency)}</div>
                ) : null;
              case "Add to cart":
                return (
                  <div className="shop-add" key={block.id}>
                    <button
                      className="primary-button"
                      disabled={!selected || selected.stock <= 0}
                      onClick={addToCart}
                    >
                      <ShoppingCart size={16} /> {selected && selected.stock <= 0 ? t("shop.soldOut") : t("shop.addToCart")}
                    </button>
                    {notice ? <p className="field-error">{notice}</p> : null}
                  </div>
                );
              case "Description":
                return product.description ? (
                  <div className="shop-description" key={block.id}>
                    <h3>{block.heading || t("shop.description")}</h3>
                    <p>{product.description}</p>
                  </div>
                ) : null;
              case "Text":
                return block.heading ? <h3 key={block.id}>{block.heading}</h3> : null;
              default:
                return null;
            }
          })}
        </div>
      </div>
    </div>
  );
}
