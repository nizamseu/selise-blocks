import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { shopText, type ShopperLanguage } from "./shopperDictionary";

type ShopLanguageValue = {
  language: ShopperLanguage;
  setLanguage: (language: ShopperLanguage) => void;
  t: (key: Parameters<typeof shopText>[1]) => string;
};

const ShopLanguageContext = createContext<ShopLanguageValue | undefined>(undefined);

export function ShopLanguageProvider({ brandId, children }: { brandId: string; children: ReactNode }) {
  const storageKey = `meridian:shop-language:${brandId}`;
  const [language, setLanguageState] = useState<ShopperLanguage>(() => {
    const stored = localStorage.getItem(storageKey);
    return stored === "de" || stored === "fr" || stored === "en" ? stored : "en";
  });

  function setLanguage(next: ShopperLanguage) {
    localStorage.setItem(storageKey, next);
    setLanguageState(next);
  }

  const value = useMemo<ShopLanguageValue>(() => ({
    language,
    setLanguage,
    t: (key) => shopText(language, key)
  }), [language]);

  return <ShopLanguageContext.Provider value={value}>{children}</ShopLanguageContext.Provider>;
}

export function useShopLanguage(): ShopLanguageValue {
  const context = useContext(ShopLanguageContext);
  if (!context) throw new Error("useShopLanguage must be used within ShopLanguageProvider");
  return context;
}
