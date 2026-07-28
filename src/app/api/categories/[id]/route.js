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
    delete body.business;
    delete body.store;
    const category = await Category.findOneAndUpdate(
      { _id: id, store: scope.storeId },
      body,
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
