# B2B Starter - Feature Inventory

## Authentication
Login, registration, and session management using HTTP-only JWT cookies. Supports commercetools customer authentication with automatic token refresh.

## Business Unit Management
Create and edit business units with hierarchical structure (Companies and Divisions). Manage store assignments and unit settings.

## Associate Management
Add and remove team members from business units. Assign and update associate roles to control what each member can do.

## Role-Based Access Control
Three built-in roles (Admin, Buyer, Approver) with 40+ granular permissions. Permissions control access to carts, orders, quotes, shopping lists, approval flows, and business unit administration.

## Store-Scoped Commerce
Carts and orders are scoped to the stores assigned to each business unit. Associates interact with commerce data only within their authorized stores.

## Product Catalog
Browse and search products with category navigation. Supports product detail pages with variant selection.

## Cart Management
Add, remove, and update cart line items. Apply discount codes. Carts are store-scoped and tied to the active business unit.

## Checkout
Multi-step checkout with shipping and billing addresses, purchase order number entry, and order creation from the active cart.

## Order Management
View order history with filtering and pagination. Order detail view with line items, status, and tracking. Support for order cancellation.

## Quote Requests
Create quote requests from an active cart to negotiate pricing. Cancel pending requests. Track request status through the negotiation lifecycle. Quote request detail page shows line items, totals, and buyer notes.

## Quote Negotiation
Accept, decline, or renegotiate quotes with comments. Supports back-and-forth negotiation between buyer and seller until agreement or cancellation. Quote detail page highlights discounts with a savings banner, per-line-item price comparisons (original vs. quoted), and overall discount percentage.

## Approval Rules
Create and edit approval rules with order predicates (e.g., total price thresholds) and multi-tier approver assignments. Rules trigger approval flows automatically when conditions are met.

## Approval Flows
Multi-tier approval workflow for orders that match approval rule conditions. Approvers can approve or reject with reasons. Supports sequential tier evaluation.

## Purchase Lists
Shared shopping lists within a business unit. Add items to cart for quick reorder. Create, update, and delete lists collaboratively.

## Company Administration
Manage business unit settings, create and organize divisions, and maintain company addresses. Centralized administration for the entire company hierarchy.

## Dashboard
Overview page with key statistics, recent activity feed, and quick-action links. Provides at-a-glance summary of orders, quotes, and approval items.
