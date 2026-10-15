import type { OrderLine } from "../domain/types";

export type CartLine = {
  productId: string;
  productTitle: string;
  productSlug: string;
  variantId: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
  image?: string;
};

const cartKey = (brandId: string) => `meridian:cart:${brandId}`;

export function readCart(brandId: string): CartLine[] {
  try {
    const raw = localStorage.getItem(cartKey(brandId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as CartLine[]) : [];
  } catch {
    return [];
  }
}

export function writeCart(brandId: string, lines: CartLine[]): void {
  localStorage.setItem(cartKey(brandId), JSON.stringify(lines));
}

export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
}

export function toOrderLines(lines: CartLine[]): OrderLine[] {
  return lines.map((line) => ({
    productTitle: line.productTitle,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    variantId: line.variantId,
    variantLabel: line.variantLabel
  }));
}
