import Link from "next/link";
import { getAdminDashboardStats, requireAdminPageSession } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdminPageSession();
  const stats = await getAdminDashboardStats();

  const cards = [
    { label: "Products", value: stats.productCount, tone: "bg-sky-100 text-sky-900" },
    { label: "Categories", value: stats.categoryCount, tone: "bg-emerald-100 text-emerald-900" },
    { label: "Orders", value: stats.orderCount, tone: "bg-violet-100 text-violet-900" },
    { label: "Users", value: stats.userCount, tone: "bg-amber-100 text-amber-900" },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(135deg,_#0f172a,_#1e293b_58%,_#7c2d12)] p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
          Overview
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-[-0.05em]">
          Store performance at a glance
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
          Monitor catalog size, identify inventory pressure, and jump directly into product operations.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] ${card.tone}`}>
              {card.label}
            </span>
            <p className="mt-5 text-4xl font-black tracking-[-0.05em] text-slate-950">
              {card.value}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Catalog focus
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">
            Inventory signals
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] bg-amber-50 p-5">
              <p className="text-sm font-semibold text-amber-900">Low stock</p>
              <p className="mt-3 text-3xl font-black text-amber-950">
                {stats.lowStockCount}
              </p>
              <p className="mt-2 text-sm text-amber-800">
                Active products with stock at or below five units.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-sky-50 p-5">
              <p className="text-sm font-semibold text-sky-900">Featured live</p>
              <p className="mt-3 text-3xl font-black text-sky-950">
                {stats.featuredCount}
              </p>
              <p className="mt-2 text-sm text-sky-800">
                Featured products currently visible in the store.
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Shortcut
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">
            Product management
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Create products, attach categories, update pricing, and hide inventory from a dedicated editor.
          </p>
          <Link
            href="/admin/products"
            className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Open products
          </Link>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link
              href="/admin/orders"
              className="inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Open orders
            </Link>
            <Link
              href="/admin/users"
              className="inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Open users
            </Link>
            <Link
              href="/admin/slides"
              className="inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Open slider
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
