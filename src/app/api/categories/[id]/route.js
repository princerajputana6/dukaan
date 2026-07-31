import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import { resolveScope } from "@/lib/scope";

export const dynamic = "force-dynamic";

export async function PUT(request, { params }) {
  try {
    const scope = await resolveScope();
    if (scope.error)
      return NextResponse.json({ error: scope.error.message }, { status: scope.error.status });
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const update = {};
    for (const k of ["name", "description", "color"]) {
      if (body[k] !== undefined) update[k] = body[k];
    }

    // Handle (re)assigning a parent for sub-categories.
    if (body.parent !== undefined) {
      if (!body.parent) {
        update.parent = null;
      } else {
        if (String(body.parent) === String(id))
          return NextResponse.json(
            { error: "A category cannot be its own parent" },
            { status: 400 }
          );
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
        // If this category already has children, it can't become a sub-category.
        const childCount = await Category.countDocuments({ parent: id });
        if (childCount > 0)
          return NextResponse.json(
            { error: "This category has sub-categories, so it can't become one itself" },
            { status: 400 }
          );
        update.parent = parentCat._id;
      }
    }

    const category = await Category.findOneAndUpdate(
      { _id: id, store: scope.storeId },
      update,
      { new: true, runValidators: true }
    );
    if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: category });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const scope = await resolveScope();
    if (scope.error)
      return NextResponse.json({ error: scope.error.message }, { status: scope.error.status });
    await dbConnect();
    const { id } = await params;
    const category = await Category.findOneAndDelete({ _id: id, store: scope.storeId });
    if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: { id } });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
