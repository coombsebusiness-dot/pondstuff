import {
  syncPartnerBoostProducts,
} from "../lib/affiliate/syncPartnerBoostProducts";

async function main() {
  console.log(
    "🐟 Fetching and syncing POPOSOAP UK products...",
  );

  const result =
    await syncPartnerBoostProducts();

  console.log("");
  console.log("=== SYNC COMPLETE ===");
  console.log(`Received: ${result.received}`);
  console.log(`Synced:   ${result.synced}`);
  console.log(`Brand:    ${result.brandId}`);
  console.log(`Time:     ${result.syncedAt}`);
}

main().catch((error) => {
  console.error("❌ PartnerBoost sync failed:");
  console.error(error);
  process.exit(1);
});
