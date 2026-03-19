import crypto from "crypto";
import type { IOrder } from "@/models/Order";

export type PaymentEnvironment = {
  provider: string;
  apiKey: string;
  secretKey: string;
  iv: string;
  successUrl: string;
  webhookUrl: string;
  apiUrl: string;
  payUrl: string;
};

function readValue(...values: Array<string | undefined>) {
  for (const value of values) {
    const trimmed = value?.trim();

    if (trimmed) {
      return trimmed;
    }
  }

  return "";
}

function decodeBase64Value(value: string, field: string) {
  const buffer = Buffer.from(value, "base64");

  if (!buffer.length) {
    throw new Error(`Invalid ${field}.`);
  }

  return buffer;
}

export function getPaymentEnvironment(): PaymentEnvironment {
  return {
    provider: readValue(process.env.PAYMENT_PROVIDER, "baray"),
    apiKey: readValue(
      process.env.BARAY_API_KEY,
      process.env.NEXT_PUBLIC_PAYMENT_PUBLIC_KEY
    ),
    secretKey: readValue(
      process.env.BARAY_SECRET_KEY,
      process.env.PAYMENT_ENCRYPTION_KEY
    ),
    iv: readValue(process.env.BARAY_IV, process.env.PAYMENT_CYPHER_KEY),
    successUrl: readValue(process.env.PAYMENT_SUCCESS_URL),
    webhookUrl: readValue(process.env.PAYMENT_WEBHOOK_URL),
    apiUrl: readValue(process.env.BARAY_API_URL, "https://api.baray.io"),
    payUrl: readValue(process.env.BARAY_PAY_URL, "https://pay.baray.io"),
  };
}

export function getPaymentConfigurationError() {
  const config = getPaymentEnvironment();

  if (config.provider.toLowerCase() !== "baray") {
    return "Payment provider is not configured for Baray. Set PAYMENT_PROVIDER=baray in .env.local.";
  }

  if (!config.apiKey) {
    return "Baray API key is not configured. Set BARAY_API_KEY or NEXT_PUBLIC_PAYMENT_PUBLIC_KEY in .env.local.";
  }

  if (!config.secretKey || !config.iv) {
    return "Baray encryption keys are not configured. Set BARAY_SECRET_KEY/BARAY_IV or PAYMENT_ENCRYPTION_KEY/PAYMENT_CYPHER_KEY in .env.local.";
  }

  if (!config.successUrl) {
    return "Payment success URL is not configured. Set PAYMENT_SUCCESS_URL in .env.local.";
  }

  if (!config.webhookUrl) {
    return "Payment webhook URL is not configured. Set PAYMENT_WEBHOOK_URL in .env.local.";
  }

  return null;
}

export function encryptBarayPayload(payload: Record<string, unknown>) {
  const config = getPaymentEnvironment();
  const key = decodeBase64Value(config.secretKey, "Baray secret key");
  const iv = decodeBase64Value(config.iv, "Baray IV");
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(JSON.stringify(payload), "utf8", "base64");
  encrypted += cipher.final("base64");

  return encrypted;
}

export function decryptBarayOrderId(encryptedOrderId: string) {
  const config = getPaymentEnvironment();
  const key = decodeBase64Value(config.secretKey, "Baray secret key");
  const iv = decodeBase64Value(config.iv, "Baray IV");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encryptedOrderId, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

export function buildBarayPayload(order: IOrder) {
  const config = getPaymentEnvironment();
  const successUrl = config.successUrl.replace(/\/$/, "");

  return {
    amount: order.pricing.totalAmount.toFixed(2),
    currency: "USD",
    order_id: order.orderNumber,
    tracking: {
      customer_id: order.userId.toString(),
      order_number: order.orderNumber,
    },
    order_details: {
      items: order.items.map((item) => ({
        name: item.nameSnapshot,
        price: Number(item.priceSnapshot.toFixed(2)),
      })),
    },
    custom_success_url: `${successUrl}/${order.orderNumber}`,
  };
}

export function buildBarayCheckoutUrl(intentId: string) {
  const config = getPaymentEnvironment();
  return `${config.payUrl.replace(/\/$/, "")}/${intentId}`;
}
