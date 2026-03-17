import { apiRoot, projectKey } from "./ct-admin.mjs";

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

async function run() {
  console.log("\n=== Setting up Business Units ===\n");

  // Create stores
  console.log("Creating stores...");
  const acmeCorpStore = await ensureStore("acme-corp", "Acme Corporation Store");
  const acmeWestStore = await ensureStore("acme-west", "Acme West Store");
  const acmeEastStore = await ensureStore("acme-east", "Acme East Store");

  // Create Company: Acme Corporation
  console.log("\nCreating business units...");
  const acmeCorp = await ensureBusinessUnit({
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

  // Create Division: Acme West
  const acmeWest = await ensureBusinessUnit({
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

  // Create Division: Acme East
  const acmeEast = await ensureBusinessUnit({
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

  console.log("\nBusiness unit setup complete!\n");
}

run().catch((err) => {
  console.error("Error setting up business units:", err.message || err);
  process.exit(1);
});

export { run as setupBusinessUnits };
