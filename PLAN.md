# Plan — Multi-tenant Storefront Platform

## Branding & shell
- [x] Brand text, icon, tokens, landing shell (no skill)
- [x] Public landing page: one line, shopfront+theme screenshot, pricing (no skill)
- [x] Sidebar admin shell, brand switcher, app routes (no skill)

## Data model
- [x] Define Brand/Category/Product schemas (blocks-data-gateway-configuration)
- [x] Define Theme/ThemeVersion/Staff schemas (blocks-data-gateway-configuration)
- [x] Define Order/HistoryEntry schemas (blocks-data-gateway-configuration)
- [x] Push schemas, deploy rules, reload (blocks-data-gateway-configuration)
- [x] Data client helpers and hooks (blocks-data-gateway-crud)

## T01 Brands, sign-up and staff
- [x] Sign-up, brand setup, unique-name check (blocks-iam-account + data)
- [x] Brand switcher across multiple brands (blocks-data-gateway-crud)
- [x] Staff invites, roles, deactivate; email invite (blocks-iam-users + blocks-mail)

## T02 Catalog
- [x] Categories CRUD with position and menu (blocks-data-gateway-crud)
- [x] Products CRUD with variants; add-product form (blocks-data-gateway-crud)
- [x] Catalog list: search, filter, sort, paging, totals (blocks-data-gateway-crud)

## T03 Stock, visibility, images, history
- [x] Product state Draft/Published/Hidden control (blocks-data-gateway-crud)
- [x] Variant stock editing and stock totals (blocks-data-gateway-crud)
- [x] Product images upload (blocks-data-storage)
- [x] Change history recording and panel (blocks-data-gateway-crud)

## T04 Landing, addresses, operator
- [x] Custom domain with DNS state (blocks-data-gateway-crud)
- [x] Platform operator brand list, suspend/resume (blocks-data-gateway-crud)
- [x] Suspended/hidden product pages (no skill)

## T05 Shopfront
- [x] Shopfront home from theme blocks (blocks-data-gateway-crud)
- [x] Shopfront listing: search, filter, paging, view toggle (blocks-data-gateway-crud)
- [x] Shopfront language switcher en/de/fr (blocks-localization-implementation)

## T06 Product page, cart, checkout
- [x] Product page with variants and add-to-cart (blocks-data-gateway-crud)
- [x] Per-brand cart with quantity edits (no skill)
- [x] Checkout form and place order (blocks-data-gateway-crud)

## T07 Theme tokens and layouts
- [x] Theme token editor and shopfront CSS vars (blocks-data-gateway-crud)
- [x] Page layout block editor per page type (blocks-data-gateway-crud)
- [x] Layout presets (blocks-data-gateway-crud)

## T08 Preview and draft
- [x] Live preview frame with device widths (no skill)
- [x] Draft vs published theme separation (blocks-data-gateway-crud)

## T09 Theme versions
- [x] Publish creates version with summary (blocks-data-gateway-crud)
- [x] Version history panel and restore (blocks-data-gateway-crud)

## T10 Orders and alerts
- [x] Orders list and state changes (blocks-data-gateway-crud)
- [x] Order-placed emails per staff language (blocks-mail)
- [x] In-app new-order alert with unread count (blocks-notifier)

## T11 Free plan limits and languages
- [x] Free plan limits on products, seats, brands (no skill)
- [x] German and French shopper translations (blocks-localization-configuration)

## Final
- [x] Check and build app
