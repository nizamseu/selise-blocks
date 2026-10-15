import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../app/providers/AuthProvider";
import { useCurrentUser } from "../profile/useCurrentUser";
import { brandsApi, staffApi } from "./api";
import type { Brand, Staff, StaffRole } from "./types";

const ACTIVE_BRAND_KEY = "meridian:active-brand";

type BrandContextValue = {
  brands: Brand[];
  activeBrand: Brand | undefined;
  staffEntry: Staff | undefined;
  role: StaffRole | undefined;
  isOwner: boolean;
  isDeactivated: boolean;
  isLoading: boolean;
  setActiveBrand: (brandId: string) => void;
  refetch: () => Promise<unknown>;
};

const BrandContext = createContext<BrandContextValue | undefined>(undefined);

export function BrandProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const me = useCurrentUser();
  const myUserId = me.data?.data?.itemId;
  const myEmail = me.data?.data?.email;
  const [activeId, setActiveId] = useState(() => sessionStorage.getItem(ACTIVE_BRAND_KEY) ?? "");

  const staffQuery = useQuery({
    enabled: status === "authenticated" && Boolean(myUserId || myEmail),
    queryFn: async () => {
      const filters = [myUserId ? { userId: myUserId } : undefined, myEmail ? { email: myEmail } : undefined]
        .filter(Boolean) as Record<string, unknown>[];
      const results = await Promise.all(filters.map((filter) => staffApi.list({ filter, pageSize: 100 })));
      const map = new Map<string, Staff>();
      for (const result of results) {
        for (const entry of result.items) map.set(entry.itemId, entry);
      }
      return [...map.values()];
    },
    queryKey: ["staff", "mine", myUserId, myEmail]
  });

  const myStaff = staffQuery.data ?? [];
  const activeStaff = useMemo(() => myStaff.filter((entry) => entry.state !== "Deactivated"), [myStaff]);
  const isDeactivated = myStaff.length > 0 && activeStaff.length === 0;

  const brandIds = useMemo(() => activeStaff.map((entry) => entry.brandId), [activeStaff]);

  const brandsQuery = useQuery({
    enabled: brandIds.length > 0,
    queryFn: async () => {
      const results = await Promise.all(
        brandIds.map((brandId) => brandsApi.list({ filter: { ItemId: brandId }, pageSize: 1 }))
      );
      const merged = new Map<string, Brand>();
      for (const result of results) for (const brand of result.items) merged.set(brand.itemId, brand);
      return [...merged.values()];
    },
    queryKey: ["brands", "mine", brandIds.join(",")]
  });

  const brands = brandsQuery.data ?? [];

  useEffect(() => {
    if (!brands.length) return;
    const exists = brands.some((brand) => brand.itemId === activeId);
    if (!exists) {
      const stored = sessionStorage.getItem(ACTIVE_BRAND_KEY) ?? "";
      setActiveId(brands.some((brand) => brand.itemId === stored) ? stored : (brands[0]?.itemId ?? ""));
    }
  }, [activeId, brands]);

  const setActiveBrand = useCallback((brandId: string) => {
    sessionStorage.setItem(ACTIVE_BRAND_KEY, brandId);
    setActiveId(brandId);
  }, []);

  const activeBrand = brands.find((brand) => brand.itemId === activeId);
  const staffEntry = activeStaff.find((entry) => entry.brandId === activeBrand?.itemId);
  const role = staffEntry?.role;

  const value = useMemo<BrandContextValue>(() => ({
    activeBrand,
    brands,
    isDeactivated,
    isLoading: staffQuery.isLoading || brandsQuery.isLoading || me.isLoading,
    isOwner: role === "Brand owner",
    refetch: async () => {
      await Promise.all([staffQuery.refetch(), brandsQuery.refetch()]);
    },
    role,
    setActiveBrand,
    staffEntry
  }), [activeBrand, brands, brandsQuery.isLoading, isDeactivated, me.isLoading, role, setActiveBrand, staffEntry, staffQuery]);

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

export function useBrand(): BrandContextValue {
  const context = useContext(BrandContext);
  if (!context) throw new Error("useBrand must be used within BrandProvider");
  return context;
}
