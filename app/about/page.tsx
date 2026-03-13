export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)] px-6 py-12 sm:px-10 lg:px-16">
      <section className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
          About Our Store
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">
          A modern ecommerce storefront built for curated everyday essentials.
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
          Ecommerce Store brings together product discovery, shopping cart flows,
          admin product management, and server-rendered catalog pages in one
          practical Next.js application backed by MongoDB.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-slate-950 p-6 text-white">
            <h2 className="text-2xl font-bold">Storefront experience</h2>
            <p className="mt-4 leading-7 text-slate-300">
              Customers can browse featured collections, view recent arrivals,
              and add products to cart through a responsive shopping experience.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-2xl font-bold text-slate-950">Admin control</h2>
            <p className="mt-4 leading-7 text-slate-600">
              Store managers can maintain inventory, featured products, and
              category organization from the built-in admin dashboard.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
