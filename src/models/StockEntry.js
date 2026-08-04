import mongoose from "mongoose";

// One record per inventory-addition event. Products only store the *current*
// stock level, so this log is what powers the daily/weekly/monthly "inventory
// added" views. Entries are written from every path that increases stock:
// creating a product (source "new"), restocking (source "restock"), receipt
// import (source "receipt") and positive manual adjustments (source "adjustment").
const StockEntrySchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      index: true,
    },
    // Denormalized so the log survives product edits/deletes.
    productName: { type: String, default: "" },
    sku: { type: String, default: "" },
    category: { type: String, default: "Uncategorized" },
    unit: { type: String, default: "pcs" },
    quantity: { type: Number, required: true }, // units added
    costPrice: { type: Number, default: 0 }, // per-unit cost at time of entry
    totalCost: { type: Number, default: 0 }, // quantity * costPrice
    source: {
      type: String,
      enum: ["new", "restock", "receipt", "adjustment"],
      default: "restock",
      index: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userName: { type: String, default: "" },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

// Primary access pattern: a store's additions over a time range.
StockEntrySchema.index({ store: 1, createdAt: -1 });

export default mongoose.models.StockEntry ||
  mongoose.model("StockEntry", StockEntrySchema);
