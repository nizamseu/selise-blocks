import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, Eye, History } from "lucide-react";
import { useBrand } from "../domain/BrandProvider";
import { productsApi } from "../domain/api";
import type { Product, ProductState, Variant } from "../domain/types";
import { slugify, FREE_PLAN } from "../domain/plan";
import {
  createProduct, emptyProductDraft, listCategories, listHistory, listProductVariants,
  logProductChanges, parseVariantOptions, productImages, saveVariants
} from "./catalogApi";
import type { ProductDraft } from "./catalogApi";
import { ImageManager } from "./ImageManager";
import { VariantEditor } from "./VariantEditor";
import { Alert } from "../../shared/ui/Alert";
import { FormField } from "../../shared/ui/FormField";
import { LoadingScreen } from "../../shared/ui/LoadingScreen";
import { SelectField, TextAreaField } from "../../shared/ui/Select";

type Props = { productId: string; onNavigate: (path: string) => void };

export function ProductDetailPage({ productId, onNavigate }: Props) {
  const { activeBrand, staffEntry } = useBrand();
  const brandId = activeBrand?.itemId;
  const isNew = productId === "new";
  const actor = { name: staffEntry?.name || staffEntry?.email || "Staff", userId: staffEntry?.userId };

  const [draft, setDraft] = useState<ProductDraft>(emptyProductDraft);
  const [existing, setExisting] = useState<Product | undefined>();
  const [existingVariants, setExistingVariants] = useState<Variant[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [saved, setSaved] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  const categoriesQuery = useQuery({
    enabled: Boolean(brandId),
    queryFn: () => listCategories(brandId as string),
    queryKey: ["categories", brandId]
  });

  const productQuery = useQuery({
    enabled: Boolean(brandId) && !isNew,
    queryFn: async () => {
      const product = await productsApi.get(productId);
      if (!product) throw new Error("This product could not be found.");
      const variants = await listProductVariants(productId);
      return { product, variants };
    },
    queryKey: ["product", productId]
  });

  useEffect(() => {
    if (!productQuery.data) return;
    const { product, variants } = productQuery.data;
    setExisting(product);
    setExistingVariants(variants);
    setDraft({
      categoryId: product.categoryId ?? "",
      description: product.description ?? "",
      images: productImages(product),
      state: product.state,
      title: product.title,
      variants: variants.length
        ? variants.map((variant) => ({
            options: parseVariantOptions(variant),
            price: String(variant.price),
            stock: String(variant.stock)
          }))
        : emptyProductDraft().variants
    });
  }, [productQuery.data]);

  const historyQuery = useQuery({
    enabled: Boolean(brandId) && !isNew,
    queryFn: () => listHistory(brandId as string, productId),
    queryKey: ["history", brandId, productId]
  });

  const categories = categoriesQuery.data ?? [];
  const images = draft.images;

  async function persist(state: ProductState) {
    if (!brandId) return;
    setError(undefined);
    setSaved(undefined);
    if (!draft.title.trim()) {
      setError("Give the product a title before saving.");
      return;
    }
    const missingPrice = draft.variants.some((variant) => variant.price.trim() === "");
    if (missingPrice) {
      setError("Add a price before saving.");
      return;
    }
    setBusy(true);
    try {
      if (isNew) {
        const existing = await productsApi.list({ filter: { brandId }, pageSize: 1 });
        if (existing.totalCount >= FREE_PLAN.products) {
          setError(`The free plan holds ${FREE_PLAN.products} products.`);
          setBusy(false);
          return;
        }
        const product = await createProduct(brandId, { ...draft, state }, slugify(draft.title), actor);
        onNavigate(`/app/catalog/${product.itemId}`);
        return;
      }
      const before = existing as Product;
      await productsApi.update(productId, {
        categoryId: draft.categoryId || undefined,
        description: draft.description,
        imagesJson: JSON.stringify(images),
        publishedAt: state === "Published" && before.state !== "Published" ? new Date().toISOString() : before.publishedAt,
        state,
        title: draft.title
      });
      await saveVariants(brandId, productId, draft.variants, existingVariants);
      await logProductChanges(before, { ...draft, state }, existingVariants, actor, brandId, productId);
      await productQuery.refetch();
      await historyQuery.refetch();
      setSaved("Saved.");
    } catch (caught) {
      setError((caught as Error).message || "The product could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  if (productQuery.isLoading || categoriesQuery.isLoading) return <LoadingScreen />;
  if (!activeBrand) return null;

  return (
    <section>
      <header className="page-header">
        <div>
          <button className="link-button" onClick={() => onNavigate("/app/catalog")}><ArrowLeft size={16} /> Back to catalog</button>
          <h2>{isNew ? "Add product" : "Product detail"}</h2>
          <p>{isNew ? "Add a product to your catalog." : "Edit this product, its variants and its history."}</p>
        </div>
        <div className="page-actions">
          <button className="icon-button" disabled={busy} onClick={() => persist("Draft")}>{busy ? "Saving…" : "Save"}</button>
          {draft.state !== "Published" ? (
            <button className="primary-button" disabled={busy} onClick={() => persist("Published")}><Eye size={16} /> Publish</button>
          ) : (
            <button className="icon-button" disabled={busy} onClick={() => persist("Hidden")}>Hide</button>
          )}
        </div>
      </header>

      {error ? <Alert tone="error">{error}</Alert> : null}
      {saved ? <Alert tone="info">{saved}</Alert> : null}
      {existing?.state === "Hidden" ? <Alert tone="warn">This product is Hidden. Shoppers see "This product isn't available." until you publish it again.</Alert> : null}

      <div className="product-layout">
        <div className="product-main">
          <div className="panel">
            <FormField label="Title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Linen shirt" />
            <TextAreaField label="Description" rows={4} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
            <SelectField
              label="Category"
              value={draft.categoryId}
              onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })}
              options={[{ label: "Uncategorised", value: "" }, ...categories.map((category) => ({ label: category.name, value: category.itemId }))]}
            />
            <SelectField
              label="State"
              value={draft.state}
              onChange={(event) => setDraft({ ...draft, state: event.target.value as ProductState })}
              options={[
                { label: "Draft", value: "Draft" },
                { label: "Published", value: "Published" },
                { label: "Hidden", value: "Hidden" }
              ]}
            />
          </div>

          <div className="panel">
            <div className="panel-title">Images</div>
            <ImageManager images={images} onChange={(next) => setDraft({ ...draft, images: next })} />
          </div>

          <div className="panel">
            <div className="panel-title">Variants</div>
            <VariantEditor variants={draft.variants} onChange={(variants) => setDraft({ ...draft, variants })} />
          </div>
        </div>

        <aside className="product-side">
          <div className="panel">
            <div className="panel-title"><History size={16} /> History</div>
            {isNew ? (
              <p className="muted">History appears once the product is saved.</p>
            ) : (historyQuery.data ?? []).length === 0 ? (
              <p className="muted">No changes yet.</p>
            ) : (
              <ul className="history-list">
                {(historyQuery.data ?? []).map((entry) => (
                  <li key={entry.itemId}>
                    <Clock size={14} />
                    <div>
                      <strong>{entry.actorName}</strong> {entry.whatChanged}
                      <small className="muted">{new Date(entry.when).toLocaleString()}</small>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

