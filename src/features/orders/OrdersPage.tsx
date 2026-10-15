import { useQuery } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";
import { useBrand } from "../domain/BrandProvider";
import { formatDateTime, formatMoney } from "../domain/plan";
import { orderLines, listOrders, setOrderState } from "./ordersApi";
import { listBrandVariants } from "../catalog/catalogApi";
import type { OrderState } from "../domain/types";
import { EmptyState } from "../../shared/ui/EmptyState";
import { LoadingScreen } from "../../shared/ui/LoadingScreen";
import { StatusPill } from "../../shared/ui/StatusPill";

const STATES: OrderState[] = ["New", "Packed", "Fulfilled", "Cancelled"];

export function OrdersPage() {
  const { activeBrand, staffEntry } = useBrand();
  const brandId = activeBrand?.itemId;
  const actor = { name: staffEntry?.name || staffEntry?.email || "Staff", userId: staffEntry?.userId };

  const ordersQuery = useQuery({
    enabled: Boolean(brandId),
    queryFn: () => listOrders(brandId as string),
    queryKey: ["orders", brandId]
  });

  const variantsQuery = useQuery({
    enabled: Boolean(brandId),
    queryFn: () => listBrandVariants(brandId as string),
    queryKey: ["orders", "variants", brandId]
  });

  if (ordersQuery.isLoading) return <LoadingScreen />;
  if (!activeBrand) return null;
  const orders = ordersQuery.data ?? [];
  const stockByVariant = new Map((variantsQuery.data ?? []).map((variant) => [variant.itemId, variant.stock]));

  return (
    <section>
      <header className="page-header"><div><h2>Orders</h2><p>Every order placed on your shopfront, newest first.</p></div></header>

      {orders.length === 0 ? (
        <EmptyState icon={<ClipboardList size={22} />} title="No orders yet" description="No orders yet." />
      ) : (
        <div className="table-shell">
          <table>
            <thead><tr><th>Reference</th><th>Shopper</th><th>Items</th><th>Total</th><th>Placed</th><th>State</th></tr></thead>
            <tbody>
              {orders.map((order) => {
                const lines = orderLines(order);
                const shortStock = lines.some((line) =>
                  line.variantId ? (stockByVariant.get(line.variantId) ?? 0) <= 0 : false
                );
                return (
                  <tr key={order.itemId}>
                    <td>
                      <strong>{order.reference}</strong>
                      {shortStock ? <StatusPill tone="warn">Check stock</StatusPill> : null}
                    </td>
                    <td>{order.shopperName}<br /><small className="muted">{order.shopperEmail}</small></td>
                    <td>
                      <span className="muted">
                        {lines.map((line) => `${line.productTitle} · ${line.variantLabel} ×${line.quantity}`).join(", ")}
                      </span>
                    </td>
                    <td>{formatMoney(order.total, activeBrand.currency)}</td>
                    <td>{formatDateTime(order.placedOn)}</td>
                    <td>
                      <select
                        value={order.state}
                        onChange={async (event) => {
                          await setOrderState(order, event.target.value as OrderState, actor);
                          await ordersQuery.refetch();
                        }}
                      >
                        {STATES.map((state) => <option key={state} value={state}>{state}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
