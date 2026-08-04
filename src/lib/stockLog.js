import StockEntry from "@/models/StockEntry";

// Records an inventory-addition event for the daily/weekly/monthly log.
//
// Best-effort by design: logging must never fail the underlying stock write,
// so all errors are swallowed (and reported to the server console). Non-positive
// quantities are ignored — this log only tracks stock coming *in*.
export async function logStockEntry(scope, product, quantity, source, extra = {}) {
  try {
    const qty = Number(quantity);
    if (!qty || qty <= 0) return null;

    const costPrice =
      extra.costPrice != null
        ? Number(extra.costPrice)
        : Number(product.costPrice || 0);

    return await StockEntry.create({
      business: scope.businessId,
      store: scope.storeId,
      product: product._id,
      productName: product.name || "",
      sku: product.sku || "",
      category: product.category || "Uncategorized",
      unit: product.unit || "pcs",
      quantity: qty,
      costPrice,
      totalCost: Math.round(qty * costPrice * 100) / 100,
      source,
      user: scope.user?._id || null,
      userName: scope.user?.name || "",
      note: extra.note || "",
    });
  } catch (err) {
    console.error("logStockEntry failed:", err?.message || err);
    return null;
  }
}
