"use client";

import { useState, useTransition } from "react";
import type { CartLine } from "@/lib/cart";

type CartPayload = {
  productId: string;
  quantity?: number;
  size?: string | null;
  color?: string | null;
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

export default function CartManager({
  initialItems,
}: {
  initialItems: CartLine[];
}) {
  const [items, setItems] = useState(initialItems);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

  function updateItem(payload: CartPayload, quantity: number) {
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          quantity,
        }),
      });

      const data = await readJsonResponse(response);

      if (!response.ok) {
        setError(
          typeof data?.message === "string"
            ? data.message
            : "Unable to update cart."
        );
        return;
      }

      setItems((current) =>
        quantity <= 0
          ? current.filter(
              (item) =>
                !(
                  item.productId === payload.productId &&
                  (item.size ?? null) === (payload.size ?? null) &&
                  (item.color ?? null) === (payload.color ?? null)
                )
            )
          : current.map((item) =>
              item.productId === payload.productId &&
              (item.size ?? null) === (payload.size ?? null) &&
              (item.color ?? null) === (payload.color ?? null)
                ? {
                    ...item,
                    quantity,
                    subtotal: item.priceSnapshot * quantity,
                  }
                : item
            )
      );
    });
  }

  function removeItem(payload: CartPayload) {
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await readJsonResponse(response);

      if (!response.ok) {
        setError(
          typeof data?.message === "string"
            ? data.message
            : "Unable to remove item."
        );
        return;
      }

      setItems((current) =>
        current.filter(
          (item) =>
            !(
              item.productId === payload.productId &&
              (item.size ?? null) === (payload.size ?? null) &&
              (item.color ?? null) === (payload.color ?? null)
            )
        )
      );
    });
  }

  if (items.length === 0) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950">
          Your cart is empty
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Add a few pieces from the landing page to start building your outfit.
        </p>
      </section>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950">
          Cart dashboard
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Review sizes, colors, and quantities before checkout.
        </p>

        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <article
              key={`${item.productId}-${item.size ?? "none"}-${item.color ?? "none"}`}
              className="rounded-[1.6rem] border border-slate-200 p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-lg font-bold text-slate-950">
                    {item.nameSnapshot}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                    {item.slug}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.size ? (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        Size {item.size}
                      </span>
                    ) : null}
                    {item.color ? (
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                        {item.color}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-black text-slate-950">
                    ${item.subtotal.toFixed(2)}
                  </p>
                  <p className="text-sm text-slate-500">
                    ${item.priceSnapshot.toFixed(2)} each
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    updateItem(item, Math.max(1, item.quantity - 1))
                  }
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700"
                >
                  -
                </button>
                <span className="min-w-8 text-center text-sm font-semibold text-slate-900">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => updateItem(item, item.quantity + 1)}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700"
                >
                  +
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => removeItem(item)}
                  className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700"
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
          Summary
        </p>
        <p className="mt-3 text-3xl font-black tracking-[-0.05em]">
          ${totalAmount.toFixed(2)}
        </p>
        <p className="mt-2 text-sm text-slate-300">{items.length} line items</p>

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <button
          type="button"
          className="mt-6 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950"
        >
          Proceed to checkout
        </button>
      </aside>
    </div>
  );
}
