import AdminOrderManager from "@/components/AdminOrderManager";
import { getAdminOrders, requireAdminPageSession } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdminPageSession();
  const orders = await getAdminOrders();

  return (
    <div className="space-y-6">
      <section className="rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(135deg,_#312e81,_#1d4ed8_56%,_#eff6ff)] p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">
          Orders
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-[-0.05em]">
          Fulfillment workspace
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50">
          Review customer orders, monitor payment state, and update fulfillment status.
        </p>
      </section>

      <AdminOrderManager initialOrders={orders} />
    </div>
  );
}
