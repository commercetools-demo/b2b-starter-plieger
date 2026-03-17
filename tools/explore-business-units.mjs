import { apiRoot, projectKey } from "./ct-admin.mjs";

async function run() {
  console.log("\n=== Exploring Business Units ===\n");

  // Fetch all business units
  const businessUnitsResult = await apiRoot
    .businessUnits()
    .get({
      queryArgs: {
        limit: 100,
        expand: ["associates[*].customer", "stores[*]"],
      },
    })
    .execute();

  const businessUnits = businessUnitsResult.body.results;
  console.log(`Found ${businessUnits.length} business unit(s)\n`);

  for (const bu of businessUnits) {
    console.log("─".repeat(60));
    console.log(`Business Unit: ${bu.name}`);
    console.log(`  Key: ${bu.key}`);
    console.log(`  Type: ${bu.unitType}`);
    console.log(`  Status: ${bu.status}`);
    console.log(`  Store Mode: ${bu.storeMode}`);

    if (bu.parentUnit) {
      console.log(`  Parent: ${bu.parentUnit.key || bu.parentUnit.id}`);
    }

    // Addresses
    if (bu.addresses && bu.addresses.length > 0) {
      console.log(`  Addresses:`);
      for (const addr of bu.addresses) {
        console.log(
          `    - ${addr.streetName || ""}, ${addr.city || ""}, ${addr.state || ""} ${addr.postalCode || ""} ${addr.country || ""}`
        );
      }
    }

    // Stores
    if (bu.stores && bu.stores.length > 0) {
      console.log(`  Stores:`);
      for (const store of bu.stores) {
        const storeName = store.obj?.name?.en || store.key || store.id;
        console.log(`    - ${storeName} (key: ${store.key || store.id})`);
      }
    }

    // Associates
    if (bu.associates && bu.associates.length > 0) {
      console.log(`  Associates:`);
      for (const assoc of bu.associates) {
        const customerName = assoc.customer?.obj
          ? `${assoc.customer.obj.firstName || ""} ${assoc.customer.obj.lastName || ""}`.trim()
          : assoc.customer?.id || "Unknown";
        const roles = assoc.associateRoleAssignments
          ?.map((r) => r.associateRole?.key || r.associateRole?.id)
          .join(", ");
        console.log(`    - ${customerName} [${roles || "no roles"}]`);
      }
    } else {
      console.log(`  Associates: none`);
    }

    console.log();
  }

  // Fetch associate roles
  console.log("─".repeat(60));
  console.log("\n=== Associate Roles ===\n");

  const rolesResult = await apiRoot
    .associateRoles()
    .get({ queryArgs: { limit: 50 } })
    .execute();

  for (const role of rolesResult.body.results) {
    console.log(`Role: ${role.name} (key: ${role.key})`);
    console.log(`  Buyer Assignable: ${role.buyerAssignable}`);
    console.log(`  Permissions (${role.permissions.length}):`);
    for (const perm of role.permissions) {
      console.log(`    - ${perm}`);
    }
    console.log();
  }

  console.log("Exploration complete!\n");
}

run().catch((err) => {
  console.error("Error exploring business units:", err.message || err);
  process.exit(1);
});
