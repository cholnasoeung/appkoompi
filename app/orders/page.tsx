import Link from "next/link";
import { auth } from "@/auth";
import { getCurrentUserOrders } from "@/lib/orders";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

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

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/orders");
  }

  const orders = await getCurrentUserOrders();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#ffffff_30%,_#f3f4f6_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
            Order History
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-slate-950">
            Your orders
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Review past purchases and track the latest order status.
          </p>
        </section>

        {orders.length === 0 ? (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-black tracking-[-0.04em] text-slate-950">
              No orders yet
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Orders you place through checkout will appear here.
            </p>
            <Link
              href="/catalog"
              className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Start shopping
            </Link>
          </section>
        ) : (
          <section className="space-y-4">
            {orders.map((order) => (
              <article
                key={order._id}
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-black tracking-[-0.04em] text-slate-950">
                        {order.orderNumber}
                      </h2>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusClasses(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      Placed on {new Date(order.placedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xl font-black text-slate-950">
                      {formatPrice(order.pricing.totalAmount)}
                    </p>
                    <p className="text-sm text-slate-500">
                      {order.items.length} item{order.items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {order.items.slice(0, 3).map((item) => (
                    <div
                      key={`${item.productId}-${item.size ?? "none"}-${item.color ?? "none"}`}
                      className="rounded-[1.2rem] border border-slate-200 p-3"
                    >
                      <p className="font-semibold text-slate-950">{item.nameSnapshot}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Qty {item.quantity}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <Link
                    href={`/orders/${order.orderNumber}`}
                    className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Track order
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
