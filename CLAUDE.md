# B2B Starter - Architecture Guide

## Structure
- `site/` - Next.js 15 App Router storefront
- `tools/` - Admin scripts for project setup

## Tech Stack
- Next.js 15, React 19, TypeScript
- Tailwind CSS v4
- commercetools Platform SDK
- JWT sessions (jose)

## Patterns
- All CT API calls go through Next.js API routes (BFF pattern)
- Session stored as HTTP-only JWT cookie
- Context providers: Auth > BusinessUnit > Cart
- Permissions checked via associate roles on business units
- Store-scoped carts and orders

## Product Search
- **Uses the Product Search API** (`POST /{projectKey}/products/search` via `apiRoot.products().search().post()`) — NOT the older Product Projections Search endpoint
- **IMPORTANT**: The Product Search API must be activated on the commercetools project before use. Activate it via the Merchant Center (Project Settings) or via the API. If not activated, product listing and detail pages will fail with a 404/ObjectNotFound error.
- `productProjectionParameters` is passed in the request body to get full product projection data (name, images, prices, etc.) inline with search results
- When a user has a store in their session, `storeProjection` and `priceChannel` are set in `productProjectionParameters` to get store-specific product selections and pricing
- Store distribution channels are cached in memory to avoid repeated lookups

## Key Concepts (B2B)
- Users are "associates" of business units
- Associates have roles (admin, buyer, approver) with granular permissions
- Business units can be Companies or Divisions (hierarchical)
- Each BU has assigned stores; carts/orders are store-scoped
- **Different stores see different products and different prices** — this is a core B2B demo feature
- Quotes allow price negotiation between buyer and seller
- Approval rules define conditions that trigger approval flows
- Approval flows require designated approvers to approve/reject orders
- Purchase lists are shared shopping lists within a business unit

## Existing CT Project Data (DO NOT recreate — use what exists)

### Companies & Stores
| Company | Store Key | Pricing Tier |
|---------|-----------|-------------|
| Eagle Heavy Lift Technologies Inc. | `us-large-customers` | Lower volume-discount pricing (USD) |
| Liberty Crane Solutions LLC | `us-medium-customers` | Standard pricing (USD) |
| LiftTech Solutions Ltd | `de-fr-uk` | European pricing (EUR/GBP) |
| LiftTech Soluciones S.L. (Division) | `spain` | Spanish market (EUR) |

### Demo Accounts (all passwords: `123`)
| Email | Company | Role |
|-------|---------|------|
| james-smith@ehlt.com | Eagle Heavy Lift | Admin |
| emma-johnson@ehlt.com | Eagle Heavy Lift | Approver |
| michael-williams@ehlt.com | Eagle Heavy Lift | Buyer |
| olivia-newton@lcs.com | Liberty Crane | Admin |
| william-davis@lcs.com | Liberty Crane | Approver |
| ava-brown@lcs.com | Liberty Crane | Buyer |
| oliver-smith@ltsl.com | LiftTech Solutions | Admin |
| amelia-jones@ltsl.com | LiftTech Solutions | Approver |
| william-taylor@ltsl.com | LiftTech Solutions | Buyer |

### Distribution Channels (for pricing)
| Channel Key | Channel ID | Used By Store |
|------------|-----------|---------------|
| `us-large-customers` | `fd05d3a6-df3c-4de5-a9e2-bb857774364e` | us-large-customers |
| `us-medium-customers` | `d04dba8e-ee3d-46c5-85d9-539912550c10` | us-medium-customers |
| `de-fr-uk` | `26ad4a98-dd49-49d8-9b87-b95f4d3ac409` | de-fr-uk |
| `spain` | `95cce868-e470-4eb8-a3b0-be5ff90978b6` | spain |
| `default-channel` | `a4edf985-8e3a-48eb-828a-b600d41bdf60` | default-store |

### Pricing Structure
- 1,560 standalone prices across channels
- Prices are tied to distribution channels, not embedded on products
- Same product, different prices per channel (e.g., N123 QR Quarry Loader: $8,800 for large customers vs $9,600 for medium)
- Products page shows "Price on request" when not logged in (no store context)

### Product Catalog
- 72 products: heavy construction equipment (excavators, bulldozers, cranes, dump trucks, mining drills, spare parts)
- 10 root categories, 30+ subcategories
- All products share one product selection but pricing varies by channel

## API Routes
All in `site/app/api/`. Session-authenticated except products/categories.

## Running
1. **Activate the Product Search API** on your commercetools project (Merchant Center → Project Settings, or via the API)
2. `cd site && npm install && cp .env.example .env` (fill in credentials)
3. `cd tools && npm install && cp .env.example .env` (fill in credentials)
4. `cd tools && node seed-sample-data.mjs` (one-time setup — only if project has no data)
5. `cd site && npm run dev`
