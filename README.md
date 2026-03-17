# B2B Starter for commercetools

A production-ready B2B storefront built with Next.js 15 and commercetools. Includes business unit management, role-based access control, approval workflows, quote negotiation, and more.

![Screenshot placeholder](docs/screenshot.png)

## Features

- **Business Unit Management** - Companies, divisions, and hierarchical organization
- **Associate & Role Management** - Add team members with Admin, Buyer, or Approver roles
- **Role-Based Access Control** - 40+ granular permissions controlling all commerce operations
- **Store-Scoped Commerce** - Carts and orders scoped to business unit stores
- **Product Catalog** - Browse, search, and category navigation
- **Cart & Checkout** - Full cart management with discount codes and PO numbers
- **Order Management** - Order history, detail views, and cancellation
- **Quote Requests & Negotiation** - Request quotes from carts, negotiate pricing
- **Approval Rules & Flows** - Configurable rules with multi-tier approval workflows
- **Purchase Lists** - Shared shopping lists for quick reorder
- **Company Administration** - Manage settings, divisions, and addresses
- **Dashboard** - Overview with stats, recent activity, and quick actions

## Quickstart

### Prerequisites

- Node.js 18+
- A commercetools project with B2B features enabled
- **Product Search API activated** — This demo uses the commercetools [Product Search API](https://docs.commercetools.com/api/projects/product-search) (`POST /products/search`), which must be activated on your project before use. Go to **Settings → Developer → Product Search** in the Merchant Center and activate it. The indexing process may take a few minutes to complete.

### 1. Install dependencies

```bash
cd site && npm install
cd ../tools && npm install
```

### 2. Configure environment

```bash
# Storefront
cd site && cp .env.example .env
# Edit .env with your commercetools credentials

# Admin tools
cd ../tools && cp .env.example .env
# Edit .env with your admin API credentials
```

### 3. Seed sample data

```bash
cd tools && node seed-sample-data.mjs
```

This creates sample business units, associate roles, and test accounts:

| Email | Password | Role |
|-------|----------|------|
| admin@acme.com | Password123! | Admin |
| buyer@acme.com | Password123! | Buyer |
| approver@acme.com | Password123! | Approver |

### 4. Run the storefront

```bash
cd site && npm run dev
```

Open [http://localhost:8888](http://localhost:8888) in your browser.

## Project Structure

```
b2b-starter/
  site/                     # Next.js 15 storefront
    app/                    # App Router pages and API routes
      api/                  # BFF API routes (session-authenticated)
    components/             # React components
    context/                # React context providers (Auth, BU, Cart)
    hooks/                  # Custom React hooks
    lib/                    # Utilities, CT client, types
  tools/                    # Admin setup scripts
    ct-admin.mjs            # Shared CT admin client
    seed-sample-data.mjs    # Master seed script
    setup-associate-roles.mjs
    setup-business-units.mjs
    setup-approval-rules.mjs
    explore-business-units.mjs
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS v4
- **Commerce**: commercetools Platform SDK
- **Auth**: JWT sessions with jose (HTTP-only cookies)
- **Language**: TypeScript

## Customization

### Adding new roles

Edit `tools/setup-associate-roles.mjs` to define additional roles with custom permission sets. See the [commercetools Associate Roles documentation](https://docs.commercetools.com/api/projects/associate-roles) for available permissions.

### Modifying approval rules

Edit `tools/setup-approval-rules.mjs` or create rules through the storefront admin UI. Rules use order predicates to define trigger conditions.

### Extending the storefront

All API calls follow the BFF (Backend for Frontend) pattern through Next.js API routes in `site/app/api/`. Add new routes following the existing patterns for session authentication and store-scoped requests.

## Documentation

- [commercetools B2B Overview](https://docs.commercetools.com/docs/b2b)
- [Business Units API](https://docs.commercetools.com/api/projects/business-units)
- [Associate Roles API](https://docs.commercetools.com/api/projects/associate-roles)
- [Approval Rules API](https://docs.commercetools.com/api/projects/approval-rules)
- [Approval Flows API](https://docs.commercetools.com/api/projects/approval-flows)
- [Quotes API](https://docs.commercetools.com/api/projects/quotes)
