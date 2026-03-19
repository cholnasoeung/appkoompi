import mongoose from "mongoose";
import { auth } from "@/auth";
import { getDatabaseConfigurationError } from "@/lib/env";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeOrder } from "@/lib/orders";
import Cart from "@/models/Cart";
import Order from "@/models/Order";
import Product from "@/models/Product";

type CheckoutAddress = {
  fullName?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

type CheckoutBody = {
  shippingAddress?: CheckoutAddress;
  billingAddress?: CheckoutAddress;
  sameAsShipping?: boolean;
  paymentMethod?: string;
  cardholderName?: string;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  notes?: string;
};

function unauthorizedResponse() {
  return Response.json({ message: "Unauthorized" }, { status: 401 });
}

function normalizeAddress(address: CheckoutAddress | undefined) {
  return {
    fullName: address?.fullName?.trim() ?? "",
    phone: address?.phone?.trim() ?? "",
    street: address?.street?.trim() ?? "",
    city: address?.city?.trim() ?? "",
    state: address?.state?.trim() ?? "",
    postalCode: address?.postalCode?.trim() ?? "",
    country: address?.country?.trim() ?? "",
  };
}

function validateAddress(address: ReturnType<typeof normalizeAddress>, label: string) {
  const missingField = Object.entries(address).find(([, value]) => !value)?.[0];

  if (missingField) {
    return `${label} ${missingField} is required.`;
  }

  return null;
}

function generateOrderNumber() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${Date.now().toString().slice(-6)}-${random}`;
}

export async function POST(request: Request) {
  try {
    const configurationError = getDatabaseConfigurationError();

    if (configurationError) {
      return Response.json({ message: configurationError }, { status: 503 });
    }

    const session = await auth();

    if (!session?.user?.id || !mongoose.Types.ObjectId.isValid(session.user.id)) {
      return unauthorizedResponse();
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const body = (await request.json()) as CheckoutBody;
    const shippingAddress = normalizeAddress(body.shippingAddress);
    const billingAddress = body.sameAsShipping
      ? shippingAddress
      : normalizeAddress(body.billingAddress);
    const paymentMethod = body.paymentMethod?.trim() || "";

    const shippingError = validateAddress(shippingAddress, "Shipping");

    if (shippingError) {
      return Response.json({ message: shippingError }, { status: 400 });
    }

    const billingError = validateAddress(billingAddress, "Billing");

    if (billingError) {
      return Response.json({ message: billingError }, { status: 400 });
    }

    if (!paymentMethod) {
      return Response.json({ message: "Payment method is required." }, { status: 400 });
    }

    await connectToDatabase();

    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return Response.json({ message: "Your cart is empty." }, { status: 400 });
    }

    const productIds = cart.items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true });
    const productsById = new Map(products.map((product) => [product._id.toString(), product]));

    for (const item of cart.items) {
      const product = productsById.get(item.productId.toString());

      if (!product) {
        return Response.json(
          { message: `Product ${item.nameSnapshot} is no longer available.` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return Response.json(
          { message: `Not enough stock for ${item.nameSnapshot}.` },
          { status: 400 }
        );
      }
    }

    const subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    const shippingAmount = subtotal >= 120 ? 0 : 12;
    const taxAmount = Number((subtotal * 0.1).toFixed(2));
    const discountAmount = 0;
    const totalAmount = subtotal + shippingAmount + taxAmount - discountAmount;
    const isCashOnDelivery = paymentMethod === "cash-on-delivery";
    const paymentStatus = "pending";

    const order = await Order.create({
      userId,
      orderNumber: generateOrderNumber(),
      items: cart.items.map((item) => ({
        productId: item.productId,
        slug: item.slug,
        nameSnapshot: item.nameSnapshot,
        priceSnapshot: item.priceSnapshot,
        imageSnapshot: item.imageSnapshot ?? null,
        quantity: item.quantity,
        variant: item.variant ?? null,
        size: item.size ?? null,
        color: item.color ?? null,
      })),
      shippingAddress,
      billingAddress,
      pricing: {
        subtotal,
        taxAmount,
        shippingAmount,
        discountAmount,
        totalAmount,
      },
      payment: {
        method: paymentMethod,
        status: paymentStatus,
        transactionId: null,
      },
      orderStatus: isCashOnDelivery ? "pending" : "pending",
      notes: body.notes?.trim() || null,
      placedAt: new Date(),
      paidAt: null,
    });

    for (const item of cart.items) {
      const product = productsById.get(item.productId.toString());

      if (!product) {
        continue;
      }

      product.stock = Math.max(0, product.stock - item.quantity);
      await product.save();
    }

    cart.items = [];
    cart.totalItems = 0;
    await cart.save();

    return Response.json(
      {
        message: "Order placed successfully.",
        order: serializeOrder(order.toObject()),
      },
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      {
        message: "Failed to place order.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
