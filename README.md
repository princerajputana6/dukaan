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
