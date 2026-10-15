export type BrandState = "Live" | "Suspended";
export type DomainState = "Waiting for DNS" | "Connected";
export type ProductState = "Draft" | "Published" | "Hidden";
export type StaffRole = "Brand owner" | "Brand editor";
export type StaffState = "Invited" | "Active" | "Deactivated";
export type OrderState = "New" | "Packed" | "Fulfilled" | "Cancelled";
export type BlockKind =
  | "Banner"
  | "Product grid"
  | "Category strip"
  | "Text"
  | "Price"
  | "Variant picker"
  | "Add to cart"
  | "Description";
export type PageType = "Home" | "Listing" | "Product";
export type HeadingSize = "Compact" | "Regular" | "Large";
export type CornerRoundness = "Square" | "Soft" | "Round";
export type StartingLook = "Editorial" | "Boutique" | "Minimal" | "Market";

export type Brand = {
  itemId: string;
  name: string;
  slug: string;
  customDomain?: string;
  domainState?: DomainState;
  currency: string;
  state: BrandState;
  ownerUserId: string;
  ownerEmail?: string;
  createdOn: string;
};

export type Staff = {
  itemId: string;
  brandId: string;
  userId?: string;
  email: string;
  name?: string;
  role: StaffRole;
  state: StaffState;
  language?: string;
  invitedOn: string;
  lastSignedIn?: string;
};

export type Category = {
  itemId: string;
  brandId: string;
  name: string;
  slug: string;
  position: number;
};

export type Variant = {
  itemId: string;
  brandId: string;
  productId: string;
  optionsJson?: string;
  price: number;
  stock: number;
  sortOrder?: number;
};

export type VariantOption = { label: string; value: string };

export type Product = {
  itemId: string;
  brandId: string;
  title: string;
  slug: string;
  description?: string;
  categoryId?: string;
  imagesJson?: string;
  state: ProductState;
  publishedAt?: string;
  createdBy?: string;
};

export type ThemeLayouts = Record<PageType, ThemeBlock[]>;

export type ThemeBlock = {
  id: string;
  kind: BlockKind;
  heading?: string;
  count?: number;
  columns?: 2 | 3 | 4;
  shown: boolean;
};

export type Theme = {
  itemId: string;
  brandId: string;
  startingLook: StartingLook;
  accent: string;
  surface: string;
  text: string;
  headingSize: HeadingSize;
  cornerRoundness: CornerRoundness;
  draftJson: string;
  publishedJson?: string;
  publishedAt?: string;
};

export type ThemeConfig = {
  startingLook: StartingLook;
  accent: string;
  surface: string;
  text: string;
  headingSize: HeadingSize;
  cornerRoundness: CornerRoundness;
  layouts: ThemeLayouts;
};

export type ThemeVersion = {
  itemId: string;
  brandId: string;
  publishedOn: string;
  summary: string;
  publishedBy?: string;
  snapshotJson: string;
};

export type OrderLine = {
  productTitle: string;
  variantLabel: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  itemId: string;
  brandId: string;
  reference: string;
  shopperName: string;
  shopperEmail: string;
  shopperAddress: string;
  itemsJson: string;
  total: number;
  state: OrderState;
  language?: string;
  placedOn: string;
};

export type HistoryEntry = {
  itemId: string;
  brandId: string;
  productId?: string;
  whatChanged: string;
  actorName: string;
  actorUserId?: string;
  when: string;
};

export function parseJsonArray<T>(value: string | undefined): T[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}
