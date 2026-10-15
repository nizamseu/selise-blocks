import { collection } from "../../lib/blocks/data";
import type {
  Brand,
  Category,
  HistoryEntry,
  Order,
  Product,
  Staff,
  Theme,
  ThemeVersion,
  Variant
} from "./types";

export const brandsApi = collection<Brand>("Brand", [
  "name", "slug", "customDomain", "domainState", "currency", "state", "ownerUserId", "ownerEmail", "createdOn"
]);
export const staffApi = collection<Staff>("Staff", [
  "brandId", "userId", "email", "name", "role", "state", "language", "invitedOn", "lastSignedIn"
]);
export const categoriesApi = collection<Category>("Category", ["brandId", "name", "slug", "position"]);
export const productsApi = collection<Product>("Product", [
  "brandId", "title", "slug", "description", "categoryId", "imagesJson", "state", "publishedAt", "createdBy"
]);
export const variantsApi = collection<Variant>("Variant", [
  "brandId", "productId", "optionsJson", "price", "stock", "sortOrder"
]);
export const themesApi = collection<Theme>("Theme", [
  "brandId", "startingLook", "accent", "surface", "text", "headingSize", "cornerRoundness",
  "draftJson", "publishedJson", "publishedAt"
]);
export const themeVersionsApi = collection<ThemeVersion>("ThemeVersion", [
  "brandId", "publishedOn", "summary", "publishedBy", "snapshotJson"
]);
export const ordersApi = collection<Order>("Order", [
  "brandId", "reference", "shopperName", "shopperEmail", "shopperAddress", "itemsJson", "total",
  "state", "language", "placedOn"
]);
export const historyApi = collection<HistoryEntry>("HistoryEntry", [
  "brandId", "productId", "whatChanged", "actorName", "actorUserId", "when"
]);
