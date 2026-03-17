import { apiRoot, projectKey } from "./ct-admin.mjs";

const APPROVAL_RULE_KEY = "high-value-order-approval";

async function run() {
  console.log("\n=== Setting up Approval Rules ===\n");

  // Fetch the buyer and approver roles
  let buyerRole, approverRole;
  try {
    buyerRole = (
      await apiRoot.associateRoles().withKey({ key: "buyer" }).get().execute()
    ).body;
    approverRole = (
      await apiRoot.associateRoles().withKey({ key: "approver" }).get().execute()
    ).body;
  } catch (err) {
    console.error(
      "  Could not find buyer/approver roles. Run setup-associate-roles.mjs first."
    );
    throw err;
  }

  // Fetch the Acme Corp business unit
  let acmeCorp;
  try {
    acmeCorp = (
      await apiRoot
        .businessUnits()
        .withKey({ key: "acme-corp" })
        .get()
        .execute()
    ).body;
  } catch (err) {
    console.error(
      "  Could not find Acme Corp business unit. Run setup-business-units.mjs first."
    );
    throw err;
  }

  // Fetch the store for Acme Corp
  let store;
  try {
    store = (
      await apiRoot.stores().withKey({ key: "acme-corp" }).get().execute()
    ).body;
  } catch (err) {
    console.error(
      "  Could not find acme-corp store. Run setup-business-units.mjs first."
    );
    throw err;
  }

  // Check if approval rule already exists by querying
  try {
    const existing = await apiRoot
      .asAssociate()
      .withAssociateIdValue({ associateId: "placeholder" })
      .inBusinessUnitKeyWithBusinessUnitKeyValue({
        businessUnitKey: "acme-corp",
      })
      .approvalRules()
      .get({
        queryArgs: {
          where: `key="${APPROVAL_RULE_KEY}"`,
        },
      })
      .execute();

    if (existing.body.count > 0) {
      console.log(
        `  Approval rule "High Value Order Approval" already exists (key: ${APPROVAL_RULE_KEY})`
      );
      console.log("\nApproval rules setup complete!\n");
      return;
    }
  } catch (err) {
    // If the query fails, we'll try to create the rule anyway
  }

  // Create approval rule in the Acme Corp business unit context
  try {
    const result = await apiRoot
      .inStoreKeyWithStoreKeyValue({ storeKey: "acme-corp" })
      .asAssociate()
      .withAssociateIdValue({ associateId: "placeholder" })
      .inBusinessUnitKeyWithBusinessUnitKeyValue({
        businessUnitKey: "acme-corp",
      })
      .approvalRules()
      .post({
        body: {
          key: APPROVAL_RULE_KEY,
          name: "High Value Order Approval",
          description:
            "Orders over $1,000 require approval from an approver",
          status: "Active",
          predicate: "order.totalPrice.centAmount > 100000",
          requesters: [
            {
              associateRole: {
                key: "buyer",
                typeId: "associate-role",
              },
            },
          ],
          approvers: {
            tiers: [
              {
                and: [
                  {
                    associateRole: {
                      key: "approver",
                      typeId: "associate-role",
                    },
                  },
                ],
              },
            ],
          },
        },
      })
      .execute();

    console.log(
      `  Created approval rule "High Value Order Approval" (key: ${APPROVAL_RULE_KEY})`
    );
  } catch (err) {
    if (err.statusCode === 400 && err.message?.includes("already exists")) {
      console.log(
        `  Approval rule "High Value Order Approval" already exists (key: ${APPROVAL_RULE_KEY})`
      );
    } else {
      console.error(
        "  Note: Approval rule creation requires an actual associate context."
      );
      console.error(
        "  You may need to create approval rules via the Merchant Center or after seeding associates."
      );
      console.error(`  Error: ${err.message || err}`);
    }
  }

  console.log("\nApproval rules setup complete!\n");
}

run().catch((err) => {
  console.error("Error setting up approval rules:", err.message || err);
  process.exit(1);
});

export { run as setupApprovalRules };
