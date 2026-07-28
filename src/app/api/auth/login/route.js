import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Business from "@/models/Business";
import { verifyPassword, createSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    await dbConnect();
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }
    const user = await User.findOne({
      username: username.toLowerCase().trim(),
    });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }
    if (user.active === false) {
      return NextResponse.json(
        { error: "This account is disabled" },
        { status: 403 }
      );
    }

    // Block access when the owner's business has been suspended.
    if (user.role !== "superadmin" && user.business) {
      const business = await Business.findById(user.business).select("status");
      if (business?.status === "suspended") {
        return NextResponse.json(
          { error: "This business account is suspended. Please contact support." },
          { status: 403 }
        );
      }
    }

    user.lastLoginAt = new Date();
    await user.save();
    await createSession(user);

    return NextResponse.json({
      data: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
