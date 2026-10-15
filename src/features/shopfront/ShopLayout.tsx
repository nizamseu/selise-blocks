import type { ReactNode } from "react";
import { ShoppingCart } from "lucide-react";
import { SHOPPER_LANGUAGE_NAMES, type ShopperLanguage } from "./shopperDictionary";
import { useShopLanguage } from "./ShopLanguageProvider";
import { useShopCart } from "./ShopCartProvider";

export function ShopLayout({
  brandName,
  brandSlug,
  categories,
  onNavigate,
  children
}: {
  brandName: string;
  brandSlug: string;
  categories: { itemId: string; name: string; slug: string }[];
  onNavigate: (path: string) => void;
  children: ReactNode;
}) {
  const { language, setLanguage } = useShopLanguage();
  const cart = useShopCart();

  return (
    <div className="shopfront">
      <header className="shop-header">
        <button className="shop-brand" onClick={() => onNavigate(`/shop/${brandSlug}`)}>{brandName}</button>
        <nav className="shop-nav">
          <button onClick={() => onNavigate(`/shop/${brandSlug}`)}>Home</button>
          {categories.slice(0, 6).map((category) => (
            <button key={category.itemId} onClick={() => onNavigate(`/shop/${brandSlug}/c/${category.slug}`)}>
              {category.name}
            </button>
          ))}
        </nav>
        <div className="shop-header-actions">
          <select
            className="shop-lang"
            aria-label="Language"
            value={language}
            onChange={(event) => setLanguage(event.target.value as ShopperLanguage)}
          >
            {(["en", "de", "fr"] as ShopperLanguage[]).map((code) => (
              <option key={code} value={code}>{SHOPPER_LANGUAGE_NAMES[code]}</option>
            ))}
          </select>
          <button className="shop-cart-button" onClick={() => onNavigate(`/shop/${brandSlug}/cart`)}>
            <ShoppingCart size={18} />
            {cart.count > 0 ? <span className="shop-cart-count">{cart.count}</span> : null}
          </button>
        </div>
      </header>
      <main className="shop-main">{children}</main>
      <footer className="shop-footer">
        <span>{brandName}</span>
      </footer>
    </div>
  );
}
