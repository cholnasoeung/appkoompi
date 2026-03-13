import mongoose from "mongoose";
import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type UpdateUserBody = {
  role?: "customer" | "admin";
  phone?: string | null;
};

function invalidIdResponse() {
  return Response.json({ message: "Invalid user id." }, { status: 400 });
}

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await getAdminApiSession();

  if (!authResult.ok) {
    return authResult.response;
  }

  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return invalidIdResponse();
  }

  try {
    await connectToDatabase();

    const body = (await request.json()) as UpdateUserBody;
    const user = await User.findById(id);

    if (!user) {
      return Response.json({ message: "User not found." }, { status: 404 });
    }

    if (body.role) {
      user.role = body.role;
    }

    if (body.phone !== undefined) {
      user.phone = typeof body.phone === "string" && body.phone.trim() ? body.phone.trim() : null;
    }

    await user.save();

    return Response.json({
      message: "User updated.",
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone ?? null,
        addressCount: user.addresses.length,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    return Response.json(
      {
        message: "Failed to update user.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await getAdminApiSession();

  if (!authResult.ok) {
    return authResult.response;
  }

  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return invalidIdResponse();
  }

  if (authResult.session.user.id === id) {
    return Response.json(
      { message: "You cannot delete your own admin account." },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const user = await User.findById(id);

    if (!user) {
      return Response.json({ message: "User not found." }, { status: 404 });
    }

    await user.deleteOne();

    return Response.json({ message: "User deleted." });
  } catch (error) {
    return Response.json(
      {
        message: "Failed to delete user.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
