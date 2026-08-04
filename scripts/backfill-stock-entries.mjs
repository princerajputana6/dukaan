import mongoose from "mongoose";
import { readFileSync } from "node:fs";

// One-time seed: existing products predate the StockEntry log, so their opening
// stock never got recorded. This creates a single "new" entry per product
// (dated at the product's createdAt) so the Inventory Added views show history.
//
// Idempotent: products that already have any StockEntry are skipped, so it is
// safe to re-run. Usage: node scripts/backfill-stock-entries.mjs

// Load env from .env.local (same approach as seed.mjs).
try {
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not set (checked env and .env.local)");
  process.exit(1);
}

const S = (obj) => new mongoose.Schema(obj, { strict: false, timestamps: true });
const Product = mongoose.models.Product || mongoose.model("Product", S({}));
const StockEntry =
  mongoose.models.StockEntry || mongoose.model("StockEntry", S({}));

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.");

  const products = await Product.find({}).lean();
  console.log(`Found ${products.length} products.`);

  // Skip any product that already has a stock entry (idempotency).
  const existing = await StockEntry.distinct("product");
  const seen = new Set(existing.map((id) => String(id)));

  const now = new Date();
  const docs = [];
  for (const p of products) {
    if (seen.has(String(p._id))) continue;
    const qty = Number(p.stock) || 0;
    if (qty <= 0) continue;
    const costPrice = Number(p.costPrice) || 0;
    const when = p.createdAt ? new Date(p.createdAt) : now;
    docs.push({
      business: p.business,
      store: p.store,
      product: p._id,
      productName: p.name || "",
      sku: p.sku || "",
      category: p.category || "Uncategorized",
      unit: p.unit || "pcs",
      quantity: qty,
      costPrice,
      totalCost: Math.round(qty * costPrice * 100) / 100,
      source: "new",
      userName: "",
      note: "Backfilled from opening stock",
      createdAt: when,
      updatedAt: when,
    });
  }

  if (docs.length === 0) {
    console.log("Nothing to backfill — all products already logged or have no stock.");
  } else {
    // Insert raw so the provided createdAt is preserved (schema timestamps
    // would otherwise overwrite it with "now").
    await mongoose.connection.collection("stockentries").insertMany(docs);
    console.log(`Backfilled ${docs.length} stock entries.`);
  }

  await mongoose.disconnect();
  console.log("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
