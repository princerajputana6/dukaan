import dns from "node:dns";
// Some environments fail the Atlas SRV lookup on the default resolver; use public DNS.
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import { readFileSync, writeFileSync } from "node:fs";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

// Load env from .env.local
try {
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const CATS = [
  { name: "Mumbai Street Food", color: "#E0A23B" },
  { name: "Idli & Vada", color: "#2E9E6B" },
  { name: "Uttapam", color: "#2F7EDA" },
  { name: "Dosa", color: "#D9534F" },
  { name: "Rava Dosa", color: "#7C5CFC" },
  { name: "Dosa Jee Special", color: "#12A366" },
  { name: "Others", color: "#9FA0B5" },
];

const MENU = [
  ["Butter Pav Bhaji", "Mumbai Street Food", 90],
  ["Paneer Pav Bhaji", "Mumbai Street Food", 110],
  ["Bun Muska With Amul Butter", "Mumbai Street Food", 50],
  ["Bun Muska With White Butter", "Mumbai Street Food", 70],
  ["Vada Pav", "Mumbai Street Food", 40],
  ["Schezwan Vada Pav", "Mumbai Street Food", 50],
  ["Cheese Vada Pav", "Mumbai Street Food", 60],

  ["Sambar Vada (2 Pcs)", "Idli & Vada", 100],
  ["Masala Idli (2 Pc)", "Idli & Vada", 150],
  ["Desi Ghee Roast Idli (2 Pc)", "Idli & Vada", 130],
  ["Desi Ghee Podi Idli (2 Pc)", "Idli & Vada", 140],
  ["Idli Sambar (2 Pc)", "Idli & Vada", 90],

  ["Onion Uttapam", "Uttapam", 130],
  ["Tomato Uttapam", "Uttapam", 130],
  ["Mix Veg Uttapam", "Uttapam", 150],
  ["Cheese Tomato Onion Uttapam", "Uttapam", 160],
  ["Paneer Uttapam", "Uttapam", 160],
  ["Cheese Paneer Uttapam", "Uttapam", 190],
  ["Cheese Mix Veg Uttapam", "Uttapam", 170],
  ["Special Mix Veg Uttapam", "Uttapam", 160],

  ["Plain Dosa", "Dosa", 100],
  ["Masala Dosa", "Dosa", 120],
  ["Butter Masala Dosa", "Dosa", 130],
  ["Onion Dosa", "Dosa", 120],
  ["Onion Masala Dosa", "Dosa", 140],
  ["Mysore Masala Dosa", "Dosa", 160],
  ["Desi Ghee Roast Masala Dosa", "Dosa", 150],
  ["Paneer Dosa", "Dosa", 160],
  ["Paneer Masala Dosa", "Dosa", 150],
  ["Set Dosa", "Dosa", 140],
  ["Cheese Dosa", "Dosa", 160],
  ["Cheese Masala Dosa", "Dosa", 170],

  ["Rava Plain Dosa", "Rava Dosa", 120],
  ["Rava Masala Dosa", "Rava Dosa", 150],
  ["Rava Butter Masala Dosa", "Rava Dosa", 160],
  ["Rava Onion Dosa", "Rava Dosa", 150],
  ["Rava Onion Masala Dosa", "Rava Dosa", 160],
  ["Rava Paneer Dosa", "Rava Dosa", 160],
  ["Rava Paneer Masala Dosa", "Rava Dosa", 170],
  ["Desi Ghee Roast Rava Masala Dosa", "Rava Dosa", 170],

  ["Schezwan Dosa", "Dosa Jee Special", 160],
  ["Veg Mexi Roll Dosa", "Dosa Jee Special", 190],
  ["Pizza Dosa", "Dosa Jee Special", 170],
  ["Desi Ghee Podi Dosa", "Dosa Jee Special", 150],

  ["Indori Poha", "Others", 60], // price not printed on flyer — estimate
];

const USERNAME = "dosajee";
const PASSWORD = "dosajee123";
const now = () => new Date();

const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });

async function main() {
  await client.connect();
  const db = client.db();

  if (await db.collection("users").findOne({ username: USERNAME })) {
    console.log(`User "${USERNAME}" already exists. Aborting to avoid duplicates.`);
    return;
  }

  const businessId = new ObjectId();
  const storeId = new ObjectId();
  const ownerId = new ObjectId();

  await db.collection("businesses").insertOne({
    _id: businessId,
    name: "Dosa Jee",
    ownerName: "Dosa Jee",
    email: "himanshushivgotra2@gmail.com",
    phone: "9897709909",
    address: "Shop No.2, Supertech Eco Village-1, Main Market Chatorigali, Noida Extension",
    type: "food",
    gstin: "",
    fssai: "",
    gstRate: 5,
    pricesIncludeTax: true,
    receiptFooter: "Thank you! Visit again — Dosa Jee | 9897709909, 9557572648",
    plan: "growth",
    storeLimit: 3,
    status: "active",
    createdAt: now(),
    updatedAt: now(),
  });

  await db.collection("stores").insertOne({
    _id: storeId,
    business: businessId,
    name: "Dosa Jee — Noida Extension",
    code: "DJ1",
    location: "Supertech Eco Village-1, Chatorigali, Noida Extension",
    phone: "9897709909",
    active: true,
    createdAt: now(),
    updatedAt: now(),
  });

  await db.collection("users").insertOne({
    _id: ownerId,
    username: USERNAME,
    passwordHash: bcrypt.hashSync(PASSWORD, 10),
    name: "Dosa Jee Owner",
    role: "admin",
    business: businessId,
    stores: [],
    active: true,
    lastLoginAt: null,
    createdAt: now(),
    updatedAt: now(),
  });

  await db.collection("categories").insertMany(
    CATS.map((c) => ({
      business: businessId,
      store: storeId,
      name: c.name,
      description: "",
      color: c.color,
      parent: null,
      createdAt: now(),
      updatedAt: now(),
    }))
  );

  const productDocs = MENU.map(([name, category, price]) => ({
    business: businessId,
    store: storeId,
    name,
    sku: "",
    barcode: "",
    category,
    unit: "plate",
    costPrice: Math.round(price * 0.4),
    sellingPrice: price,
    stock: 100,
    lowStockThreshold: 20,
    supplier: "",
    active: true,
    createdAt: now(),
    updatedAt: now(),
  }));
  await db.collection("products").insertMany(productDocs);

  const info = {
    businessId: String(businessId),
    storeId: String(storeId),
    ownerId: String(ownerId),
    username: USERNAME,
    password: PASSWORD,
    categories: CATS.length,
    products: productDocs.length,
  };
  writeFileSync(new URL("../.dosajee-info.json", import.meta.url), JSON.stringify(info, null, 2));
  console.log("CREATED Dosa Jee:\n" + JSON.stringify(info, null, 2));
}

main()
  .catch((e) => console.log("ERROR:", e.name, e.message.split("\n")[0]))
  .finally(async () => {
    await client.close().catch(() => {});
    process.exit(0);
  });
