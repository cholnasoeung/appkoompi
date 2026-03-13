import AdminUserManager from "@/components/AdminUserManager";
import { getAdminUsers, requireAdminPageSession } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireAdminPageSession();
  const users = await getAdminUsers();

  return (
    <div className="space-y-6">
      {/* <section className="rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(135deg,_#78350f,_#d97706_52%,_#fffbeb)] p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-100">
          Users
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-[-0.05em]">
          Account workspace
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-amber-50">
          Manage customer and admin accounts, review contact details, and control role access.
        </p>
      </section> */}

      <AdminUserManager initialUsers={users} />
    </div>
  );
}
