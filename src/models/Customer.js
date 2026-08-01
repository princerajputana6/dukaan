import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
    note: { type: String, default: "" },
    points: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    visits: { type: Number, default: 0 },
    lastVisit: { type: Date, default: null },
  },
  { timestamps: true }
);

// Phone is unique per store (when provided).
CustomerSchema.index({ store: 1, phone: 1 }, { unique: true, partialFilterExpression: { phone: { $type: "string", $ne: "" } } });

export default mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
