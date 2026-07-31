import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { resolveScope } from "@/lib/scope";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const scope = await resolveScope();
    if (scope.error)
      return NextResponse.json({ error: scope.error.message }, { status: scope.error.status });
    await dbConnect();
    const categories = await Category.find({ store: scope.storeId })
      .sort({ name: 1 })
      .lean();
    const counts = await Product.aggregate([
      { $match: { store: scope.storeObjectId } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]));
    const nameById = Object.fromEntries(categories.map((c) => [String(c._id), c.name]));
    const data = categories.map((c) => ({
      ...c,
      productCount: countMap[c.name] || 0,
      parentName: c.parent ? nameById[String(c.parent)] || null : null,
    }));
    return NextResponse.json({ data });
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
    if (!body.name)
      return NextResponse.json({ error: "Name is required" }, { status: 400 });

    // Validate parent (must be a top-level category in the same store).
    let parent = null;
    if (body.parent) {
      const parentCat = await Category.findOne({
        _id: body.parent,
        store: scope.storeId,
      });
      if (!parentCat)
        return NextResponse.json({ error: "Invalid parent category" }, { status: 400 });
      if (parentCat.parent)
        return NextResponse.json(
          { error: "Only one level of sub-categories is allowed" },
          { status: 400 }
        );
      parent = parentCat._id;
    }

    const category = await Category.create({
      name: body.name,
      description: body.description || "",
      color: body.color || "#2F7EDA",
      parent,
      business: scope.businessId,
      store: scope.storeId,
    });
    return NextResponse.json({ data: category }, { status: 201 });
  } catch (err) {
    if (err.code === 11000)
      return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
