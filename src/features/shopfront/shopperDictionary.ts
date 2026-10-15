export type ShopperLanguage = "en" | "de" | "fr";

export const SHOPPER_LANGUAGE_NAMES: Record<ShopperLanguage, string> = {
  de: "Deutsch",
  en: "English",
  fr: "Français"
};

type ShopCopy = {
  "shop.all": string;
  "shop.search": string;
  "shop.cart": string;
  "shop.empty": string;
  "shop.soldOut": string;
  "shop.addToCart": string;
  "shop.noPayment": string;
  "shop.checkout": string;
  "shop.yourCart": string;
  "shop.cartEmpty": string;
  "shop.total": string;
  "shop.quantity": string;
  "shop.remove": string;
  "shop.name": string;
  "shop.email": string;
  "shop.address": string;
  "shop.placeOrder": string;
  "shop.orderPlaced": string;
  "shop.orderReference": string;
  "shop.justSoldOut": string;
  "shop.notAvailable": string;
  "shop.shopNotAvailable": string;
  "shop.description": string;
  "shop.back": string;
  "shop.price": string;
  "shop.chooseVariant": string;
  "shop.gridView": string;
  "shop.listView": string;
  "shop.sortNewest": string;
  "shop.sortPriceLow": string;
  "shop.sortPriceHigh": string;
  "shop.noMatches": string;
};

export const SHOPPER_COPY: Record<ShopperLanguage, ShopCopy> = {
  en: {
    "shop.addToCart": "Add to cart",
    "shop.address": "Address",
    "shop.all": "All products",
    "shop.back": "Back",
    "shop.cart": "Cart",
    "shop.cartEmpty": "Your cart is empty.",
    "shop.checkout": "Checkout",
    "shop.chooseVariant": "Choose an option",
    "shop.description": "Description",
    "shop.email": "Email",
    "shop.empty": "Nothing here yet.",
    "shop.gridView": "Grid",
    "shop.justSoldOut": "just sold out.",
    "shop.listView": "List",
    "shop.name": "Name",
    "shop.noMatches": "No products match these filters.",
    "shop.noPayment": "No payment is taken on this shop — you'll be contacted to arrange it.",
    "shop.notAvailable": "This product isn't available.",
    "shop.orderPlaced": "Order placed",
    "shop.orderReference": "Order reference",
    "shop.placeOrder": "Place order",
    "shop.price": "Price",
    "shop.quantity": "Quantity",
    "shop.remove": "Remove",
    "shop.search": "Search this shop",
    "shop.shopNotAvailable": "This shop is not available.",
    "shop.soldOut": "Sold out",
    "shop.sortNewest": "Newest",
    "shop.sortPriceHigh": "Price high to low",
    "shop.sortPriceLow": "Price low to high",
    "shop.total": "Total",
    "shop.yourCart": "Your cart"
  },
  de: {
    "shop.addToCart": "In den Warenkorb",
    "shop.address": "Adresse",
    "shop.all": "Alle Produkte",
    "shop.back": "Zurück",
    "shop.cart": "Warenkorb",
    "shop.cartEmpty": "Ihr Warenkorb ist leer.",
    "shop.checkout": "Zur Kasse",
    "shop.chooseVariant": "Option wählen",
    "shop.description": "Beschreibung",
    "shop.email": "E-Mail",
    "shop.empty": "Hier ist noch nichts.",
    "shop.gridView": "Raster",
    "shop.justSoldOut": "ist gerade ausverkauft.",
    "shop.listView": "Liste",
    "shop.name": "Name",
    "shop.noMatches": "Keine Produkte entsprechen diesen Filtern.",
    "shop.noPayment": "In diesem Shop wird nicht bezahlt — wir melden uns, um alles zu regeln.",
    "shop.notAvailable": "Dieses Produkt ist nicht verfügbar.",
    "shop.orderPlaced": "Bestellung aufgegeben",
    "shop.orderReference": "Bestellnummer",
    "shop.placeOrder": "Bestellung aufgeben",
    "shop.price": "Preis",
    "shop.quantity": "Menge",
    "shop.remove": "Entfernen",
    "shop.search": "Diesen Shop durchsuchen",
    "shop.shopNotAvailable": "Dieser Shop ist nicht verfügbar.",
    "shop.soldOut": "Ausverkauft",
    "shop.sortNewest": "Neueste",
    "shop.sortPriceHigh": "Preis absteigend",
    "shop.sortPriceLow": "Preis aufsteigend",
    "shop.total": "Gesamt",
    "shop.yourCart": "Ihr Warenkorb"
  },
  fr: {
    "shop.addToCart": "Ajouter au panier",
    "shop.address": "Adresse",
    "shop.all": "Tous les produits",
    "shop.back": "Retour",
    "shop.cart": "Panier",
    "shop.cartEmpty": "Votre panier est vide.",
    "shop.checkout": "Commander",
    "shop.chooseVariant": "Choisir une option",
    "shop.description": "Description",
    "shop.email": "E-mail",
    "shop.empty": "Rien ici pour l'instant.",
    "shop.gridView": "Grille",
    "shop.justSoldOut": "vient d'être épuisé.",
    "shop.listView": "Liste",
    "shop.name": "Nom",
    "shop.noMatches": "Aucun produit ne correspond à ces filtres.",
    "shop.noPayment": "Aucun paiement n'est effectué dans cette boutique — nous vous contacterons pour tout organiser.",
    "shop.notAvailable": "Ce produit n'est pas disponible.",
    "shop.orderPlaced": "Commande passée",
    "shop.orderReference": "Référence de commande",
    "shop.placeOrder": "Passer la commande",
    "shop.price": "Prix",
    "shop.quantity": "Quantité",
    "shop.remove": "Retirer",
    "shop.search": "Rechercher dans cette boutique",
    "shop.shopNotAvailable": "Cette boutique n'est pas disponible.",
    "shop.soldOut": "Épuisé",
    "shop.sortNewest": "Plus récents",
    "shop.sortPriceHigh": "Prix décroissant",
    "shop.sortPriceLow": "Prix croissant",
    "shop.total": "Total",
    "shop.yourCart": "Votre panier"
  }
};

export function shopText(language: string, key: keyof ShopCopy): string {
  const normalized = (["en", "de", "fr"].includes(language) ? language : "en") as ShopperLanguage;
  return SHOPPER_COPY[normalized][key];
}
