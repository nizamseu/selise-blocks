import { useQuery } from "@tanstack/react-query";
import { Boxes, ClipboardList, ExternalLink, Globe, Store, Users } from "lucide-react";
import { useBrand } from "../domain/BrandProvider";
import { ordersApi, productsApi, staffApi } from "../domain/api";
import { FREE_PLAN } from "../domain/plan";
import { LoadingScreen } from "../../shared/ui/LoadingScreen";

export function DashboardPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { activeBrand, brands, isOwner, isDeactivated, isLoading: brandLoading } = useBrand();
  const brandId = activeBrand?.itemId;

  const products = useQuery({
    enabled: Boolean(brandId),
    queryFn: () => productsApi.list({ filter: { brandId }, pageSize: 1 }),
    queryKey: ["dashboard", "products", brandId]
  });
  const orders = useQuery({
    enabled: Boolean(brandId),
    queryFn: () => ordersApi.list({ filter: { brandId }, pageSize: 1 }),
    queryKey: ["dashboard", "orders", brandId]
  });
  const staff = useQuery({
    enabled: Boolean(brandId),
    queryFn: () => staffApi.list({ filter: { brandId }, pageSize: 100 }),
    queryKey: ["dashboard", "staff", brandId]
  });

  if (brandLoading) return <LoadingScreen />;

  if (isDeactivated) {
    return (
      <section>
        <header className="page-header"><div><h2>Access turned off</h2><p>Your access was turned off.</p></div></header>
        <p className="muted">An owner of this brand turned your access off. Your past changes stay in the brand's history.</p>
      </section>
    );
  }

  if (!activeBrand) {
    return (
      <section>
        <header className="page-header"><div><h2>Welcome to Meridian</h2><p>You don't have a brand yet. Create one to open your shopfront.</p></div></header>
        <button className="primary-button" onClick={() => onNavigate("/app/setup")}>Create a brand</button>
      </section>
    );
  }

  const staffCount = staff.data?.totalCount ?? 0;

  return (
    <section>
      <header className="page-header">
        <div>
          <h2>{activeBrand.name}</h2>
          <p>Everything for this brand, in one place.</p>
        </div>
        <div className="page-actions">
          <button className="icon-button" onClick={() => onNavigate("/app/catalog/new")}>Add product</button>
        </div>
      </header>

      {isOwner ? (
        <div className="trial-banner">
          <span>Free plan — {FREE_PLAN.brands} brand, {FREE_PLAN.products} products, {FREE_PLAN.staffSeats} staff seats.</span>
          <button className="link-button" onClick={() => onNavigate("/app/branding")}>See plans</button>
        </div>
      ) : null}

      <div className="metrics">
        <button className="metric metric-button" onClick={() => onNavigate("/app/catalog")}>
          <span><Boxes size={14} /> Products</span>
          <strong>{products.data?.totalCount ?? 0}</strong>
          <small>across all states</small>
        </button>
        <button className="metric metric-button" onClick={() => onNavigate("/app/orders")}>
          <span><ClipboardList size={14} /> Orders</span>
          <strong>{orders.data?.totalCount ?? 0}</strong>
          <small>placed by shoppers</small>
        </button>
        <button className="metric metric-button" onClick={() => onNavigate("/app/staff")}>
          <span><Users size={14} /> Staff seats</span>
          <strong>{staffCount} of {FREE_PLAN.staffSeats}</strong>
          <small>on the free plan</small>
        </button>
        <div className="metric">
          <span><Globe size={14} /> Shopfront</span>
          <strong className="metric-address">{activeBrand.slug}</strong>
          <small>
            <button className="link-button" onClick={() => onNavigate(`/shop/${activeBrand.slug}`)}>
              Open shopfront <ExternalLink size={12} />
            </button>
          </small>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title"><Store /> Your brand</div>
        <div className="dashboard-grid">
          <div><span className="muted">Shopfront address</span><strong>/{activeBrand.slug}</strong></div>
          <div><span className="muted">Custom domain</span><strong>{activeBrand.customDomain || "Not set"}</strong></div>
          <div><span className="muted">Currency</span><strong>{activeBrand.currency}</strong></div>
          <div><span className="muted">State</span><strong>{activeBrand.state}</strong></div>
        </div>
        {brands.length > 1 ? (
          <p className="muted">You run {brands.length} brands. Switch between them from the top of the sidebar.</p>
        ) : null}
      </div>
    </section>
  );
}
