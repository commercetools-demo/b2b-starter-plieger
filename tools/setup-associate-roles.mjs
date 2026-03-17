import { apiRoot, projectKey } from "./ct-admin.mjs";

const ROLES = [
  {
    key: "admin",
    name: "Admin",
    buyerAssignable: true,
    permissions: [
      "AddChildUnits",
      "UpdateAssociates",
      "UpdateBusinessUnitDetails",
      "UpdateParentUnit",
      "ViewMyCarts",
      "ViewOthersCarts",
      "CreateMyCarts",
      "CreateOthersCarts",
      "UpdateMyCarts",
      "UpdateOthersCarts",
      "DeleteMyCarts",
      "DeleteOthersCarts",
      "ViewMyOrders",
      "ViewOthersOrders",
      "CreateMyOrdersFromMyCarts",
      "CreateMyOrdersFromMyQuotes",
      "CreateOrdersFromOthersCarts",
      "CreateOrdersFromOthersQuotes",
      "ViewMyQuotes",
      "ViewOthersQuotes",
      "CreateMyQuoteRequestsFromMyCarts",
      "CreateQuoteRequestsFromOthersCarts",
      "AcceptMyQuotes",
      "AcceptOthersQuotes",
      "DeclineMyQuotes",
      "DeclineOthersQuotes",
      "RenegotiateMyQuotes",
      "RenegotiateOthersQuotes",
      "ReassignMyQuotes",
      "ReassignOthersQuotes",
      "ViewMyShoppingLists",
      "ViewOthersShoppingLists",
      "CreateMyShoppingLists",
      "CreateOthersShoppingLists",
      "UpdateMyShoppingLists",
      "UpdateOthersShoppingLists",
      "DeleteMyShoppingLists",
      "DeleteOthersShoppingLists",
      "UpdateApprovalFlowStatuses",
      "CreateApprovalRules",
      "UpdateApprovalRules",
    ],
  },
  {
    key: "buyer",
    name: "Buyer",
    buyerAssignable: true,
    permissions: [
      "CreateMyCarts",
      "UpdateMyCarts",
      "ViewMyCarts",
      "DeleteMyCarts",
      "CreateMyOrdersFromMyCarts",
      "CreateMyOrdersFromMyQuotes",
      "ViewMyOrders",
      "CreateMyQuoteRequestsFromMyCarts",
      "AcceptMyQuotes",
      "DeclineMyQuotes",
      "RenegotiateMyQuotes",
      "ViewMyQuotes",
      "ViewMyShoppingLists",
      "CreateMyShoppingLists",
      "UpdateMyShoppingLists",
      "DeleteMyShoppingLists",
    ],
  },
  {
    key: "approver",
    name: "Approver",
    buyerAssignable: true,
    permissions: [
      "CreateMyCarts",
      "UpdateMyCarts",
      "ViewMyCarts",
      "DeleteMyCarts",
      "CreateMyOrdersFromMyCarts",
      "CreateMyOrdersFromMyQuotes",
      "ViewMyOrders",
      "CreateMyQuoteRequestsFromMyCarts",
      "AcceptMyQuotes",
      "DeclineMyQuotes",
      "RenegotiateMyQuotes",
      "ViewMyQuotes",
      "ViewMyShoppingLists",
      "CreateMyShoppingLists",
      "UpdateMyShoppingLists",
      "DeleteMyShoppingLists",
      "UpdateApprovalFlowStatuses",
      "ViewOthersOrders",
      "ViewOthersQuotes",
      "ViewOthersShoppingLists",
    ],
  },
];

async function ensureAssociateRole(role) {
  try {
    const existing = await apiRoot
      .associateRoles()
      .withKey({ key: role.key })
      .get()
      .execute();
    console.log(`  Associate role "${role.name}" already exists (key: ${role.key})`);
    return existing.body;
  } catch (err) {
    if (err.statusCode === 404) {
      const result = await apiRoot
        .associateRoles()
        .post({
          body: {
            key: role.key,
            name: role.name,
            buyerAssignable: role.buyerAssignable,
            permissions: role.permissions,
          },
        })
        .execute();
      console.log(`  Created associate role "${role.name}" (key: ${role.key})`);
      return result.body;
    }
    throw err;
  }
}

async function run() {
  console.log("\n=== Setting up Associate Roles ===\n");

  for (const role of ROLES) {
    await ensureAssociateRole(role);
  }

  console.log("\nAssociate roles setup complete!\n");
}

run().catch((err) => {
  console.error("Error setting up associate roles:", err.message || err);
  process.exit(1);
});

export { run as setupAssociateRoles };
