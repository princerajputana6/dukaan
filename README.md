# Dukaan — Shop & Inventory Manager

A modern, multi-tenant point-of-sale and inventory platform for pan/cigarette shops and
general retail stores. Built with **Next.js (App Router)**, **MongoDB**, and **Material UI**.

## Roles & access (RBAC)

| Role | Who | Can do |
| ---- | --- | ------ |
| **Super Admin** | Platform operator (you) | Onboard businesses, issue owner credentials, set plans & store limits, approve account & upgrade requests |
| **Admin (Owner)** | Shop owner | Create stores (up to plan limit), add store managers, request plan upgrades, run all store operations |
| **Store Manager** | Staff | Operate POS, inventory, low-stock and sales for their assigned store(s) only |

**Onboarding flow:** a prospective owner submits a request on the public site → the Super
Admin reviews it and onboards the business, handing over a username & password → the owner
logs in and creates stores/managers → when they need more stores than their plan allows,
they raise an upgrade request, which the Super Admin approves to raise the store limit.

### Demo logins (after `npm run seed`)

| Role | Username | Password |
| ---- | -------- | -------- |
| Super Admin | `superadmin` | `super123` |
| Shop Owner | `sharma` | `owner123` |
| Store Manager | `ramesh` | `manager123` |

## Features

- **Dashboard** — today's revenue & profit, 7‑day revenue chart, inventory value,
  top-selling products and live low‑stock alerts.
- **Point of Sale (POS)** — fast product picker, cart, discount/tax, payment method,
  auto-generated invoice and a printable receipt. Stock is decremented on every sale.
  **Barcode-scanner ready** — scan (or type a barcode/SKU) and press Enter to drop the
  item straight into the bill.
- **Inventory** — searchable/filterable product grid with add / edit / delete,
  one-tap restock, cost & selling price, units and per-product low-stock thresholds.
- **Low Stock** — every product at or below its reorder level, sorted most-urgent first.
- **Categories** — colour-coded product groups with live product counts.
- **Sales** — full invoice history with expandable line items, profit and payment method.
- **Reports (owner)** — sales, profit, orders and items sold rolled up **across all of an
  owner's stores**, with a revenue-by-store chart, top products and a per-store breakdown
  over a 7 / 30 / 90-day window.
- **Guided onboarding** — a brand-new owner with no store yet is walked into creating their
  first store instead of hitting an error; the Super Admin can turn an account request into
  a fully pre-filled business in one click.

## Retail & food (restaurant / cart) support

- **Business type** — each business is *retail* or *food*. Food carts and restaurants get
  a **GST tax-inclusive receipt** with the CGST + SGST split, GSTIN and FSSAI licence in
  the header, and a custom footer — configured per business by the Super Admin.
- **Thermal bill printing** — the POS prints a 58 mm receipt via the browser's print
  dialog, so it works with any USB/Bluetooth thermal bill printer set as default. See
  [`src/lib/receipt.js`](src/lib/receipt.js).
- **Share / download PDF** — every receipt (at checkout and from Sales history) can be
  exported as a thermal-width PDF and shared straight to WhatsApp via the Web Share API on
  mobile, or downloaded on desktop. Past invoices also have a one-tap **reprint**.
- **Adaptive wording** — food businesses see "Menu / item / Add Item" across Inventory,
  Low Stock and Categories; retail keeps "Inventory / product / Add Product".
- **Receipt → inventory (OCR)** — snap a supplier receipt, and on-device OCR
  (tesseract.js) reads the line items into an editable table you confirm before
  bulk-adding to inventory. No API keys, runs in the browser.
- **Sub-categories** — categories can nest one level (e.g. *Cigarettes → Premium*);
  assign a parent when creating or editing.
- **POS category filters** — category chips across the top of the POS let staff filter
  the product grid instantly.
- **Keyboard-friendly** — every add/edit form submits on **Enter**.

## AI Smart Insights

The dashboard surfaces a daily, plain-English action list — reorder suggestions with sales
velocity, best/slow movers, week-over-week revenue trend and busiest hour — from a
deterministic analytics engine ([`src/lib/insights.js`](src/lib/insights.js)) that needs no
API key. Set `ANTHROPIC_API_KEY` in `.env.local` to upgrade the summary headline to a
Claude-generated one (via `@anthropic-ai/sdk`, `claude-opus-5`); everything still works
without it.

## Design system

A modern, animated MUI theme ([`src/lib/theme.js`](src/lib/theme.js)): gradient primary
buttons, soft layered card shadows with hover lift, a glassmorphism app bar, refined
typography and a shared scroll-reveal (`Reveal`) + count-up (`Counter`) animation kit used
across an overhauled marketing landing page and redesigned dashboards.

## Tech stack

| Layer     | Choice                                   |
| --------- | ---------------------------------------- |
| Framework | Next.js 15 (App Router, API routes)      |
| Database  | MongoDB + Mongoose                       |
| UI        | Material UI 6, MUI X DataGrid & Charts   |
| Styling   | Custom theme using the brand palette     |

### Brand palette

`#FCFDFD` Brilliance · `#EDEFF3` Springtime Rain · `#C6D1D7` Wind Weaver ·
`#9FA0B5` Wild Thistle · `#2F7EDA` Soothing Sapphire (primary) · `#555663` Blackwater (text)

## Getting started

```bash
npm install          # install dependencies
npm run seed         # (optional) load demo shop data into MongoDB
npm run dev          # start the dev server on http://localhost:3000
```

The MongoDB connection string lives in `.env.local` (`MONGODB_URI`).

## Project structure

```
middleware.js                Route protection + role-based redirects
src/
  app/
    (marketing)/             Public site: landing, about, contact, privacy,
                             terms, refund-policy, request-account
    login/                   Sign-in page
    (app)/                   Authenticated app (AppShell + auth guard)
      dashboard/  pos/  products/  low-stock/  categories/  sales/
      stores/                Owner: manage stores (plan-limited)
      team/                  Owner: manage store managers
      plan/                  Owner: plan + upgrade requests
      admin/businesses/      Super Admin: onboard & manage businesses
      admin/requests/        Super Admin: account & upgrade requests
    api/                     REST API (auth, products, categories, sales,
                             dashboard, businesses, stores, users,
                             upgrade-requests, account-requests)
  components/                AppShell, ThemeRegistry, StatCard, ProductDialog,
                             marketing/ (header, footer, policy)
  lib/                       theme, mongodb, auth, jwt, scope, format
  models/                    Business, Store, User, Product, Category, Sale,
                             UpgradeRequest, AccountRequest
scripts/seed.mjs             Demo data seeder (roles, stores, products)
```

## Auth & multi-tenancy

- Passwords hashed with **bcrypt**; sessions are signed **JWT** cookies (`jose`), verified
  in `middleware.js` for route protection and role gating.
- Every product, category and sale is scoped to a `business` + `store`. Admins switch
  between their stores with the sidebar store switcher; managers are locked to assigned
  stores. Store limits are enforced against the business plan on store creation.

## API overview

| Method | Route                          | Purpose                          |
| ------ | ------------------------------ | -------------------------------- |
| GET/POST | `/api/products`              | List / create products           |
| GET/PUT/DELETE | `/api/products/:id`    | Read / update / delete a product |
| POST   | `/api/products/:id/stock`      | Adjust stock (`add` or `set`)    |
| GET/POST | `/api/categories`            | List / create categories         |
| PUT/DELETE | `/api/categories/:id`      | Update / delete a category       |
| GET/POST | `/api/sales`                 | List sales / record a sale       |
| GET    | `/api/dashboard`               | Aggregated dashboard stats       |
```
