import mongoose from "mongoose";

const PLAN_LIMITS = { starter: 1, growth: 3, enterprise: 10 };

const BusinessSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    gstin: { type: String, trim: true, default: "" },
    // Plan controls how many stores the owner may create.
    plan: {
      type: String,
      enum: ["starter", "growth", "enterprise"],
      default: "starter",
    },
    storeLimit: { type: Number, default: 1, min: 1 },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

BusinessSchema.statics.PLAN_LIMITS = PLAN_LIMITS;

export default mongoose.models.Business ||
  mongoose.model("Business", BusinessSchema);
export { PLAN_LIMITS };
