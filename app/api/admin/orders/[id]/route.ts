import mongoose from "mongoose";
import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type UpdateOrderBody = {
  orderStatus?: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
};

function invalidIdResponse() {
  return Response.json({ message: "Invalid order id." }, { status: 400 });
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

    const body = (await request.json()) as UpdateOrderBody;
    const nextStatus = body.orderStatus;

    if (!nextStatus) {
      return Response.json({ message: "Order status is required." }, { status: 400 });
    }

    const order = await Order.findById(id);

    if (!order) {
      return Response.json({ message: "Order not found." }, { status: 404 });
    }

    order.orderStatus = nextStatus;

    if (nextStatus === "shipped" && !order.shippedAt) {
      order.shippedAt = new Date();
    }

    if (nextStatus === "delivered" && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }

    await order.save();

    return Response.json({ message: "Order status updated." });
  } catch (error) {
    return Response.json(
      {
        message: "Failed to update order.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
