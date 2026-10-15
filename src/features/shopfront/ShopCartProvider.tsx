import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { cartTotal, readCart, writeCart, type CartLine } from "./cart";

type ShopCartValue = {
  lines: CartLine[];
  total: number;
  add: (line: CartLine) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  count: number;
};

const ShopCartContext = createContext<ShopCartValue | undefined>(undefined);

export function ShopCartProvider({ brandId, children }: { brandId: string; children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => readCart(brandId));

  const persist = useCallback((next: CartLine[]) => {
    writeCart(brandId, next);
    setLines(next);
  }, [brandId]);

  const value = useMemo<ShopCartValue>(() => ({
    add: (line) => {
      const existing = lines.find((entry) => entry.variantId === line.variantId);
      if (existing) {
        persist(lines.map((entry) =>
          entry.variantId === line.variantId ? { ...entry, quantity: entry.quantity + line.quantity } : entry
        ));
      } else {
        persist([...lines, line]);
      }
    },
    clear: () => persist([]),
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    lines,
    remove: (variantId) => persist(lines.filter((entry) => entry.variantId !== variantId)),
    setQuantity: (variantId, quantity) => {
      if (quantity <= 0) {
        persist(lines.filter((entry) => entry.variantId !== variantId));
        return;
      }
      persist(lines.map((entry) => (entry.variantId === variantId ? { ...entry, quantity } : entry)));
    },
    total: cartTotal(lines)
  }), [lines, persist]);

  return <ShopCartContext.Provider value={value}>{children}</ShopCartContext.Provider>;
}

export function useShopCart(): ShopCartValue {
  const context = useContext(ShopCartContext);
  if (!context) throw new Error("useShopCart must be used within ShopCartProvider");
  return context;
}
