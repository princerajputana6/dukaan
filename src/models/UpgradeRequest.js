import mongoose from "mongoose";

const UpgradeRequestSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    businessName: String,
    currentLimit: Number,
    requestedLimit: { type: Number, required: true },
    reason: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    handledAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.UpgradeRequest ||
  mongoose.model("UpgradeRequest", UpgradeRequestSchema);
