# Features

Comprehensive inventory of implemented storefront features. This file is the source of truth for what exists in the codebase — keep it updated when adding or removing features.

## Authentication & Sessions

- Email/password login and registration
- JWT-based sessions using `jose`, stored in HTTP-only cookie
- Business unit and store context persisted in session
- Cart reference tracked in session
- Supply channel ID cached in session for inventory lookups
- Logout clears session and cart reference

## Business Units

- Company and Division unit types with parent/child hierarchy
- Create new divisions under a parent company
- Edit business unit name and contact email
- View assigned stores per business unit
- Business unit switcher in header
- Store switcher within a business unit
- Store mode support (Explicit or FromParent)
- Business unit addresses management

## Associate Management

- Add associates to a business unit by email
- Remove associates from a business unit
- Change associate role assignments
- View team members with their current roles
- Permission-based visibility (admin-only operations)

## Role-Based Access Control

- Three built-in roles: Admin, Buyer, Approver
- 30+ granular permissions across six permission groups:
  - **Business Unit**: add child units, update associates
  - **Carts**: create/update/delete/view own and others' carts
  - **Orders**: create/view/update own and others' orders
  - **Quotes**: create/accept/decline/renegotiate/reassign own and others' quotes
  - **Approvals**: create/update rules, update flow statuses
  - **Shopping Lists**: view/create/update/delete own and others' lists
- UI elements hidden or disabled based on user permissions
- API-level permission enforcement

## Product Catalog

- Product Search API (commercetools `POST /products/search`)
- Full-text search with query input
- Category filtering with nested hierarchy (10 root categories, 30+ subcategories)
- Pagination and sorting
- 72 products: heavy construction equipment (excavators, bulldozers, cranes, dump trucks, mining drills, spare parts)
- Product detail pages with image gallery and SKU display
- Store-specific product availability via product selections
- Store-specific pricing via distribution channels
- "Price on request" displayed when not authenticated (no store context)
- Inventory availability display with channel-specific stock levels

## Pricing & Channels

- 1,560+ standalone prices across distribution channels
- Same product, different prices per channel (e.g., volume discounts for large customers)
- Distribution channels mapped to stores for price selection
- In-memory caching of store-to-channel mappings
- Currency support: USD, EUR, GBP
- Four pricing tiers: US Large Customers, US Medium Customers, EU (DE/FR/UK), Spain

## Shopping Cart

- Cart creation scoped to business unit and store
- Auto-cart creation on first item add
- Add, update quantity, and remove line items
- Distribution channel applied automatically for correct pricing
- Discount code application
- Mini-cart sidebar with auto-hide
- Cart state tracking (Active, Merged, Ordered, Frozen)
- Tax calculation display

## Checkout

- Shipping address form with full address fields
- Billing address form (same as shipping or separate)
- Purchase order number input
- Order creation from cart
- Order confirmation page
- Cart cleared from session after order placement

## Order Management

- Order list with pagination
- Filter orders by status (Open, Confirmed, Complete, Cancelled)
- Order detail with line items, pricing breakdown, and addresses
- Orders scoped to business unit and store
- Dashboard widget showing recent orders with totals

## Quote Requests

- Create quote request from active cart with comment and PO number
- Quote request list with pagination
- Quote request detail with line items, totals, and buyer notes
- Quote request states: Submitted, Accepted, Closed, Rejected, Cancelled
- Cancel pending quote requests

## Quote Negotiation

- Accept, decline, or renegotiate quotes with comments
- Quote states: Pending, DeclinedForRenegotiation, RenegotiationAddressed, Accepted, Declined, Withdrawn, Failed
- Quote detail with savings banner and discount percentage
- Per-line-item price comparison (original vs. quoted)
- Dual-tab view: Quotes and Quote Requests in dashboard

## Approval Rules

- Create approval rules with name, description, and order predicates
- Predicate builder UI for conditions (total price thresholds, currency, line item count)
- Operators: >, <, >=, <=, =, !=
- Multi-tier approver assignments (sequential approval chains)
- Requester role restrictions (which roles can trigger the rule)
- Enable/disable rules
- Edit existing rules (name, description, status, predicate, approvers, requesters)
- Admin-only access

