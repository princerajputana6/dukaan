import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
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
    sku: { type: String, trim: true, index: true, default: "" },
    barcode: { type: String, trim: true, default: "" },
    // Optional product photo, stored as a small resized JPEG data URL.
    image: { type: String, default: "" },
    category: { type: String, trim: true, default: "Uncategorized" },
    unit: { type: String, default: "pcs" }, // pcs, pack, box, kg, ltr
    costPrice: { type: Number, default: 0, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10, min: 0 },
    supplier: { type: String, trim: true, default: "" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ProductSchema.virtual("isLowStock").get(function () {
  return this.stock <= this.lowStockThreshold;
});

ProductSchema.set("toJSON", { virtuals: true });
ProductSchema.set("toObject", { virtuals: true });

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
