import mongoose from "mongoose";

// Submitted from the public marketing site by prospective shop owners.
const AccountRequestSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: "" },
    storeCount: { type: Number, default: 1 },
    message: { type: String, default: "" },
    status: {
      type: String,
      enum: ["new", "contacted", "approved", "rejected"],
      default: "new",
    },
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.AccountRequest ||
  mongoose.model("AccountRequest", AccountRequestSchema);
