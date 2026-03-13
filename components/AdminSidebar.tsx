"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    href: "/admin",
    label: "Overview",
    description: "Store metrics and quick actions",
  },
  {
    href: "/admin/products",
    label: "Products",
    description: "Catalog, pricing, and inventory",
  },
  {
    href: "/admin/orders",
    label: "Orders",
    description: "Status updates and customer fulfillment",
  },
  {
    href: "/admin/users",
    label: "Users",
    description: "Roles, contact data, and account control",
  },
];

export default function AdminSidebar({
  userLabel,
}: {
  userLabel: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="w-full rounded-[2rem] border border-slate-800 bg-slate-950 p-5 text-white shadow-[0_24px_70px_rgba(15,23,42,0.32)] lg:sticky lg:top-6 lg:w-80 lg:self-start">
      <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
          Admin Control
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.05em]">
          Store panel
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Protected workspace for catalog management and operational checks.
        </p>
      </div>

      <div className="mt-6 space-y-2">
        {navigation.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive
                  ? "block rounded-[1.4rem] border border-amber-300/30 bg-amber-300/10 px-4 py-4 transition"
                  : "block rounded-[1.4rem] border border-white/8 bg-white/3 px-4 py-4 transition hover:border-white/20 hover:bg-white/8"
              }
            >
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                {item.description}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-slate-900 px-4 py-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Signed in
        </p>
        <p className="mt-2 text-sm font-semibold text-slate-100">{userLabel}</p>
      </div>

      <div className="mt-4 rounded-[1.4rem] bg-[linear-gradient(135deg,_rgba(245,158,11,0.18),_rgba(14,165,233,0.12))] p-4">
        <p className="text-sm font-semibold text-white">Workflow</p>
        <p className="mt-2 text-xs leading-5 text-slate-200">
          Start in Products to create categories, then add stock, pricing, and featured flags.
        </p>
      </div>
    </aside>
  );
}
