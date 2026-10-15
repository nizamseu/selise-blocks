import { useState } from "react";
import type { Brand, Order } from "../domain/types";
import { useShopLanguage } from "./ShopLanguageProvider";
import { useShopCart } from "./ShopCartProvider";
import { toOrderLines } from "./cart";
import { placeOrder } from "./shopApi";
import { variantsApi } from "../domain/api";
import { staffApi } from "../domain/api";
import { formatMoney } from "../domain/plan";
import { FormField } from "../../shared/ui/FormField";
import { TextAreaField } from "../../shared/ui/Select";
import { blocksClient } from "../../lib/blocks/client";

export function ShopCheckout({
  brand,
  onPlaced
}: {
  brand: Brand;
  onPlaced: (order: Order) => void;
}) {
  const { t, language } = useShopLanguage();
  const cart = useShopCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(undefined);
    if (!name.trim() || !email.trim() || !address.trim()) {
      setError("Fill in your name, email and address to order.");
      return;
    }
    if (cart.lines.length === 0) {
      setError(t("shop.cartEmpty"));
      return;
    }
    setBusy(true);
    try {
      // Claim stock variant by variant. The first shopper to claim a variant
      // wins; a later one sees the exact variant that ran out.
      for (const line of cart.lines) {
        const variant = await variantsApi.get(line.variantId);
        if (!variant || (variant.stock ?? 0) < line.quantity) {
          setError(`${line.variantLabel} ${t("shop.justSoldOut")}`);
          setBusy(false);
          return;
        }
      }
      for (const line of cart.lines) {
        const variant = await variantsApi.get(line.variantId);
        if (!variant) continue;
        await variantsApi.update(line.variantId, { stock: Math.max(0, (variant.stock ?? 0) - line.quantity) });
      }

      const order = await placeOrder({
        brandId: brand.itemId,
        brandSlug: brand.slug,
        language,
        lines: toOrderLines(cart.lines),
        shopperAddress: address.trim(),
        shopperEmail: email.trim(),
        shopperName: name.trim(),
        total: cart.total
      });

      await notifyStaff(brand, order);
      await confirmToShopper(brand, order);
      cart.clear();
      onPlaced(order);
    } catch (caught) {
      setError((caught as Error).message || "The order could not be placed. Try again.");
      setBusy(false);
    }
  }

  return (
    <div className="shop-checkout">
      <h1>{t("shop.checkout")}</h1>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={submit}>
          {error ? <p className="field-error">{error}</p> : null}
          <FormField label={t("shop.name")} value={name} onChange={(event) => setName(event.target.value)} />
          <FormField label={t("shop.email")} type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <TextAreaField label={t("shop.address")} rows={3} value={address} onChange={(event) => setAddress(event.target.value)} />
          <p className="checkout-note">{t("shop.noPayment")}</p>
          <button className="primary-button" type="submit" disabled={busy}>
            {busy ? "…" : t("shop.placeOrder")}
          </button>
        </form>
        <aside className="checkout-summary">
          <h3>{t("shop.yourCart")}</h3>
          <ul>
            {cart.lines.map((line) => (
              <li key={line.variantId}>
                <span>{line.productTitle} · {line.variantLabel} ×{line.quantity}</span>
                <span>{formatMoney(line.unitPrice * line.quantity, brand.currency)}</span>
              </li>
            ))}
          </ul>
          <div className="cart-total"><span>{t("shop.total")}</span><strong>{formatMoney(cart.total, brand.currency)}</strong></div>
        </aside>
      </div>
    </div>
  );
}

// Tells the brand's staff an order came in: one email each in their language,
// plus an in-app alert for the owner.
async function notifyStaff(brand: Brand, order: Order): Promise<void> {
  const message = `New order — ${order.shopperName} placed ${order.reference} (${formatMoney(order.total, brand.currency)}).`;
  const staff = await staffApi.list({ filter: { brandId: brand.itemId }, pageSize: 100 });
  const recipients = staff.items
    .filter((entry) => entry.state !== "Deactivated" && entry.email)
    .map((entry) => ({ email: entry.email, language: entry.language ?? "en" }));

  for (const recipient of recipients) {
    await blocksClient.mail
      .send({
        bodyDataContext: { brandName: brand.name, orderReference: order.reference, shopperName: order.shopperName },
        language: recipient.language,
        subjectDataContext: { brandName: brand.name },
        to: [recipient.email]
      })
      .catch(() => undefined);
  }

  await blocksClient.notifier
    .notify({
      denormalizedPayload: message,
      subscriptionFilters: [{ actionName: "created", context: "orders", value: order.reference }],
      userIds: brand.ownerUserId ? [brand.ownerUserId] : undefined
    })
    .catch(() => undefined);
}

// One confirmation to the shopper, written in the language they shopped in.
async function confirmToShopper(brand: Brand, order: Order): Promise<void> {
  await blocksClient.mail
    .send({
      bodyDataContext: { brandName: brand.name, orderReference: order.reference, shopperName: order.shopperName },
      language: order.language ?? "en",
      subjectDataContext: { brandName: brand.name },
      to: [order.shopperEmail]
    })
    .catch(() => undefined);
}
