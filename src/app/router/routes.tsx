import { useEffect, useState } from "react";
import { AppShell } from "../layout/AppShell";
import { RedirectIfAuthenticated, RequireAuth } from "./guards";
import { matchPath } from "./match";
import { CallbackPage } from "../../features/auth/CallbackPage";
import { ErrorPage } from "../../features/auth/ErrorPage";
import { LoginPage } from "../../features/auth/LoginPage";
import { NotFoundPage } from "../../features/auth/NotFoundPage";
import { SignupPage } from "../../features/auth/SignupPage";
import { LandingPage } from "../../features/landing/LandingPage";
import { AboutPage } from "../../features/landing/AboutPage";
import { BrandProvider } from "../../features/domain/BrandProvider";
import { BrandSetupPage } from "../../features/brands/BrandSetupPage";
import { DashboardPage } from "../../features/dashboard/DashboardPage";
import { CatalogListPage } from "../../features/catalog/CatalogListPage";
import { ProductDetailPage } from "../../features/catalog/ProductDetailPage";
import { CategoriesPage } from "../../features/catalog/CategoriesPage";
import { OrdersPage } from "../../features/orders/OrdersPage";
import { StaffPage } from "../../features/staff/StaffPage";
import { BrandingPage } from "../../features/brands/BrandingPage";
import { ThemeStudioPage } from "../../features/theme/ThemeStudioPage";
import { ProfilePage } from "../../features/profile/ProfilePage";
import { OperatorPage } from "../../features/operator/OperatorPage";
import { ShopfrontPage } from "../../features/shopfront/ShopfrontPage";

export type Navigate = (path: string) => void;

export function AppRouter() {
  const [path, setPath] = useState(() => window.location.pathname);
  const [search, setSearch] = useState(() => window.location.search);

  useEffect(() => {
    const onPopState = () => {
      setPath(window.location.pathname);
      setSearch(window.location.search);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function navigate(nextPath: string) {
    const [nextPathname = "/", queryString = ""] = nextPath.split("?");
    window.history.pushState({}, "", nextPath);
    setPath(nextPathname);
    setSearch(queryString ? `?${queryString}` : "");
  }

  const params = buildParams(path);
  const key = Object.keys(params).length ? "matched" : path;

  if (path === "/login/callback") {
    return <CallbackPage onNavigate={navigate} />;
  }

  if (path === "/login") {
    const returnTo = new URLSearchParams(search).get("returnTo") || undefined;
    return (
      <RedirectIfAuthenticated onNavigate={navigate}>
        <LoginPage returnTo={returnTo} />
      </RedirectIfAuthenticated>
    );
  }

  if (path === "/") return <LandingPage onNavigate={navigate} />;
  if (path === "/about") return <AboutPage onNavigate={navigate} />;
  if (path === "/signup") {
    return (
      <RedirectIfAuthenticated onNavigate={navigate}>
        <SignupPage onNavigate={navigate} />
      </RedirectIfAuthenticated>
    );
  }

  if (path === "/error") return <ErrorPage onNavigate={navigate} />;

  if (key === "shop") {
    return <ShopfrontPage navigate={navigate} path={path} params={params} search={search} />;
  }

  const adminPage = renderAdmin(path, params, navigate);
  if (!adminPage) return <NotFoundPage onNavigate={navigate} />;

  return (
    <RequireAuth currentPath={path} onNavigate={navigate}>
      <BrandProvider>
        <AppShell activePath={path} onNavigate={navigate}>
          {adminPage}
        </AppShell>
      </BrandProvider>
    </RequireAuth>
  );
}

type Params = Record<string, string>;

function buildParams(path: string): Params {
  const shopPatterns = [
    { pattern: "/shop/:brandSlug", tags: {} },
    { pattern: "/shop/:brandSlug/c/:categorySlug", tags: {} },
    { pattern: "/shop/:brandSlug/p/:productSlug", tags: {} },
    { pattern: "/shop/:brandSlug/cart", tags: {} },
    { pattern: "/shop/:brandSlug/checkout", tags: {} },
    { pattern: "/shop/:brandSlug/order/:reference", tags: {} }
  ];
  for (const entry of shopPatterns) {
    const matched = matchPath(entry.pattern, path);
    if (matched) return { ...matched.params, __shop: entry.pattern };
  }
  return {};
}

function renderAdmin(path: string, params: Params, navigate: Navigate) {
  if (path === "/app") return <DashboardPage onNavigate={navigate} />;
  if (path === "/app/setup") return <BrandSetupPage onNavigate={navigate} />;
  if (path === "/app/catalog") return <CatalogListPage onNavigate={navigate} />;
  if (path === "/app/catalog/new") return <ProductDetailPage onNavigate={navigate} productId="new" />;
  const productMatch = matchPath("/app/catalog/:productId", path);
  if (productMatch) return <ProductDetailPage onNavigate={navigate} productId={productMatch.params.productId ?? ""} />;
  if (path === "/app/categories") return <CategoriesPage />;
  if (path === "/app/orders") return <OrdersPage />;
  if (path === "/app/staff") return <StaffPage onNavigate={navigate} />;
  if (path === "/app/branding") return <BrandingPage />;
  if (path === "/app/theme") return <ThemeStudioPage />;
  if (path === "/app/profile") return <ProfilePage />;
  if (path === "/operator") return <OperatorPage />;
  return undefined;
}
