import Link from "next/link";
import { auth } from "@/auth";
import { getCurrentUserOrderByNumber } from "@/lib/orders";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type OrderConfirmationPageProps = {
  params: Promise<{ orderNumber: string }>;
};

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

export default async function OrderConfirmationPage({
  params,
}: OrderConfirmationPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { orderNumber } = await params;
  const order = await getCurrentUserOrderByNumber(orderNumber);

  if (!order) {
    redirect("/catalog");
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#ffffff_30%,_#f3f4f6_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[2rem] border border-emerald-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Order confirmation
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950">
            Thank you. Your order has been placed.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Order <span className="font-semibold text-slate-950">{order.orderNumber}</span> is currently{" "}
            <span className="font-semibold text-emerald-700">{order.orderStatus}</span>.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Continue shopping
            </Link>
            <Link
              href="/cart"
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              View cart
            </Link>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black tracking-[-0.04em] text-slate-950">
              Order summary
            </h2>
            <div className="mt-6 space-y-4">
              {order.items.map((item) => (
                <article
                  key={`${item.productId}-${item.size ?? "none"}-${item.color ?? "none"}`}
                  className="flex gap-4 rounded-[1.5rem] border border-slate-200 p-4"
                >
                  <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
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
                    <p className="mt-1 text-sm text-slate-500">
                      {item.quantity} x {formatPrice(item.priceSnapshot)}
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
                </article>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black tracking-[-0.04em] text-slate-950">
                Shipping details
              </h2>
              <div className="mt-4 space-y-1 text-sm text-slate-600">
                <p className="font-semibold text-slate-950">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.phone}</p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black tracking-[-0.04em] text-slate-950">
                Billing and payment
              </h2>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>
                  Payment method: <span className="font-semibold text-slate-950">{order.payment.method}</span>
                </p>
                <p>
                  Payment status: <span className="font-semibold text-slate-950">{order.payment.status}</span>
                </p>
                {order.payment.transactionId ? (
                  <p>
                    Transaction: <span className="font-semibold text-slate-950">{order.payment.transactionId}</span>
                  </p>
                ) : null}
              </div>
              <div className="mt-5 space-y-3 border-t border-slate-200 pt-4 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.pricing.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Shipping</span>
                  <span>{formatPrice(order.pricing.shippingAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Tax</span>
                  <span>{formatPrice(order.pricing.taxAmount)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-950">
                  <span>Total</span>
                  <span>{formatPrice(order.pricing.totalAmount)}</span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
