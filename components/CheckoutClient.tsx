"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { CartLine } from "@/lib/cart";

type AddressForm = {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type CheckoutClientProps = {
  initialItems: CartLine[];
  defaultAddress: AddressForm;
  defaultEmail: string;
};

async function readJsonResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

export default function CheckoutClient({
  initialItems,
  defaultAddress,
  defaultEmail,
}: CheckoutClientProps) {
  const router = useRouter();
  const [shippingAddress, setShippingAddress] = useState<AddressForm>(defaultAddress);
  const [billingAddress, setBillingAddress] = useState<AddressForm>(defaultAddress);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const pricing = useMemo(() => {
    const subtotal = initialItems.reduce((sum, item) => sum + item.subtotal, 0);
    const shippingAmount = subtotal >= 120 ? 0 : 12;
    const taxAmount = Number((subtotal * 0.1).toFixed(2));
    const totalAmount = subtotal + shippingAmount + taxAmount;

    return {
      subtotal,
      shippingAmount,
      taxAmount,
      totalAmount,
    };
  }, [initialItems]);

  function updateAddress(
    type: "shipping" | "billing",
    key: keyof AddressForm,
    value: string
  ) {
    if (type === "shipping") {
      setShippingAddress((current) => ({ ...current, [key]: value }));
      if (sameAsShipping) {
        setBillingAddress((current) => ({ ...current, [key]: value }));
      }
      return;
    }

    setBillingAddress((current) => ({ ...current, [key]: value }));
  }

  function placeOrder() {
    setError(null);
    setStatusMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shippingAddress,
          billingAddress: sameAsShipping ? shippingAddress : billingAddress,
          sameAsShipping,
          paymentMethod,
          notes,
        }),
      });

      const data = await readJsonResponse(response);

      if (!response.ok) {
        setError(
          typeof data?.message === "string"
            ? data.message
            : "Unable to place order."
        );
        return;
      }

      const orderNumber =
        data && "order" in data && data.order && typeof (data.order as { orderNumber?: unknown }).orderNumber === "string"
          ? ((data.order as { orderNumber: string }).orderNumber)
          : null;

      if (!orderNumber) {
        setError("Order placed, but the response was invalid.");
        return;
      }

      if (paymentMethod === "card") {
        const paymentResponse = await fetch("/api/payment/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderNumber }),
        });

        const paymentData = await readJsonResponse(paymentResponse);

        if (!paymentResponse.ok) {
          setError(
            typeof paymentData?.message === "string"
              ? paymentData.message
              : "Unable to start payment."
          );
          return;
        }

        const checkoutUrl =
          paymentData &&
          "checkoutUrl" in paymentData &&
          typeof paymentData.checkoutUrl === "string"
            ? paymentData.checkoutUrl
            : null;

        if (!checkoutUrl) {
          setError("Payment started, but no checkout URL was returned.");
          return;
        }

        setStatusMessage(
          typeof paymentData?.message === "string"
            ? paymentData.message
            : "Redirecting to payment..."
        );
        window.location.href = checkoutUrl;
        return;
      }

      router.push(`/orders/${orderNumber}`);
      router.refresh();
    });
  }

  if (initialItems.length === 0) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950">
          Your cart is empty
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Add items to your cart before proceeding to checkout.
        </p>
      </section>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="space-y-6">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
            Shipping details
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-950">
            Checkout
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Delivering order updates to {defaultEmail || "your account"}.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {Object.entries(shippingAddress).map(([key, value]) => (
              <input
                key={key}
                value={value}
                onChange={(event) =>
                  updateAddress("shipping", key as keyof AddressForm, event.target.value)
                }
                placeholder={key.replace(/([A-Z])/g, " $1")}
                className={key === "street" ? "sm:col-span-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100" : "w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"}
              />
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Billing and payment
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">
                Payment information
              </h2>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={sameAsShipping}
                onChange={(event) => {
                  setSameAsShipping(event.target.checked);
                  if (event.target.checked) {
                    setBillingAddress(shippingAddress);
                  }
                }}
              />
              Billing same as shipping
            </label>
          </div>

          {!sameAsShipping ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {Object.entries(billingAddress).map(([key, value]) => (
                <input
                  key={key}
                  value={value}
                  onChange={(event) =>
                    updateAddress("billing", key as keyof AddressForm, event.target.value)
                  }
                  placeholder={`Billing ${key.replace(/([A-Z])/g, " $1")}`}
                  className={key === "street" ? "sm:col-span-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100" : "w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"}
                />
              ))}
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={
                  paymentMethod === "card"
                    ? "rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                    : "rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                }
              >
                Pay online
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("cash-on-delivery")}
                className={
                  paymentMethod === "cash-on-delivery"
                    ? "rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                    : "rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                }
              >
                Cash on delivery
              </button>
            </div>

            {paymentMethod === "card" ? (
              <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
                You will be redirected to Baray to complete payment. Customers can choose the bank or wallet options available on your Baray account, including QR-supported flows like ACLEDA, Sathapana, Wing, and KHQR if enabled.
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Payment will be collected when the order is delivered.
              </div>
            )}

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              placeholder="Order notes"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            />
          </div>
        </article>
      </section>

      <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
          Order summary
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">
          Review your order
        </h2>

        <div className="mt-6 space-y-4">
          {initialItems.map((item) => (
            <article
              key={`${item.productId}-${item.size ?? "none"}-${item.color ?? "none"}`}
              className="flex gap-3 rounded-[1.5rem] border border-slate-200 p-4"
            >
              <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                {item.imageSnapshot ? (
                  <img
                    src={item.imageSnapshot}
                    alt={item.nameSnapshot}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-950">{item.nameSnapshot}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                  Qty {item.quantity}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.size ? (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                      Size {item.size}
                    </span>
                  ) : null}
                  {item.color ? (
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">
                      {item.color}
                    </span>
                  ) : null}
                </div>
              </div>
              <p className="text-sm font-bold text-slate-950">
                {formatPrice(item.subtotal)}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-6 space-y-3 border-t border-slate-200 pt-5 text-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatPrice(pricing.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>Shipping</span>
            <span>{pricing.shippingAmount === 0 ? "Free" : formatPrice(pricing.shippingAmount)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>Tax</span>
            <span>{formatPrice(pricing.taxAmount)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-950">
            <span>Total</span>
            <span>{formatPrice(pricing.totalAmount)}</span>
          </div>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {statusMessage ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {statusMessage}
          </div>
        ) : null}

        <button
          type="button"
          onClick={placeOrder}
          disabled={isPending}
          className="mt-6 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {isPending ? "Placing order..." : "Place order"}
        </button>
      </aside>
    </div>
  );
}
