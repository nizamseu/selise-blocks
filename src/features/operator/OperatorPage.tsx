import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ShieldCheck } from "lucide-react";
import { brandsApi } from "../domain/api";
import { useCurrentUser } from "../profile/useCurrentUser";
import { formatDate } from "../domain/plan";
import { updateBrand } from "../brands/brandsApi";
import type { Brand } from "../domain/types";
import { Alert } from "../../shared/ui/Alert";
import { EmptyState } from "../../shared/ui/EmptyState";
import { LoadingScreen } from "../../shared/ui/LoadingScreen";
import { StatusPill } from "../../shared/ui/StatusPill";

const OPERATOR_ROLES = ["clouduser", "admin", "superadmin", "platform-operator"];

export function OperatorPage() {
  const me = useCurrentUser();
  const [search, setSearch] = useState("");
  const roles = (me.data?.data?.roles ?? []).map((role) => role.toLowerCase());
  const isOperator = roles.some((role) => OPERATOR_ROLES.includes(role));

  const brandsQuery = useQuery({
    enabled: isOperator,
    queryFn: () => brandsApi.list({ pageSize: 200 }),
    queryKey: ["operator", "brands"]
  });

  const filtered = useMemo(() => {
    const items = brandsQuery.data?.items ?? [];
    const term = search.trim().toLowerCase();
    return term ? items.filter((brand) => brand.name.toLowerCase().includes(term)) : items;
  }, [brandsQuery.data, search]);

  if (me.isLoading) return <LoadingScreen />;

  if (!isOperator) {
    return (
      <section>
        <header className="page-header"><div><h2>Platform brands</h2><p>Operator tools for looking after brands.</p></div></header>
        <Alert tone="warn">This area is for the platform operator. Your account doesn't hold an operator role.</Alert>
      </section>
    );
  }

  async function setState(brand: Brand, state: Brand["state"]) {
    await updateBrand(brand.itemId, { state });
    await brandsQuery.refetch();
  }

  return (
    <section>
      <header className="page-header">
        <div><h2>Platform brands</h2><p>Every brand on the platform, live or suspended.</p></div>
      </header>

      <div className="catalog-toolbar">
        <label className="search-field">
          <Search size={16} />
          <input placeholder="Search brands" value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
      </div>

      {brandsQuery.isLoading ? <LoadingScreen /> : filtered.length === 0 ? (
        <EmptyState icon={<ShieldCheck size={22} />} title="No brands" description="No brands match that search." />
      ) : (
        <div className="table-shell">
          <table>
            <thead><tr><th>Brand</th><th>Address</th><th>State</th><th>Created</th><th className="cell-right">Actions</th></tr></thead>
            <tbody>
              {filtered.map((brand) => (
                <tr key={brand.itemId}>
                  <td><strong>{brand.name}</strong></td>
                  <td>/{brand.slug}</td>
                  <td><StatusPill tone={brand.state === "Live" ? "good" : "warn"}>{brand.state}</StatusPill></td>
                  <td>{formatDate(brand.createdOn)}</td>
                  <td className="cell-right">
                    {brand.state === "Live" ? (
                      <button className="icon-button" onClick={() => setState(brand, "Suspended")}>Suspend</button>
                    ) : (
                      <button className="icon-button" onClick={() => setState(brand, "Live")}>Resume</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
