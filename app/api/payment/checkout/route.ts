import mongoose from "mongoose";
import { auth } from "@/auth";
import {
  buildBarayCheckoutUrl,
  buildBarayPayload,
  encryptBarayPayload,
  getPaymentConfigurationError,
  getPaymentEnvironment,
} from "@/lib/payment";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";

type CheckoutPaymentBody = {
  orderNumber?: string;
};

function unauthorizedResponse() {
  return Response.json({ message: "Unauthorized" }, { status: 401 });
}

export async function POST(request: Request) {
  try {
    const configurationError = getPaymentConfigurationError();

    if (configurationError) {
      return Response.json({ message: configurationError }, { status: 503 });
    }

    const session = await auth();

    if (!session?.user?.id || !mongoose.Types.ObjectId.isValid(session.user.id)) {
      return unauthorizedResponse();
    }

    const body = (await request.json()) as CheckoutPaymentBody;
    const orderNumber = body.orderNumber?.trim().toUpperCase() ?? "";

    if (!orderNumber) {
      return Response.json({ message: "Order number is required." }, { status: 400 });
    }

    await connectToDatabase();

    const order = await Order.findOne({
      userId: new mongoose.Types.ObjectId(session.user.id),
      orderNumber,
    });

    if (!order) {
      return Response.json({ message: "Order not found." }, { status: 404 });
    }

    if (order.payment.method !== "card") {
      return Response.json(
        { message: "This order is not configured for online payment." },
        { status: 400 }
      );
    }

    const config = getPaymentEnvironment();
    const payload = buildBarayPayload(order);
    const encryptedPayload = encryptBarayPayload(payload);
    const response = await fetch(`${config.apiUrl.replace(/\/$/, "")}/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
      },
      body: JSON.stringify({
        data: encryptedPayload,
      }),
      cache: "no-store",
    });

    const data = (await response.json().catch(() => null)) as
      | { _id?: string; message?: string }
      | null;

    if (!response.ok) {
      return Response.json(
        {
          message:
            typeof data?.message === "string"
              ? data.message
              : "Baray payment request failed.",
        },
        { status: response.status }
      );
    }

    const intentId = typeof data?._id === "string" ? data._id : "";

    if (!intentId) {
      return Response.json(
        { message: "Baray did not return a checkout intent id." },
        { status: 502 }
      );
    }

    return Response.json({
      message: "Redirecting to Baray checkout.",
      checkoutUrl: buildBarayCheckoutUrl(intentId),
      intentId,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    return Response.json(
      {
        message: "Failed to start payment.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
