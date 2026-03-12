import AdminSidebar from "@/components/AdminSidebar";
import { requireAdminPageSession } from "@/lib/admin";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdminPageSession();
  const userLabel = session.user.name?.trim() || session.user.email || "Admin";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.12),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_45%,_#f8fafc_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <AdminSidebar userLabel={userLabel} />

        <section className="min-w-0 rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_24px_60px_rgba(148,163,184,0.18)] backdrop-blur sm:p-6">
          {children}
        </section>
      </div>
    </main>
  );
}
