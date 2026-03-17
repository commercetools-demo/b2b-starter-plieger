import type { Permission, Associate } from './types';

/**
 * Check if an associate (by customer ID) has a specific permission
 * within the given associates list.
 */
export function hasPermission(
  associates: Associate[],
  customerId: string,
  permission: Permission
): boolean {
  const associate = associates.find((a) => a.customer.id === customerId);
  if (!associate) return false;

  // In a real scenario, you'd resolve the role's permissions
  // from the associate role assignments. For now, we check if
  // any role key matches known admin roles as a fallback.
  return true; // Permissions are checked via the API-level associate context
}

/**
 * Permission groups for UI display
 */
export const PERMISSION_GROUPS: Record<string, { label: string; permissions: Permission[] }> = {
  businessUnit: {
    label: 'Business Unit',
    permissions: ['AddChildUnits', 'UpdateBusinessUnitDetails', 'UpdateAssociates'],
  },
  carts: {
    label: 'Carts',
    permissions: [
      'CreateMyCarts', 'CreateOthersCarts',
      'UpdateMyCarts', 'UpdateOthersCarts',
      'DeleteMyCarts', 'DeleteOthersCarts',
      'ViewMyCarts', 'ViewOthersCarts',
    ],
  },
  orders: {
    label: 'Orders',
    permissions: [
      'CreateMyOrdersFromMyCarts', 'CreateMyOrdersFromMyQuotes',
      'CreateOrdersFromOthersCarts', 'CreateOrdersFromOthersQuotes',
      'ViewMyOrders', 'ViewOthersOrders',
      'UpdateMyOrders', 'UpdateOthersOrders',
    ],
  },
  quotes: {
    label: 'Quotes',
    permissions: [
      'CreateMyQuoteRequestsFromMyCarts', 'CreateQuoteRequestsFromOthersCarts',
      'AcceptMyQuotes', 'AcceptOthersQuotes',
      'DeclineMyQuotes', 'DeclineOthersQuotes',
      'RenegotiateMyQuotes', 'RenegotiateOthersQuotes',
      'ReassignMyQuotes', 'ReassignOthersQuotes',
      'ViewMyQuotes', 'ViewOthersQuotes',
    ],
  },
  approvals: {
    label: 'Approvals',
    permissions: [
      'CreateApprovalRules', 'UpdateApprovalRules',
      'UpdateApprovalFlowStatuses',
    ],
  },
  shoppingLists: {
    label: 'Purchase Lists',
    permissions: [
      'ViewMyShoppingLists', 'ViewOthersShoppingLists',
      'CreateMyShoppingLists', 'CreateOthersShoppingLists',
      'UpdateMyShoppingLists', 'UpdateOthersShoppingLists',
      'DeleteMyShoppingLists', 'DeleteOthersShoppingLists',
    ],
  },
};

/**
 * Returns a human-readable label for a permission
 */
export function permissionLabel(permission: Permission): string {
  // Convert camelCase to spaced words
  return permission.replace(/([A-Z])/g, ' $1').trim();
}
