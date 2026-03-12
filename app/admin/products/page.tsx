import AdminProductManager from "@/components/AdminProductManager";
import {
  getAdminCategories,
  getAdminProducts,
  requireAdminPageSession,
} from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdminPageSession();

  const [products, categories] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(135deg,_#082f49,_#0f766e_56%,_#f0fdfa)] p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
          Products
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-[-0.05em]">
          Catalog workspace
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-cyan-50">
          Manage product data, category structure, pricing, and inventory from a single editor.
        </p>
      </section>

      <AdminProductManager
        initialProducts={products}
        initialCategories={categories}
      />
    </div>
  );
}
