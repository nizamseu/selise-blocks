import { CheckCircle2 } from "lucide-react";
import type { Order } from "../domain/types";
import { formatMoney } from "../domain/plan";
import { orderLines } from "../orders/ordersApi";
import { useShopLanguage } from "./ShopLanguageProvider";

export function ShopOrderPlaced({ order, currency, onNavigate, brandSlug }: { order: Order; currency: string; onNavigate: (path: string) => void; brandSlug: string }) {
  const { t } = useShopLanguage();
  const lines = orderLines(order);

  return (
    <div className="shop-order-placed">
      <CheckCircle2 size={42} className="order-check" />
      <h1>{t("shop.orderPlaced")}</h1>
      <p className="muted">{t("shop.orderReference")}: <strong>{order.reference}</strong></p>
      <ul className="order-summary">
        {lines.map((line, index) => (
          <li key={index}>
            <span>{line.productTitle} · {line.variantLabel} ×{line.quantity}</span>
            <span>{formatMoney(line.unitPrice * line.quantity, currency)}</span>
          </li>
        ))}
      </ul>
      <div className="cart-total"><span>{t("shop.total")}</span><strong>{formatMoney(order.total, currency)}</strong></div>
      <button className="primary-button" onClick={() => onNavigate(`/shop/${brandSlug}`)}>{t("shop.back")}</button>
    </div>
  );
}
