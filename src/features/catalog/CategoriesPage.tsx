import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, FolderTree, Plus, Trash2 } from "lucide-react";
import { categoriesApi, productsApi } from "../domain/api";
import { useBrand } from "../domain/BrandProvider";
import { slugify } from "../domain/plan";
import { listCategories } from "./catalogApi";
import type { Category } from "../domain/types";
import { EmptyState } from "../../shared/ui/EmptyState";
import { FormField } from "../../shared/ui/FormField";
import { LoadingScreen } from "../../shared/ui/LoadingScreen";
import { Modal } from "../../shared/ui/Modal";

export function CategoriesPage() {
  const { activeBrand } = useBrand();
  const brandId = activeBrand?.itemId;
  const [adding, setAdding] = useState(false);
  const [renaming, setRenaming] = useState<Category | undefined>();
  const [name, setName] = useState("");

  const categoriesQuery = useQuery({
    enabled: Boolean(brandId),
    queryFn: () => listCategories(brandId as string),
    queryKey: ["categories", brandId]
  });
  const productsQuery = useQuery({
    enabled: Boolean(brandId),
    queryFn: () => productsApi.list({ filter: { brandId }, pageSize: 500 }),
    queryKey: ["categories", "products", brandId]
  });
  const products = productsQuery.data?.items ?? [];

  async function saveCategory(existing?: Category) {
    if (!brandId || !name.trim()) return;
    const categories = categoriesQuery.data ?? [];
    const payload = {
      brandId,
      name: name.trim(),
      position: existing?.position ?? categories.length,
      slug: slugify(name)
    };
    if (existing) await categoriesApi.update(existing.itemId, payload);
    else await categoriesApi.create(payload as Partial<Category>);
    setName("");
    setAdding(false);
    setRenaming(undefined);
    await categoriesQuery.refetch();
  }

  async function move(category: Category, direction: -1 | 1) {
    const categories = [...(categoriesQuery.data ?? [])];
    const index = categories.findIndex((entry) => entry.itemId === category.itemId);
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    [categories[index], categories[target]] = [categories[target]!, categories[index]!];
    await Promise.all(
      categories.map((entry, position) => categoriesApi.update(entry.itemId, { position }))
    );
    await categoriesQuery.refetch();
  }

  async function remove(category: Category) {
    await categoriesApi.delete(category.itemId);
    await categoriesQuery.refetch();
  }

  if (categoriesQuery.isLoading) return <LoadingScreen />;
  const categories = categoriesQuery.data ?? [];

  return (
    <section>
      <header className="page-header">
        <div><h2>Categories</h2><p>Categories make your shopfront menu. Drag-free ordering with the arrows.</p></div>
        <div className="page-actions">
          <button className="primary-button" onClick={() => { setName(""); setAdding(true); }}>
            <Plus size={18} /> Add category
          </button>
        </div>
      </header>

      {categories.length === 0 ? (
        <EmptyState
          icon={<FolderTree size={22} />}
          title="No categories yet"
          description="No categories yet. Categories make your shopfront menu."
          action={<button className="primary-button" onClick={() => setAdding(true)}>Add category</button>}
        />
      ) : (
        <div className="table-shell">
          <table>
            <thead><tr><th>Name</th><th>Position</th><th>Products</th><th className="cell-right">Actions</th></tr></thead>
            <tbody>
              {categories.map((category, index) => {
                const count = products.filter((product) => product.categoryId === category.itemId).length;
                return (
                  <tr key={category.itemId}>
                    <td><button className="link-strong" onClick={() => { setName(category.name); setRenaming(category); }}>{category.name}</button></td>
                    <td>{index + 1}</td>
                    <td>{count}</td>
                    <td className="cell-right">
                      <div className="row-actions">
                        <button className="icon-button" disabled={index === 0} onClick={() => move(category, -1)} title="Move up"><ArrowUp size={16} /></button>
                        <button className="icon-button" disabled={index === categories.length - 1} onClick={() => move(category, 1)} title="Move down"><ArrowDown size={16} /></button>
                        <button className="icon-button" onClick={() => remove(category)} title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {adding ? (
        <Modal title="Add category" onClose={() => setAdding(false)}>
          <FormField label="Name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Linen" />
          <div className="modal-actions">
            <button className="icon-button" onClick={() => setAdding(false)}>Cancel</button>
            <button className="primary-button" onClick={() => saveCategory()}>Save</button>
          </div>
        </Modal>
      ) : null}

      {renaming ? (
        <Modal title="Rename category" onClose={() => setRenaming(undefined)}>
          <FormField label="Name" value={name} onChange={(event) => setName(event.target.value)} />
          <div className="modal-actions">
            <button className="icon-button" onClick={() => setRenaming(undefined)}>Cancel</button>
            <button className="primary-button" onClick={() => saveCategory(renaming)}>Save</button>
          </div>
        </Modal>
      ) : null}
    </section>
  );
}
