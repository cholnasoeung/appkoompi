"use client";

import { useState, useTransition } from "react";
import type { AdminOrderSummary } from "@/lib/admin";

const orderStatuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

function statusClasses(status: string) {
  switch (status) {
    case "delivered":
      return "bg-emerald-100 text-emerald-800";
    case "shipped":
      return "bg-sky-100 text-sky-800";
    case "processing":
      return "bg-amber-100 text-amber-800";
    case "confirmed":
      return "bg-violet-100 text-violet-800";
    case "cancelled":
      return "bg-rose-100 text-rose-800";
    case "pending":
    default:
      return "bg-slate-100 text-slate-700";
  }
}

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

export default function AdminOrderManager({
  initialOrders,
}: {
  initialOrders: AdminOrderSummary[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateStatus(orderId: string, orderStatus: (typeof orderStatuses)[number]) {
    setError(null);
    setFeedback(null);

    startTransition(async () => {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderStatus }),
      });

      const data = await readJsonResponse(response);

      if (!response.ok) {
        setError(
          typeof data?.message === "string"
            ? data.message
            : "Unable to update order status."
        );
        return;
      }

      setOrders((current) =>
        current.map((order) =>
          order._id === orderId ? { ...order, orderStatus } : order
        )
      );
      setFeedback("Order status updated.");
    });
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-700">
            Order Management
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">
            Manage orders
          </h2>
        </div>
        <p className="text-sm text-slate-500">{orders.length} orders</p>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
      {feedback ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {feedback}
        </div>
      ) : null}

      <div className="mt-6 space-y-4">
        {orders.length === 0 ? (
          <div className="rounded-[1.5rem] border border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
            No orders yet.
          </div>
        ) : (
          orders.map((order) => (
            <article
              key={order._id}
              className="rounded-[1.6rem] border border-slate-200 p-5"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-lg font-bold text-slate-950">
                      {order.orderNumber}
                    </p>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusClasses(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {order.customerName}
                  </p>
                  <p className="text-sm text-slate-500">{order.customerEmail}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(order.placedAt).toLocaleString()}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 xl:w-[28rem]">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Total
                    </p>
                    <p className="mt-2 text-lg font-bold text-slate-950">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Items
                    </p>
                    <p className="mt-2 text-lg font-bold text-slate-950">
                      {order.itemCount}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Payment
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-950">
                      {order.paymentMethod}
                    </p>
                    <p className="text-xs text-slate-500">{order.paymentStatus}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {orderStatuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={isPending}
                    onClick={() => updateStatus(order._id, status)}
                    className={
                      order.orderStatus === status
                        ? "rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white"
                        : "rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:bg-slate-50"
                    }
                  >
                    {status}
                  </button>
                ))}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