## Approval Flows

- Automatic flow creation when orders match approval rule conditions
- Multi-tier sequential approval evaluation
- Approval flow states: Pending, Approved, Rejected
- Approve or reject with optional reason
- Approval flow detail showing order information and approver chain
- Dashboard widget showing pending approval count
- Filter flows by status

## Purchase Lists

- Create named purchase lists within a business unit
- Add items to purchase lists from product pages
- Update item quantities in lists
- Remove items from lists
- Delete entire purchase lists
- View list owner (self vs. others)
- Permission-based visibility and actions (own vs. others' lists)
- Store-scoped purchase lists

## Dashboard

- Home page with key statistics: total orders, pending quotes, pending approvals
- Recent orders table with status and totals
- Quick action buttons: New Order, Request Quote, Purchase Lists
- Permission-aware widget visibility
- Navigation sidebar with links to all dashboard sections

## Company Administration

- Edit business unit name and contact email
- View assigned stores
- Create new divisions under the company
- Manage business unit addresses
- Centralized administration for company hierarchy

## API Routes (BFF)

All commercetools calls go through server-side Next.js API routes. The browser never contacts commercetools directly.

| Route | Methods | Purpose |
|---|---|---|
| `/api/auth/login` | POST | Sign in |
| `/api/auth/register` | POST | Create account |
| `/api/auth/logout` | POST | Clear session |
| `/api/auth/me` | GET | Current user |
| `/api/products` | GET | Search products |
| `/api/products/[slug]` | GET | Product detail |
| `/api/products/sku` | GET | Product by SKU |
| `/api/categories` | GET | Category tree |
| `/api/cart` | GET, POST | Get or create cart |
| `/api/cart/items` | POST | Add item |
| `/api/cart/items/[itemId]` | PUT, DELETE | Update quantity, remove item |
| `/api/cart/discount-code` | POST | Apply discount code |
| `/api/checkout` | POST | Place order |
| `/api/orders` | GET | List orders |
| `/api/orders/[id]` | GET | Order detail |
| `/api/quotes` | GET | List quotes |
| `/api/quotes/[id]` | GET, POST | Quote detail, quote actions |
| `/api/quote-requests` | GET, POST | List / create quote requests |
| `/api/quote-requests/[id]` | GET | Quote request detail |
| `/api/approval-flows` | GET | List approval flows |
| `/api/approval-flows/[id]` | GET, POST | Flow detail, approve/reject |
| `/api/approval-rules` | GET, POST | List / create rules |
| `/api/approval-rules/[id]` | PUT | Update rule |
| `/api/purchase-lists` | GET, POST | List / create purchase lists |
| `/api/purchase-lists/[id]` | GET, DELETE | List detail, delete list |
| `/api/purchase-lists/[id]/items` | GET, POST | List / add items |
| `/api/purchase-lists/[id]/items/[itemId]` | PUT, DELETE | Update / remove item |
| `/api/business-units` | GET, POST | List / create business units |
| `/api/business-units/[id]` | GET, PUT | BU detail, update BU |
| `/api/business-units/[id]/select` | POST | Select active BU/store |
| `/api/business-units/[id]/addresses` | GET | BU addresses |
| `/api/business-units/[id]/associates` | POST, PUT, DELETE | Manage associates |
| `/api/associate-roles` | GET | List all roles |

## Admin Tools

Scripts in `tools/` for commercetools project setup. All use `tools/.env` (admin scope).

| Script | Purpose |
|---|---|
| `ct-admin.mjs` | Shared CT client with auth |
| `seed-sample-data.mjs` | Master seed script (runs all setup scripts) |
| `setup-associate-roles.mjs` | Create admin, buyer, approver roles with permissions |
| `setup-business-units.mjs` | Create companies, divisions, stores, and associates |
| `setup-approval-rules.mjs` | Create sample approval rules with predicates and tiers |
| `explore-business-units.mjs` | Debug tool to inspect BU structure |
