import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getDatabaseConfigurationError } from "@/lib/env";
import User from "@/models/User";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function POST(request: Request) {
  try {
    const databaseConfigurationError = getDatabaseConfigurationError();

    if (databaseConfigurationError) {
      return NextResponse.json(
        { message: databaseConfigurationError },
        { status: 503 }
      );
    }

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (name.length < 2) {
      return NextResponse.json(
        { message: "Name must be at least 2 characters." },
        { status: 400 }
      );
    }

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { message: "Enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email });

    if (existingUser?.passwordHash) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);

    if (existingUser) {
      existingUser.name = name;
      existingUser.passwordHash = passwordHash;
      await existingUser.save();
    } else {
      await User.create({
        name,
        email,
        passwordHash,
      });
    }

    return NextResponse.json(
      { message: "Account created successfully." },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to create account.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
