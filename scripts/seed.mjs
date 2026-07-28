import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";

// Load env from .env.local
try {
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const MONGODB_URI = process.env.MONGODB_URI;

const S = (obj) => new mongoose.Schema(obj, { strict: false, timestamps: true });
const Business = mongoose.model("Business", S({}));
const Store = mongoose.model("Store", S({}));
const User = mongoose.model("User", S({}));
const Category = mongoose.model("Category", S({}));
const Product = mongoose.model("Product", S({}));
const Sale = mongoose.model("Sale", S({}));
const UpgradeRequest = mongoose.model("UpgradeRequest", S({}));
const AccountRequest = mongoose.model("AccountRequest", S({}));

const categories = [
  { name: "Cigarettes", description: "Loose & pack cigarettes", color: "#555663" },
  { name: "Pan & Tobacco", description: "Pan masala, gutka, tobacco", color: "#E0A23B" },
  { name: "Beverages", description: "Cold drinks, water, juice", color: "#2F7EDA" },
  { name: "Snacks", description: "Chips, biscuits, namkeen", color: "#2E9E6B" },
  { name: "Confectionery", description: "Chocolates, candy, mints", color: "#D9534F" },
  { name: "Groceries", description: "Daily essentials", color: "#9FA0B5" },
];

const products = [
  { name: "Gold Flake Kings", category: "Cigarettes", unit: "pack", costPrice: 300, sellingPrice: 340, stock: 24, lowStockThreshold: 10 },
  { name: "Classic Milds", category: "Cigarettes", unit: "pack", costPrice: 310, sellingPrice: 350, stock: 8, lowStockThreshold: 10 },
  { name: "Marlboro Advance", category: "Cigarettes", unit: "pack", costPrice: 320, sellingPrice: 360, stock: 15, lowStockThreshold: 8 },
  { name: "Wills Navy Cut", category: "Cigarettes", unit: "pack", costPrice: 180, sellingPrice: 210, stock: 4, lowStockThreshold: 10 },
  { name: "Rajnigandha Pan Masala", category: "Pan & Tobacco", unit: "pcs", costPrice: 8, sellingPrice: 10, stock: 120, lowStockThreshold: 30 },
  { name: "Vimal Pan Masala", category: "Pan & Tobacco", unit: "pcs", costPrice: 4, sellingPrice: 5, stock: 200, lowStockThreshold: 50 },
  { name: "Pass Pass Sweet Supari", category: "Pan & Tobacco", unit: "pcs", costPrice: 3, sellingPrice: 5, stock: 18, lowStockThreshold: 25 },
  { name: "Coca Cola 750ml", category: "Beverages", unit: "pcs", costPrice: 35, sellingPrice: 45, stock: 36, lowStockThreshold: 12 },
  { name: "Thums Up 750ml", category: "Beverages", unit: "pcs", costPrice: 35, sellingPrice: 45, stock: 6, lowStockThreshold: 12 },
  { name: "Bisleri Water 1L", category: "Beverages", unit: "pcs", costPrice: 12, sellingPrice: 20, stock: 48, lowStockThreshold: 24 },
  { name: "Red Bull 250ml", category: "Beverages", unit: "pcs", costPrice: 100, sellingPrice: 125, stock: 14, lowStockThreshold: 6 },
  { name: "Lays Classic Salted", category: "Snacks", unit: "pcs", costPrice: 15, sellingPrice: 20, stock: 40, lowStockThreshold: 15 },
  { name: "Kurkure Masala Munch", category: "Snacks", unit: "pcs", costPrice: 15, sellingPrice: 20, stock: 9, lowStockThreshold: 15 },
  { name: "Parle-G Biscuit", category: "Snacks", unit: "pcs", costPrice: 8, sellingPrice: 10, stock: 60, lowStockThreshold: 20 },
  { name: "Dairy Milk 40g", category: "Confectionery", unit: "pcs", costPrice: 35, sellingPrice: 45, stock: 25, lowStockThreshold: 10 },
  { name: "Mentos Roll", category: "Confectionery", unit: "pcs", costPrice: 8, sellingPrice: 10, stock: 3, lowStockThreshold: 12 },
  { name: "Center Fresh", category: "Confectionery", unit: "pcs", costPrice: 1, sellingPrice: 2, stock: 300, lowStockThreshold: 100 },
  { name: "Amul Milk 500ml", category: "Groceries", unit: "pcs", costPrice: 27, sellingPrice: 30, stock: 20, lowStockThreshold: 10 },
  { name: "Maggi Noodles 70g", category: "Groceries", unit: "pcs", costPrice: 12, sellingPrice: 14, stock: 45, lowStockThreshold: 15 },
  { name: "Tata Salt 1kg", category: "Groceries", unit: "pcs", costPrice: 22, sellingPrice: 28, stock: 12, lowStockThreshold: 6 },
];

async function run() {
  if (!MONGODB_URI) throw new Error("MONGODB_URI not set");
  await mongoose.connect(MONGODB_URI);

  // Drop collections entirely so any stale indexes from earlier schemas are cleared.
  const db = mongoose.connection.db;
  const existing = (await db.listCollections().toArray()).map((c) => c.name);
  for (const name of [
    "businesses",
    "stores",
    "users",
    "categories",
    "products",
    "sales",
    "upgraderequests",
    "accountrequests",
  ]) {
    if (existing.includes(name)) await db.collection(name).drop();
  }

  const hash = (pw) => bcrypt.hashSync(pw, 10);

  // 1. Super admin (platform operator)
  const superadmin = await User.create({
    username: "superadmin",
    passwordHash: hash("super123"),
    name: "Platform Admin",
    role: "superadmin",
    business: null,
    stores: [],
    active: true,
  });

  // 2. Demo business + owner (admin)
  const business = await Business.create({
    name: "Sharma Pan & General Store",
    ownerName: "Rakesh Sharma",
    email: "rakesh@example.com",
    phone: "+91 98765 43210",
    address: "MG Road, Indore",
    plan: "growth",
    storeLimit: 3,
    status: "active",
    createdBy: superadmin._id,
  });

  const owner = await User.create({
    username: "sharma",
    passwordHash: hash("owner123"),
    name: "Rakesh Sharma",
    role: "admin",
    business: business._id,
    stores: [],
    active: true,
  });

  // 3. Two stores
  const store1 = await Store.create({
    business: business._id,
    name: "MG Road Outlet",
    code: "MG01",
    location: "MG Road, Indore",
    phone: "+91 98765 43210",
    active: true,
  });
  const store2 = await Store.create({
    business: business._id,
    name: "Station Road Outlet",
    code: "ST02",
    location: "Station Road, Indore",
    phone: "+91 98765 11122",
    active: true,
  });

  // 4. Manager assigned to store 1
  await User.create({
    username: "ramesh",
    passwordHash: hash("manager123"),
    name: "Ramesh Kumar",
    role: "manager",
    business: business._id,
    stores: [store1._id],
    active: true,
  });

  // 5. Categories + products for store 1
  await Category.insertMany(
    categories.map((c) => ({ ...c, business: business._id, store: store1._id }))
  );
  await Product.insertMany(
    products.map((p, i) => ({
      ...p,
      sku: `SKU${String(i + 1).padStart(3, "0")}`,
      barcode: `890${String(1000000000 + i).padStart(10, "0")}`,
      business: business._id,
      store: store1._id,
      active: true,
    }))
  );

  // A few products for store 2 so it isn't empty
  await Category.insertMany(
    categories.slice(0, 3).map((c) => ({ ...c, business: business._id, store: store2._id }))
  );
  await Product.insertMany(
    products.slice(0, 8).map((p, i) => ({
      ...p,
      sku: `ST2-${String(i + 1).padStart(3, "0")}`,
      business: business._id,
      store: store2._id,
      active: true,
    }))
  );

  // 6. A sample account request + upgrade request for the superadmin views
  await AccountRequest.create({
    businessName: "Gupta Provision Store",
    ownerName: "Anil Gupta",
    email: "anil@example.com",
    phone: "+91 90000 12345",
    storeCount: 2,
    message: "Looking to digitise my two kirana shops.",
    status: "new",
  });

  console.log("\n✅ Seed complete!\n");
  console.log("Login credentials:");
  console.log("  Super Admin  →  username: superadmin   password: super123");
  console.log("  Shop Owner   →  username: sharma       password: owner123");
  console.log("  Store Mgr    →  username: ramesh       password: manager123\n");

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
