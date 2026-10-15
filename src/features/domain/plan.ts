export const FREE_PLAN = {
  name: "Free",
  brands: 1,
  products: 100,
  staffSeats: 2,
  priceLabel: "€0 / month"
} as const;

export const PAID_PLAN_EXTRAS = [
  "Unlimited brands",
  "Unlimited products",
  "Unlimited staff seats",
  "Custom domain",
  "Priority support"
] as const;

export const SHOPPER_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "de", name: "Deutsch" },
  { code: "fr", name: "Français" }
] as const;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function formatMoney(amount: number, currency: string): string {
  const symbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : currency === "GBP" ? "£" : "";
  const value = Number.isFinite(amount) ? amount : 0;
  return symbol ? `${symbol}${value.toFixed(2)}` : `${value.toFixed(2)} ${currency}`;
}

export function formatDate(value: string | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(value: string | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
