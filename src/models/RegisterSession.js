import mongoose from "mongoose";

// A cash-register session (Odoo-style): opened with a float, closed with a
// counted amount and reconciled against expected cash.
const RegisterSessionSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    cashier: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cashierName: { type: String, default: "" },
    openingCash: { type: Number, default: 0 },
    openedAt: { type: Date, default: Date.now },
    closingCash: { type: Number, default: null },
    closedAt: { type: Date, default: null },
    // captured at close for the record
    cashSales: { type: Number, default: 0 },
    otherSales: { type: Number, default: 0 },
    ordersCount: { type: Number, default: 0 },
    expectedCash: { type: Number, default: 0 },
    difference: { type: Number, default: 0 },
    note: { type: String, default: "" },
    status: { type: String, enum: ["open", "closed"], default: "open", index: true },
  },
  { timestamps: true }
);

export default mongoose.models.RegisterSession ||
  mongoose.model("RegisterSession", RegisterSessionSchema);
