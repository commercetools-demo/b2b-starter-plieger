import { apiRoot, projectKey } from "./ct-admin.mjs";

// ── Inline setup functions (avoid top-level side effects from imports) ──

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

async function ensureStore(key, name) {
  try {
    const existing = await apiRoot.stores().withKey({ key }).get().execute();
    console.log(`  Store "${name}" already exists (key: ${key})`);
    return existing.body;
  } catch (err) {
    if (err.statusCode === 404) {
      const result = await apiRoot
        .stores()
        .post({
          body: {
            key,
            name: { en: name },
            languages: ["en"],
            countries: [{ code: "US" }],
          },
        })
        .execute();
      console.log(`  Created store "${name}" (key: ${key})`);
      return result.body;
    }
    throw err;
  }
}

async function ensureBusinessUnit(draft) {
  try {
    const existing = await apiRoot
      .businessUnits()
      .withKey({ key: draft.key })
      .get()
      .execute();
    console.log(`  Business unit "${draft.name}" already exists (key: ${draft.key})`);
    return existing.body;
  } catch (err) {
    if (err.statusCode === 404) {
      const result = await apiRoot
        .businessUnits()
        .post({ body: draft })
        .execute();
      console.log(`  Created business unit "${draft.name}" (key: ${draft.key})`);
      return result.body;
    }
    throw err;
  }
}

async function ensureCustomer(email, firstName, lastName, password) {
  try {
    const result = await apiRoot
      .customers()
      .get({
        queryArgs: {
          where: `email="${email}"`,
          limit: 1,
        },
      })
      .execute();

    if (result.body.count > 0) {
      console.log(`  Customer "${email}" already exists`);
      return result.body.results[0];
    }
  } catch (err) {
    // Continue to create
  }

  try {
    const result = await apiRoot
      .customers()
      .post({
        body: {
          email,
          firstName,
          lastName,
          password,
        },
      })
      .execute();
    console.log(`  Created customer "${email}"`);
    return result.body.customer;
  } catch (err) {
    if (err.statusCode === 400 && err.message?.includes("already exists")) {
      console.log(`  Customer "${email}" already exists`);
      const existing = await apiRoot
        .customers()
        .get({
          queryArgs: { where: `email="${email}"`, limit: 1 },
        })
        .execute();
      return existing.body.results[0];
    }
    throw err;
  }
}

async function addAssociateToBU(businessUnitKey, customerId, roleKey) {
  const bu = await apiRoot
    .businessUnits()
    .withKey({ key: businessUnitKey })
    .get()
    .execute();

  const existingAssociate = bu.body.associates?.find(
    (a) => a.customer?.id === customerId
  );

  if (existingAssociate) {
    console.log(
      `  Customer ${customerId} already associated with BU "${businessUnitKey}"`
    );
    return bu.body;
  }

  const result = await apiRoot
    .businessUnits()
    .withKey({ key: businessUnitKey })
    .post({
      body: {
        version: bu.body.version,
        actions: [
          {
            action: "addAssociate",
            associate: {
              customer: {
                id: customerId,
                typeId: "customer",
              },
              associateRoleAssignments: [
                {
                  associateRole: {
                    key: roleKey,
                    typeId: "associate-role",
                  },
                  inheritance: "Enabled",
                },
              ],
            },
          },
        ],
      },
    })
    .execute();

  console.log(
    `  Added customer ${customerId} as "${roleKey}" to BU "${businessUnitKey}"`
  );
  return result.body;
}

// ── Role definitions ──

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

// ── Main seed script ──

async function run() {
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║   B2B Starter - Sample Data Seeder      ║");
  console.log("╚══════════════════════════════════════════╝\n");

  // Step 1: Associate Roles
  console.log("Step 1: Setting up associate roles...");
  for (const role of ROLES) {
    await ensureAssociateRole(role);
  }

  // Step 2: Stores and Business Units
  console.log("\nStep 2: Setting up stores and business units...");
  await ensureStore("acme-corp", "Acme Corporation Store");
  await ensureStore("acme-west", "Acme West Store");
  await ensureStore("acme-east", "Acme East Store");

  await ensureBusinessUnit({
    key: "acme-corp",
    name: "Acme Corporation",
    unitType: "Company",
    status: "Active",
    storeMode: "Explicit",
    stores: [{ key: "acme-corp", typeId: "store" }],
    addresses: [
      {
        country: "US",
        city: "San Francisco",
        state: "CA",
        streetName: "100 Market Street",
        postalCode: "94105",
      },
    ],
  });

  await ensureBusinessUnit({
    key: "acme-west",
    name: "Acme West",
    unitType: "Division",
    status: "Active",
    storeMode: "Explicit",
    parentUnit: { key: "acme-corp", typeId: "business-unit" },
    stores: [{ key: "acme-west", typeId: "store" }],
    addresses: [
      {
        country: "US",
        city: "Los Angeles",
        state: "CA",
        streetName: "200 Wilshire Blvd",
        postalCode: "90025",
      },
    ],
  });

  await ensureBusinessUnit({
    key: "acme-east",
    name: "Acme East",
    unitType: "Division",
    status: "Active",
    storeMode: "Explicit",
    parentUnit: { key: "acme-corp", typeId: "business-unit" },
    stores: [{ key: "acme-east", typeId: "store" }],
    addresses: [
      {
        country: "US",
        city: "New York",
        state: "NY",
        streetName: "300 Fifth Avenue",
        postalCode: "10001",
      },
    ],
  });

  // Step 3: Sample Customers
  console.log("\nStep 3: Creating sample customers...");
  const adminCustomer = await ensureCustomer(
    "admin@acme.com",
    "Alice",
    "Admin",
    "Password123!"
  );
  const buyerCustomer = await ensureCustomer(
    "buyer@acme.com",
    "Bob",
    "Buyer",
    "Password123!"
  );
  const approverCustomer = await ensureCustomer(
    "approver@acme.com",
    "Carol",
    "Approver",
    "Password123!"
  );

  // Step 4: Associate Customers with Business Units
  console.log("\nStep 4: Associating customers with business units...");
  await addAssociateToBU("acme-corp", adminCustomer.id, "admin");
  await addAssociateToBU("acme-corp", buyerCustomer.id, "buyer");
  await addAssociateToBU("acme-corp", approverCustomer.id, "approver");

  // Step 5: Approval Rules (informational)
  console.log("\nStep 5: Approval rules...");
  console.log(
    "  Note: Approval rules require an associate context and may need to be"
  );
  console.log(
    "  created via the Merchant Center or the storefront after login."
  );
  console.log(
    "  Run `node setup-approval-rules.mjs` separately if needed."
  );

  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║   Seed complete!                         ║");
  console.log("╠══════════════════════════════════════════╣");
  console.log("║                                          ║");
  console.log("║   Sample accounts:                       ║");
  console.log('║   admin@acme.com    / Password123!       ║');
  console.log('║   buyer@acme.com    / Password123!       ║');
  console.log('║   approver@acme.com / Password123!       ║');
  console.log("║                                          ║");
  console.log("╚══════════════════════════════════════════╝\n");
}

run().catch((err) => {
  console.error("Seed failed:", err.message || err);
  process.exit(1);
});
