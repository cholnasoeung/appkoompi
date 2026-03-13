import Link from "next/link";
import StorefrontHeroSlider from "@/components/StorefrontHeroSlider";
import StorefrontProductCard from "@/components/StorefrontProductCard";
import { getStorefrontData } from "@/lib/storefront";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { categories, featuredProducts, latestProducts, usesFallback } =
    await getStorefrontData();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.14),_transparent_26%),linear-gradient(180deg,_#fffaf0_0%,_#ffffff_24%,_#f8fafc_100%)]">
      <section className="border-b border-slate-200 bg-slate-950 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.28em] text-amber-300 sm:px-6 lg:px-8">
        Free delivery over $120 and member access to limited weekly drops
      </section>

      <StorefrontHeroSlider
        products={featuredProducts.length > 0 ? featuredProducts : latestProducts.slice(0, 4)}
      />

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Collections
          </p>
          <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-slate-950">
            {categories.length}
          </p>
        </div>
        <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Featured
          </p>
          <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-slate-950">
            {featuredProducts.length}
          </p>
        </div>
        <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Fast dispatch
          </p>
          <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-slate-950">
            48h
          </p>
        </div>
        <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Members
          </p>
          <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-slate-950">
            Weekly
          </p>
        </div>
      </section>

      {usesFallback ? (
        <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Demo catalog is showing until store products are added in the admin dashboard.
          </div>
        </section>
      ) : null}

      <section id="collections" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
              Collections
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-950">
              Shop by mood, not by clutter
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            Each collection is built around calm utility: fewer distractions, better materials, and details worth keeping in view.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {categories.map((category, index) => (
            <article
              key={category._id}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div
                className={`h-44 rounded-[1.6rem] ${
                  index === 0
                    ? "bg-[linear-gradient(135deg,_#fed7aa,_#fff7ed,_#fde68a)]"
                    : index === 1
                      ? "bg-[linear-gradient(135deg,_#bfdbfe,_#e0f2fe,_#dbeafe)]"
                      : "bg-[linear-gradient(135deg,_#dcfce7,_#f0fdf4,_#a7f3d0)]"
                }`}
              />
              <h3 className="mt-5 text-2xl font-black tracking-[-0.04em] text-slate-950">
                {category.name}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {category.description}
              </p>
              <Link
                href={`/catalog?category=${category.slug}`}
                className="mt-5 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Explore collection
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="featured" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
              Featured products
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-950">
              Bestsellers with a clean, elevated edge
            </h2>
          </div>
          <Link
            href="/catalog"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Browse full catalog
          </Link>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product) => (
            <StorefrontProductCard key={product._id} product={product} compact />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[2.2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.22)] sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
                Why customers stay
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.05em]">
                Fewer products. Better choices.
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-lg font-bold">Premium materials</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Durable finishes and textures selected to age well.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-lg font-bold">Fast fulfillment</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Orders are packed quickly and dispatched within 48 hours.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-lg font-bold">Easy returns</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Straightforward exchanges for the first 30 days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              New arrivals
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-950">
              Fresh additions to the shop floor
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            A rotating set of recent products and restocks to keep the storefront current.
          </p>
        </div>

        <div className="mt-4">
          <Link
            href="/catalog?sort=latest"
            className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View all products
          </Link>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {latestProducts.map((product) => (
            <StorefrontProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
