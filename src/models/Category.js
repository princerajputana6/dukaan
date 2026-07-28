import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
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
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    color: { type: String, default: "#2F7EDA" },
  },
  { timestamps: true }
);

// name is unique per store, not globally
CategorySchema.index({ store: 1, name: 1 }, { unique: true });

export default mongoose.models.Category ||
  mongoose.model("Category", CategorySchema);
