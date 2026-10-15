import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { History, Save, Upload } from "lucide-react";
import { useBrand } from "../domain/BrandProvider";
import type { PageType, Theme, ThemeConfig } from "../domain/types";
import {
  describeChange, draftConfig, ensureTheme, listVersions, publishTheme, publishedConfig, restoreVersion, saveDraft
} from "./themeApi";
import { TokenEditor } from "./TokenEditor";
import { BlockEditor } from "./BlockEditor";
import { ThemePreview } from "./ThemePreview";
import { VersionHistoryPanel } from "./VersionHistoryPanel";
import { Alert } from "../../shared/ui/Alert";
import { LoadingScreen } from "../../shared/ui/LoadingScreen";
import { productsApi } from "../domain/api";
import { allVariantsForShop, listPublishedProducts, listShopCategories } from "../shopfront/shopApi";

const PAGES: PageType[] = ["Home", "Listing", "Product"];

export function ThemeStudioPage() {
  const { activeBrand, isOwner } = useBrand();
  const brandId = activeBrand?.itemId;
  const [page, setPage] = useState<PageType>("Home");
  const [config, setConfig] = useState<ThemeConfig | undefined>();
  const [published, setPublished] = useState<ThemeConfig | undefined>();
  const [message, setMessage] = useState<string | undefined>();
  const [showHistory, setShowHistory] = useState(false);

  const themeQuery = useQuery({
    enabled: Boolean(brandId),
    queryFn: () => ensureTheme(brandId as string),
    queryKey: ["theme", brandId]
  });

  const productsQuery = useQuery({
    enabled: Boolean(brandId),
    queryFn: async () => {
      const [all, publishedProducts] = await Promise.all([
        productsApi.list({ filter: { brandId }, pageSize: 500 }),
        listPublishedProducts(brandId as string)
      ]);
      const variants = await allVariantsForShop(all.items);
      const categories = await listShopCategories(brandId as string, all.items);
      return { categories, products: publishedProducts.length ? publishedProducts : all.items, variants };
    },
    queryKey: ["theme", "preview", brandId]
  });

  const versionsQuery = useQuery({
    enabled: Boolean(brandId),
    queryFn: () => listVersions(brandId as string),
    queryKey: ["theme", "versions", brandId]
  });

  useEffect(() => {
    if (!themeQuery.data) return;
    setConfig(draftConfig(themeQuery.data));
    setPublished(publishedConfig(themeQuery.data));
  }, [themeQuery.data]);

  if (themeQuery.isLoading || !activeBrand) return <LoadingScreen />;

  if (!isOwner) {
    return (
      <section>
        <header className="page-header"><div><h2>Theme Studio</h2><p>Shape your shopfront's design.</p></div></header>
        <Alert tone="warn">Only the brand owner can change the design.</Alert>
      </section>
    );
  }

  const theme = themeQuery.data as Theme;
  const preview = productsQuery.data;
  const current = config ?? draftConfig(theme);

  async function handleSave() {
    await saveDraft(theme, current);
    await themeQuery.refetch();
    setMessage("Draft saved. Shoppers still see the published design.");
  }

  async function handlePublish() {
    const summary = describeChange(published ?? current, current);
    await publishTheme({
      config: current,
      publishedBy: activeBrand?.name,
      summary,
      theme
    });
    await Promise.all([themeQuery.refetch(), versionsQuery.refetch()]);
    setPublished(current);
    setMessage(`Published. Shoppers see this design within a minute. (${summary})`);
  }

  async function handleRestore(versionId: string) {
    const version = (versionsQuery.data ?? []).find((entry) => entry.itemId === versionId);
    if (!version) return;
    const restored = await restoreVersion(theme, version);
    setConfig(restored);
    setMessage("Restored as your draft. Shoppers see no change until you publish.");
  }

  return (
    <section className="theme-studio">
      <header className="page-header">
        <div><h2>Theme Studio</h2><p>Tokens, blocks and a live preview of this brand's shopfront.</p></div>
        <div className="page-actions">
          <button className="icon-button" onClick={() => setShowHistory((value) => !value)}><History size={16} /> Versions</button>
          <button className="icon-button" onClick={handleSave}><Save size={16} /> Save draft</button>
          <button className="primary-button" onClick={handlePublish}><Upload size={16} /> Publish</button>
        </div>
      </header>

      {message ? <Alert tone="info">{message}</Alert> : null}

      <div className="studio-layout">
        <aside className="studio-tokens">
          <TokenEditor config={current} onChange={setConfig} />
        </aside>

        <div className="studio-middle">
          <div className="page-tabs">
            {PAGES.map((entry) => (
              <button key={entry} className={page === entry ? "active" : ""} onClick={() => setPage(entry)}>{entry}</button>
            ))}
          </div>
          <BlockEditor config={current} page={page} onChange={setConfig} />
        </div>

        <div className="studio-preview">
          <ThemePreview
            config={current}
            page={page}
            brandName={activeBrand.name}
            products={preview?.products ?? []}
            variantsByProduct={preview?.variants ?? new Map()}
            categories={preview?.categories ?? []}
            currency={activeBrand.currency}
          />
        </div>
      </div>

      {showHistory ? (
        <VersionHistoryPanel versions={versionsQuery.data ?? []} onRestore={handleRestore} onClose={() => setShowHistory(false)} />
      ) : null}
    </section>
  );
}
