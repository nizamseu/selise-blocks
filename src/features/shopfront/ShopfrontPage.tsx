import { useQuery } from "@tanstack/react-query";
import type { Order } from "../domain/types";
import { getTheme, publishedConfig } from "../theme/themeApi";
import { themeStyleVars } from "../theme/theme";
import { Skeleton } from "../../shared/ui/Skeleton";
import {
  allVariantsForShop, brandBySlug, listPublishedProducts, listShopCategories, orderByReference
} from "./shopApi";
import { ShopLanguageProvider } from "./ShopLanguageProvider";
import { ShopCartProvider } from "./ShopCartProvider";
import { ShopLayout } from "./ShopLayout";
import { ShopHome } from "./ShopHome";
import { ShopListing } from "./ShopListing";
import { ShopProduct } from "./ShopProduct";
import { ShopCart } from "./ShopCart";
import { ShopCheckout } from "./ShopCheckout";
import { ShopOrderPlaced } from "./ShopOrderPlaced";

type Props = {
  navigate: (path: string) => void;
  path: string;
  params: Record<string, string>;
  search: string;
};

export function ShopfrontPage({ navigate, path, params, search }: Props) {
  const slug = params.brandSlug ?? "";
  const kind = params.__shop ?? "";
  const brandQuery = useQuery({ queryFn: () => brandBySlug(slug), queryKey: ["shop", "brand", slug] });

  if (brandQuery.isLoading) return <div className="shopfront-loading"><Skeleton className="skeleton-line-lg" /></div>;
  const brand = brandQuery.data;
  if (!brand || brand.state === "Suspended") {
    return <div className="shop-suspended"><h1>This shop is not available.</h1></div>;
  }

  return (
    <ShopLanguageProvider brandId={brand.itemId}>
      <ShopCartProvider brandId={brand.itemId}>
        <ShopBody brandSlug={slug} kind={kind} path={path} params={params} search={search} navigate={navigate} brandId={brand.itemId} brandName={brand.name} currency={brand.currency} />
      </ShopCartProvider>
    </ShopLanguageProvider>
  );
}

function ShopBody({
  brandSlug,
  kind,
  path,
  params,
  search,
  navigate,
  brandId,
  brandName,
  currency
}: {
  brandSlug: string;
  kind: string;
  path: string;
  params: Record<string, string>;
  search: string;
  navigate: (path: string) => void;
  brandId: string;
  brandName: string;
  currency: string;
}) {
  const dataQuery = useQuery({
    queryFn: async () => {
      const [products, themeRow] = await Promise.all([
        listPublishedProducts(brandId),
        getTheme(brandId)
      ]);
      const [categories, variants, brand] = await Promise.all([
        listShopCategories(brandId, products),
        allVariantsForShop(products),
        brandBySlug(brandSlug)
      ]);
      return { brand, categories, products, theme: publishedConfig(themeRow), variants };
    },
    queryKey: ["shop", "data", brandId]
  });

  if (dataQuery.isLoading) return <div className="shopfront-loading"><Skeleton className="skeleton-line-lg" /></div>;
  const data = dataQuery.data;
  if (!data?.brand) return <div className="shop-suspended"><h1>This shop is not available.</h1></div>;
  const { brand, categories, products, theme, variants } = data;
  const styleVars = themeStyleVars(theme) as React.CSSProperties;

  const openProduct = (productId: string) => {
    const product = products.find((entry) => entry.itemId === productId);
    if (product) navigate(`/shop/${brandSlug}/p/${product.slug}`);
  };

  let content;
  if (kind === "/shop/:brandSlug/cart") {
    content = <ShopCart brandSlug={brandSlug} currency={currency} onNavigate={navigate} />;
  } else if (kind === "/shop/:brandSlug/checkout") {
    content = <ShopCheckout brand={brand} onPlaced={(order: Order) => navigate(`/shop/${brandSlug}/order/${order.reference}`)} />;
  } else if (kind === "/shop/:brandSlug/order/:reference") {
    content = <OrderLookup brandId={brandId} reference={params.reference ?? ""} currency={currency} brandSlug={brandSlug} navigate={navigate} />;
  } else if (kind === "/shop/:brandSlug/p/:productSlug") {
    const product = products.find((entry) => entry.slug === params.productSlug);
    content = product ? (
      <ShopProduct
        product={product}
        variants={variants.get(product.itemId) ?? []}
        theme={theme}
        currency={currency}
        brandSlug={brandSlug}
        onBack={() => navigate(`/shop/${brandSlug}`)}
        onAdded={() => navigate(`/shop/${brandSlug}/cart`)}
      />
    ) : (
      <div className="shop-empty"><h1>This product isn't available.</h1></div>
    );
  } else if (kind === "/shop/:brandSlug/c/:categorySlug" || new URLSearchParams(search).has("list")) {
    content = (
      <ShopListing
        activeCategorySlug={params.categorySlug}
        brandName={brandName}
        brandSlug={brandSlug}
        categories={categories}
        currency={currency}
        onOpenCategory={(categorySlug) => navigate(categorySlug ? `/shop/${brandSlug}/c/${categorySlug}` : `/shop/${brandSlug}/c/all`)}
        onOpenProduct={(product) => navigate(`/shop/${brandSlug}/p/${product.slug}`)}
        products={products}
        theme={theme}
        variantsByProduct={variants}
      />
    );
  } else {
    content = (
      <ShopHome
        brandName={brandName}
        categories={categories}
        currency={currency}
        onOpenCategory={(category) => navigate(`/shop/${brandSlug}/c/${category.slug}`)}
        onOpenProduct={(product) => navigate(`/shop/${brandSlug}/p/${product.slug}`)}
        products={products}
        theme={theme}
        variantsByProduct={variants}
      />
    );
  }

  return (
    <div style={styleVars}>
      <ShopLayout brandName={brandName} brandSlug={brandSlug} categories={categories} onNavigate={navigate}>
        {content}
      </ShopLayout>
    </div>
  );
}

function OrderLookup({ brandId, reference, currency, brandSlug, navigate }: { brandId: string; reference: string; currency: string; brandSlug: string; navigate: (path: string) => void }) {
  const orderQuery = useQuery({
    queryFn: () => orderByReference(brandId, reference),
    queryKey: ["shop", "order", brandId, reference]
  });

  if (orderQuery.isLoading) return <Skeleton className="skeleton-line-lg" />;
  if (!orderQuery.data) return <div className="shop-empty"><h1>Order not found.</h1></div>;
  return <ShopOrderPlaced order={orderQuery.data} currency={currency} brandSlug={brandSlug} onNavigate={navigate} />;
}
