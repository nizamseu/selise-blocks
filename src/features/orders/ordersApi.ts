import { ordersApi } from "../domain/api";
import { parseJsonArray, type Order, type OrderLine, type OrderState } from "../domain/types";
import { record } from "../catalog/catalogApi";

export async function listOrders(brandId: string): Promise<Order[]> {
  const result = await ordersApi.list({ filter: { brandId }, pageSize: 200 });
  return result.items.sort((a, b) => (a.placedOn < b.placedOn ? 1 : -1));
}

export function orderLines(order: Order): OrderLine[] {
  return parseJsonArray<OrderLine>(order.itemsJson);
}

export async function setOrderState(order: Order, state: OrderState, actor: { name: string; userId?: string }): Promise<void> {
  await ordersApi.update(order.itemId, { state });
  await record(order.brandId, undefined, `changed order ${order.reference} to ${state}`, actor);
}
