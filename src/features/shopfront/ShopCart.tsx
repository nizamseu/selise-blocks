import { Minus, Plus, Trash2 } from "lucide-react";
import { formatMoney } from "../domain/plan";
import { useShopLanguage } from "./ShopLanguageProvider";
import { useShopCart } from "./ShopCartProvider";

export function ShopCart({ currency, brandSlug, onNavigate }: { currency: string; brandSlug: string; onNavigate: (path: string) => void }) {
  const { t } = useShopLanguage();
  const cart = useShopCart();

  if (cart.lines.length === 0) {
    return (
      <div className="shop-empty">
        <h1>{t("shop.yourCart")}</h1>
        <p>{t("shop.cartEmpty")}</p>
        <button className="primary-button" onClick={() => onNavigate(`/shop/${brandSlug}`)}>{t("shop.back")}</button>
      </div>
    );
  }

  return (
    <div className="shop-cart">
      <h1>{t("shop.yourCart")}</h1>
      <ul className="cart-lines">
        {cart.lines.map((line) => (
          <li key={line.variantId} className="cart-line">
            <span className="cart-line-image">
              {line.image ? <img src={line.image} alt="" /> : null}
            </span>
            <div className="cart-line-info">
              <strong>{line.productTitle}</strong>
              <small className="muted">{line.variantLabel}</small>
              <span>{formatMoney(line.unitPrice, currency)}</span>
            </div>
            <div className="cart-qty">
              <button className="icon-button" onClick={() => cart.setQuantity(line.variantId, line.quantity - 1)}><Minus size={14} /></button>
              <span>{line.quantity}</span>
              <button className="icon-button" onClick={() => cart.setQuantity(line.variantId, line.quantity + 1)}><Plus size={14} /></button>
            </div>
            <button className="icon-button" onClick={() => cart.remove(line.variantId)} title={t("shop.remove")}><Trash2 size={16} /></button>
          </li>
        ))}
      </ul>
      <div className="cart-total">
        <span>{t("shop.total")}</span>
        <strong>{formatMoney(cart.total, currency)}</strong>
      </div>
      <button className="primary-button" onClick={() => onNavigate(`/shop/${brandSlug}/checkout`)}>{t("shop.checkout")}</button>
    </div>
  );
}
