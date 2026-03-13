import mongoose from "mongoose";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";

export type OrderAddress = {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type OrderSummary = {
  _id: string;
  orderNumber: string;
  orderStatus: string;
  placedAt: string;
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  pricing: {
    subtotal: number;
    taxAmount: number;
    shippingAmount: number;
    discountAmount: number;
    totalAmount: number;
  };
  payment: {
    method: string;
    status: string;
    transactionId: string | null;
  };
  items: Array<{
    productId: string;
    slug: string;
    nameSnapshot: string;
    priceSnapshot: number;
    imageSnapshot: string | null;
    quantity: number;
    variant: string | null;
    size: string | null;
    color: string | null;
  }>;
};

function serializeOrder(order: {
  _id: { toString(): string };
  orderNumber: string;
  orderStatus: string;
  placedAt: Date | string;
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  pricing: {
    subtotal: number;
    taxAmount: number;
    shippingAmount: number;
    discountAmount: number;
    totalAmount: number;
  };
  payment: {
    method: string;
    status: string;
    transactionId?: string | null;
  };
  items: Array<{
    productId: { toString(): string };
    slug: string;
    nameSnapshot: string;
    priceSnapshot: number;
    imageSnapshot?: string | null;
    quantity: number;
    variant?: string | null;
    size?: string | null;
    color?: string | null;
  }>;
}) {
  return {
    _id: order._id.toString(),
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    placedAt:
      order.placedAt instanceof Date
        ? order.placedAt.toISOString()
        : order.placedAt,
    shippingAddress: order.shippingAddress,
    billingAddress: order.billingAddress,
    pricing: order.pricing,
    payment: {
      method: order.payment.method,
      status: order.payment.status,
      transactionId: order.payment.transactionId ?? null,
    },
    items: order.items.map((item) => ({
      productId: item.productId.toString(),
      slug: item.slug,
      nameSnapshot: item.nameSnapshot,
      priceSnapshot: item.priceSnapshot,
      imageSnapshot: item.imageSnapshot ?? null,
      quantity: item.quantity,
      variant: item.variant ?? null,
      size: item.size ?? null,
      color: item.color ?? null,
    })),
  } satisfies OrderSummary;
}

export async function getCurrentUserOrderByNumber(orderNumber: string) {
  const session = await auth();

  if (!session?.user?.id || !mongoose.Types.ObjectId.isValid(session.user.id)) {
    return null;
  }

  await connectToDatabase();

  const order = await Order.findOne({
    userId: new mongoose.Types.ObjectId(session.user.id),
    orderNumber: orderNumber.trim().toUpperCase(),
  }).lean();

  if (!order) {
    return null;
  }

  return serializeOrder(order);
}

export async function getCurrentUserOrders() {
  const session = await auth();

  if (!session?.user?.id || !mongoose.Types.ObjectId.isValid(session.user.id)) {
    return [];
  }

  await connectToDatabase();

  const orders = await Order.find({
    userId: new mongoose.Types.ObjectId(session.user.id),
  })
    .sort({ placedAt: -1 })
    .lean();

  return orders.map(serializeOrder);
}

export { serializeOrder };
