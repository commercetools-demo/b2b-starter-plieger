# Claude Code Context

## Project Overview
B2B ecommerce storefront using Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, and commercetools (CT) as the headless commerce backend. Demonstrates B2B-specific features: business units, associate roles, approval workflows, quotes, and purchase lists.

## Directory Layout
- `site/` — Next.js storefront (all source code here)
- `tools/` — Admin scripts for CT data setup and exploration
- `FEATURES.md` — Complete feature inventory (keep updated when adding/removing features)

## Dev Server
```bash
cd site && npm run dev
```
Port 8888. The `.claude/launch.json` config is pre-set for this.

## Key Architecture Decisions

### Tailwind CSS v4
Uses `@import "tailwindcss"` and `@theme` block in CSS. There is NO `tailwind.config.ts` file — all theme customization is in the CSS file.

### API Routes as BFF
All CT API calls go through Next.js API routes in `site/app/api/`. The browser never talks to commercetools directly. Secrets (`CTP_CLIENT_SECRET`) are server-only — never prefixed with `NEXT_PUBLIC_`.

### Session Management
JWT-based sessions using the `jose` library. Sessions are stored in an HTTP-only cookie. Session contains: customerId, customerEmail, customerFirstName, customerLastName, businessUnitKey, storeKey, cartId, supplyChannelId. No server-side session store.

### Context Providers
Three React context providers wrap the app in this order: Auth > BusinessUnit > Cart. Each provides a hook (`useAuth()`, `useBusinessUnit()`, `useCart()`). BusinessUnit context auto-selects the first BU and store on login. Cart context watches BU changes and auto-fetches.

### CT Product Search
Uses the **Product Search API** (`POST /products/search` via `apiRoot.products().search().post()`) — NOT the older Product Projections Search endpoint. The Product Search API must be activated on the CT project before use.

`productProjectionParameters` is passed in the request body to get full product projection data inline with search results. When a user has a store in their session, `storeProjection` and `priceChannel` are set for store-specific pricing.

### Store-Scoped Commerce
Carts, orders, quotes, and purchase lists are all scoped to a business unit and store. Different stores see different products and different prices — this is a core B2B demo feature.

### Pricing & Channels
Prices are tied to distribution channels, not embedded on products. Each store has a distribution channel for pricing and a supply channel for inventory. Channel mappings are cached in memory to avoid repeated lookups. The supply channel ID is stored in the session for inventory queries.

### Permissions
Associates have roles (admin, buyer, approver) with 30+ granular permissions. The storefront checks permissions to show/hide UI elements and enforce access at the API level. Permission groups: Business Unit, Carts, Orders, Quotes, Approvals, Shopping Lists.

## Environment Files

**CRITICAL: `site/.env` and `tools/.env` are completely separate API clients with different permission scopes. NEVER copy, share, or reuse credentials between them.**

- `site/.env` — **Storefront** API client (limited scope). Used by the Next.js app.
- `tools/.env` — **Admin** API client (`manage_project` scope — can modify or delete anything). Used ONLY by scripts in `tools/`.

If `site/.env` is missing, tell the user to create a new API client in Merchant Center. **NEVER copy `tools/.env` to `site/.env`** — this would give the public-facing storefront full admin access.

Both files are gitignored. Never commit them.

## Adding or Changing Features

Before making changes, read `FEATURES.md` to understand what already exists. After completing a feature change:

1. **Update `FEATURES.md`** — add, modify, or remove entries so it stays accurate.
2. Verify the change works by running the dev server.

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


## Using Skills
### Features
You have access to the following skills to implement specific features
1. 1. Superuser: customer impersonation [skill](./.claude/skills/superuser/SKILL.md)

### Generic guideline skills
1. Add API: Guidelines to follow when creating a new api call [skill](./.claude/skills/add-api/SKILL.md)
2. Add new country: Guidelines to follow when adding a new country/locale/language [skill](./.claude/skills/add-country/SKILL.md)
3. Netlify: Provision a new Netlify site under the "cofe-pre-sales" team and configure environment variables [skill](./.claude/skills/netlify/SKILL.md)

## Tools Pattern
All tools import from `tools/ct-admin.mjs` which reads `tools/.env`. To create a new tool, follow the existing pattern — create a standalone `.mjs` file in `tools/`.

## Running
1. **Activate the Product Search API** on your commercetools project (Merchant Center → Project Settings, or via the API)
2. `cd site && npm install && cp .env.example .env` (fill in credentials)
3. `cd tools && npm install && cp .env.example .env` (fill in credentials)
4. `cd tools && node seed-sample-data.mjs` (one-time setup — only if project has no data)
5. `cd site && npm run dev`
