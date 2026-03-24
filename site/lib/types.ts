// ─── Account / Associate ──────────────────────────────────────────
export interface Address {
  id?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  streetName?: string;
  streetNumber?: string;
  additionalStreetInfo?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country: string;
  phone?: string;
  email?: string;
  isDefaultBilling?: boolean;
  isDefaultShipping?: boolean;
}

export interface Account {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  addresses: Address[];
  version: number;
}

export interface Associate {
  customer: {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  associateRoleAssignments: AssociateRoleAssignment[];
}

export interface AssociateRoleAssignment {
  associateRole: {
    key: string;
    typeId: 'associate-role';
  };
  inheritance: 'enabled' | 'disabled';
}

// ─── Associate Roles & Permissions ─────────────────────────────────
export type Permission =
  | 'AddChildUnits'
  | 'UpdateBusinessUnitDetails'
  | 'UpdateAssociates'
  | 'CreateMyCarts'
  | 'CreateOthersCarts'
  | 'UpdateMyCarts'
  | 'UpdateOthersCarts'
  | 'DeleteMyCarts'
  | 'DeleteOthersCarts'
  | 'ViewMyCarts'
  | 'ViewOthersCarts'
  | 'CreateMyOrdersFromMyCarts'
  | 'CreateMyOrdersFromMyQuotes'
  | 'CreateOrdersFromOthersCarts'
  | 'CreateOrdersFromOthersQuotes'
  | 'ViewMyOrders'
  | 'ViewOthersOrders'
  | 'UpdateMyOrders'
  | 'UpdateOthersOrders'
  | 'CreateMyQuoteRequestsFromMyCarts'
  | 'CreateQuoteRequestsFromOthersCarts'
  | 'AcceptMyQuotes'
  | 'AcceptOthersQuotes'
  | 'DeclineMyQuotes'
  | 'DeclineOthersQuotes'
  | 'RenegotiateMyQuotes'
  | 'RenegotiateOthersQuotes'
  | 'ReassignMyQuotes'
  | 'ReassignOthersQuotes'
  | 'ViewMyQuotes'
  | 'ViewOthersQuotes'
  | 'CreateApprovalRules'
  | 'UpdateApprovalRules'
  | 'UpdateApprovalFlowStatuses'
  | 'ViewMyShoppingLists'
  | 'ViewOthersShoppingLists'
  | 'CreateMyShoppingLists'
  | 'CreateOthersShoppingLists'
  | 'UpdateMyShoppingLists'
  | 'UpdateOthersShoppingLists'
  | 'DeleteMyShoppingLists'
  | 'DeleteOthersShoppingLists';

export interface AssociateRole {
  id: string;
  key: string;
  name?: string;
  buyerAssignable: boolean;
  permissions: Permission[];
  version: number;
}

// ─── Business Unit ─────────────────────────────────────────────────
export type BusinessUnitStatus = 'Active' | 'Inactive';
export type BusinessUnitType = 'Company' | 'Division';
export type StoreMode = 'Explicit' | 'FromParent';

export interface Store {
  key: string;
  name?: string;
}

export interface BusinessUnit {
  id: string;
  key: string;
  name: string;
  status: BusinessUnitStatus;
  unitType: BusinessUnitType;
  storeMode: StoreMode;
  stores: Store[];
  addresses: Address[];
  associates: Associate[];
  parentUnit?: { key: string; typeId: 'business-unit' };
  topLevelUnit?: { key: string; typeId: 'business-unit' };
  contactEmail?: string;
  version: number;
}

// ─── Cart & Line Items ─────────────────────────────────────────────
export interface Money {
  centAmount: number;
  currencyCode: string;
  fractionDigits?: number;
}

export interface ProductImage {
  url: string;
  label?: string;
  dimensions?: { w: number; h: number };
}

export interface LineItem {
  id: string;
  productId: string;
  productKey?: string;
  name: Record<string, string>;
  variant: {
    id: number;
    sku?: string;
    images?: ProductImage[];
    prices?: Array<{
      id: string;
      value: Money;
    }>;
    attributes?: Array<{
      name: string;
      value: unknown;
    }>;
  };
  quantity: number;
  price: {
    id: string;
    value: Money;
    discounted?: { value: Money };
  };
  totalPrice: Money;
}

export interface Cart {
  id: string;
  version: number;
  customerId?: string;
  businessUnit?: { key: string; typeId: 'business-unit' };
  store?: { key: string; typeId: 'store' };
  lineItems: LineItem[];
  totalPrice: Money;
  taxedPrice?: {
    totalNet: Money;
    totalGross: Money;
    totalTax: Money;
  };
  shippingAddress?: Address;
  billingAddress?: Address;
  cartState: 'Active' | 'Merged' | 'Ordered' | 'Frozen';
  discountCodes?: Array<{
    discountCode: { id: string };
    state: string;
  }>;
}

// ─── Orders ────────────────────────────────────────────────────────
export type OrderState = 'Open' | 'Confirmed' | 'Complete' | 'Cancelled';

export interface Order {
  id: string;
  orderNumber?: string;
  version: number;
  customerId?: string;
  businessUnit?: { key: string; typeId: 'business-unit' };
  store?: { key: string; typeId: 'store' };
  lineItems: LineItem[];
  totalPrice: Money;
  taxedPrice?: {
    totalNet: Money;
    totalGross: Money;
    totalTax: Money;
  };
  orderState: OrderState;
  shippingAddress?: Address;
  billingAddress?: Address;
  createdAt: string;
  lastModifiedAt: string;
}

// ─── Quotes ────────────────────────────────────────────────────────
export type QuoteRequestState =
  | 'Submitted'
  | 'Accepted'
  | 'Closed'
  | 'Rejected'
  | 'Cancelled';

export type QuoteState =
  | 'Pending'
  | 'DeclinedForRenegotiation'
  | 'RenegotiationAddressed'
  | 'Accepted'
  | 'Declined'
  | 'Withdrawn'
  | 'Failed';

export interface QuoteRequest {
  id: string;
  version: number;
  key?: string;
  quoteRequestState: QuoteRequestState;
  customer: { id: string; typeId: 'customer' };
  businessUnit?: { key: string; typeId: 'business-unit' };
  store?: { key: string; typeId: 'store' };
  lineItems: LineItem[];
  totalPrice: Money;
  comment?: string;
  purchaseOrderNumber?: string;
  createdAt: string;
}

export interface Quote {
  id: string;
  version: number;
  key?: string;
  quoteState: QuoteState;
  quoteRequest: { id: string; typeId: 'quote-request' };
  stagedQuote?: { id: string; typeId: 'staged-quote' };
  customer: { id: string; typeId: 'customer' };
  businessUnit?: { key: string; typeId: 'business-unit' };
  store?: { key: string; typeId: 'store' };
  lineItems: LineItem[];
  totalPrice: Money;
  buyerComment?: string;
  sellerComment?: string;
  purchaseOrderNumber?: string;
  validTo?: string;
  createdAt: string;
}

// ─── Approval Rules ───────────────────────────────────────────────
export interface ApproverConjunction {
  and: Array<{
    associateRole: { key: string; typeId: 'associate-role' };
  }>;
}

export interface ApproverHierarchy {
  tiers: ApproverConjunction[];
}

export interface RuleRequester {
  associateRole: { key: string; typeId: 'associate-role' };
}

export type ApprovalRuleStatus = 'Active' | 'Inactive';

export interface ApprovalRule {
  id: string;
  version: number;
  key?: string;
  name: string;
  description?: string;
  status: ApprovalRuleStatus;
  predicate: string;
  approvers: ApproverHierarchy;
  requesters: RuleRequester[];
  businessUnit: { key: string; typeId: 'business-unit' };
  createdAt: string;
}

// ─── Approval Flows ───────────────────────────────────────────────
export type ApprovalFlowStatus = 'Pending' | 'Approved' | 'Rejected';

export interface ApprovalFlowApproval {
  approver: { customer: { id: string; typeId: 'customer' } };
  approvedAt: string;
}

export interface ApprovalFlowRejection {
  rejecter: { customer: { id: string; typeId: 'customer' } };
  rejectedAt: string;
  reason?: string;
}

export interface ApprovalFlow {
  id: string;
  version: number;
  order: { id: string; typeId: 'order' };
  businessUnit: { key: string; typeId: 'business-unit' };
  rules: Array<{
    approvalRule: { id: string; typeId: 'approval-rule' };
  }>;
  status: ApprovalFlowStatus;
  approvals: ApprovalFlowApproval[];
  rejections: ApprovalFlowRejection[];
  eligibleApprovers: Array<{
    customer: { id: string; typeId: 'customer' };
  }>;
  pendingApprovers: Array<{
    customer: { id: string; typeId: 'customer' };
  }>;
  currentTierPendingApprovers: Array<{
    customer: { id: string; typeId: 'customer' };
  }>;
  createdAt: string;
}

// ─── Purchase Lists (Shopping Lists) ──────────────────────────────
export interface PurchaseListLineItem {
  id: string;
  productId: string;
  name: Record<string, string>;
  variant: {
    id: number;
    sku?: string;
    images?: ProductImage[];
  };
  quantity: number;
  addedAt: string;
}

export interface PurchaseList {
  id: string;
  version: number;
  key?: string;
  name: Record<string, string>;
  description?: Record<string, string>;
  customer?: { id: string; typeId: 'customer' };
  businessUnit?: { key: string; typeId: 'business-unit' };
  store?: { key: string; typeId: 'store' };
  lineItems: PurchaseListLineItem[];
  createdAt: string;
  lastModifiedAt: string;
}

// ─── Products ──────────────────────────────────────────────────────
export interface Product {
  id: string;
  key?: string;
  name: Record<string, string>;
  slug: Record<string, string>;
  description?: Record<string, string>;
  categories: Array<{ id: string; typeId: 'category' }>;
  masterVariant: ProductVariant;
  variants: ProductVariant[];
}

export interface ProductVariant {
  id: number;
  sku?: string;
  key?: string;
  prices?: Array<{
    id: string;
    value: Money;
    country?: string;
    channel?: { id: string; typeId: 'channel' };
    customerGroup?: { id: string; typeId: 'customer-group' };
  }>;
  /** Embedded price selected by priceChannel/priceCurrency query params */
  price?: {
    id?: string;
    value: Money;
    channel?: { id: string; typeId: 'channel' };
  };
  images?: ProductImage[];
  attributes?: Array<{
    name: string;
    value: unknown;
  }>;
  availability?: {
    isOnStock?: boolean;
    availableQuantity?: number;
  };
}

export interface Category {
  id: string;
  key?: string;
  name: Record<string, string>;
  slug: Record<string, string>;
  description?: Record<string, string>;
  parent?: { id: string; typeId: 'category' };
  ancestors: Array<{ id: string; typeId: 'category' }>;
  orderHint?: string;
}

// ─── Session ───────────────────────────────────────────────────────
export interface SessionData {
  customerId?: string;
  customerEmail?: string;
  customerFirstName?: string;
  customerLastName?: string;
  cartId?: string;
  businessUnitKey?: string;
  storeKey?: string;
  supplyChannelId?: string;
  locale?: string;
  currency?: string;
}

// ─── Wishlists (Personal) ─────────────────────────────────────────
export interface WishlistLineItem {
  id: string;
  productId: string;
  name: Record<string, string>;
  variant: {
    id: number;
    sku?: string;
    images?: ProductImage[];
  };
  quantity: number;
  addedAt: string;
}

export interface Wishlist {
  id: string;
  version: number;
  key?: string;
  name: Record<string, string>;
  description?: Record<string, string>;
  customer?: { id: string; typeId: 'customer' };
  lineItems: WishlistLineItem[];
  createdAt: string;
  lastModifiedAt: string;
}

// ─── Recurring Orders ─────────────────────────────────────────────
export type RecurringOrderState = 'Active' | 'Paused' | 'Canceled' | 'Expired';
export type IntervalUnit = 'Days' | 'Weeks' | 'Months';

export interface RecurrencePolicySchedule {
  type: 'standard';
  value: number;
  intervalUnit: IntervalUnit;
}

export interface RecurrencePolicy {
  id: string;
  key?: string;
  name: string;
  schedule: RecurrencePolicySchedule;
  createdAt: string;
}

export interface RecurringOrder {
  id: string;
  version: number;
  businessUnitKey: string;
  customerId: string;
  originOrderId: string;
  state: RecurringOrderState;
  schedule: RecurrencePolicySchedule;
  startsAt: string;
  nextOrderAt?: string;
  lastOrderAt?: string;
  resumesAt?: string;
  createdAt: string;
  orderSnapshot: {
    totalPrice: Money;
    lineItems: { name: Record<string, string>; quantity: number }[];
  };
}

// ─── Paginated Response ────────────────────────────────────────────
export interface PaginatedResult<T> {
  results: T[];
  total: number;
  offset: number;
  limit: number;
}
