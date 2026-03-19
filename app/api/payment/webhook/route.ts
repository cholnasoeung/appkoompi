import { decryptBarayOrderId } from "@/lib/payment";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";

type PaymentWebhookBody = {
  encrypted_order_id?: string;
  bank?: string;
};

function parseWebhookBody(rawBody: string) {
  try {
    return JSON.parse(rawBody) as PaymentWebhookBody;
  } catch {
    const params = new URLSearchParams(rawBody);
    return {
      encrypted_order_id: params.get("encrypted_order_id") ?? undefined,
      bank: params.get("bank") ?? undefined,
    } satisfies PaymentWebhookBody;
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const body = parseWebhookBody(rawBody);
    const encryptedOrderId = body.encrypted_order_id?.trim() ?? "";

    if (!encryptedOrderId) {
      return Response.json({ message: "Encrypted order id is required." }, { status: 400 });
    }

    const orderNumber = decryptBarayOrderId(encryptedOrderId).trim().toUpperCase();

    await connectToDatabase();

    const order = await Order.findOne({ orderNumber });

    if (!order) {
      return Response.json({ message: "Order not found." }, { status: 404 });
    }

    order.payment.status = "paid";
    order.payment.transactionId =
      body.bank?.trim() ? `baray-${body.bank.trim()}-${Date.now()}` : order.payment.transactionId;
    order.orderStatus = "confirmed";
    order.paidAt = new Date();
    await order.save();

    return Response.json({ message: "Webhook received." });
  } catch (error) {
    return Response.json(
      {
        message: "Failed to process webhook.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
