import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Sale from "@/models/Sale";
import Product from "@/models/Product";
import RegisterSession from "@/models/RegisterSession";
import Customer from "@/models/Customer";
import { resolveScope } from "@/lib/scope";

export const dynamic = "force-dynamic";

function genInvoiceNo() {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate()
  ).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${stamp}-${rand}`;
}

export async function GET(request) {
  try {
    const scope = await resolveScope();
    if (scope.error)
      return NextResponse.json({ error: scope.error.message }, { status: scope.error.status });
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const sales = await Sale.find({ store: scope.storeId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return NextResponse.json({ data: sales });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const scope = await resolveScope();
    if (scope.error)
      return NextResponse.json({ error: scope.error.message }, { status: scope.error.status });
    await dbConnect();
    const body = await request.json();
    const { items = [], discount = 0, tax = 0, paymentMethod, customerName, customerId, note } = body;

    if (!items.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const ids = items.map((i) => i.product);
    // Only products from this store can be sold
    const products = await Product.find({
      _id: { $in: ids },
      store: scope.storeId,
    });
    const productMap = Object.fromEntries(products.map((p) => [String(p._id), p]));

    const lineItems = [];
    let subTotal = 0;
    let profit = 0;

    for (const item of items) {
      const p = productMap[String(item.product)];
      if (!p) {
        return NextResponse.json(
          { error: `Product not found: ${item.name || item.product}` },
          { status: 400 }
        );
      }
      if (p.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${p.name} (available: ${p.stock})` },
          { status: 400 }
        );
      }
      const price = item.price ?? p.sellingPrice;
      const lineTotal = price * item.quantity;
      subTotal += lineTotal;
      profit += (price - (p.costPrice || 0)) * item.quantity;
      lineItems.push({
        product: p._id,
        name: p.name,
        sku: p.sku,
        quantity: item.quantity,
        price,
        costPrice: p.costPrice || 0,
        lineTotal,
      });
    }

    const total = Math.max(0, subTotal - discount + tax);
    const netProfit = profit - discount;

    // Attach to an open register session, if one exists for this store.
    const openSession = await RegisterSession.findOne({ store: scope.storeId, status: "open" }).select("_id");

    // Loyalty: 1 point per ₹100 spent, credited to the linked customer.
    let customer = null;
    if (customerId) {
      customer = await Customer.findOne({ _id: customerId, store: scope.storeId });
    }
    const pointsEarned = customer ? Math.floor(total / 100) : 0;

    const sale = await Sale.create({
      business: scope.businessId,
      store: scope.storeId,
      cashier: scope.user._id,
      cashierName: scope.user.name,
      session: openSession?._id || null,
      customer: customer?._id || null,
      pointsEarned,
      invoiceNo: genInvoiceNo(),
      items: lineItems,
      subTotal,
      discount,
      tax,
      total,
      profit: netProfit,
      paymentMethod: paymentMethod || "cash",
      customerName: customer?.name || customerName || "Walk-in",
      note: note || "",
    });

    await Promise.all(
      lineItems.map((li) =>
        Product.updateOne({ _id: li.product }, { $inc: { stock: -li.quantity } })
      )
    );

    if (customer) {
      customer.points += pointsEarned;
      customer.totalSpent += total;
      customer.visits += 1;
      customer.lastVisit = new Date();
      await customer.save();
    }

    return NextResponse.json({ data: sale }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
