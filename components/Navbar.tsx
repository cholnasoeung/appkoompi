import { auth } from "@/auth";
import CartBadgeLink from "@/components/CartBadgeLink";
import { getCurrentUserCartCount } from "@/lib/cart";
import Link from "next/link";
import SignOutButton from "./SignOutButton";
import ThemeToggle from "./ThemeToggle";

export default async function Navbar() {
  const session = await auth();
  const cartCount = session?.user?.id ? await getCurrentUserCartCount() : 0;
  const user = session?.user;
  const userLabel = user?.name?.trim() || user?.email || "User";

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                Curated home, work, travel
              </p>
              <Link
                href="/"
                className="text-xl font-black tracking-[-0.03em] text-slate-950"
              >
                Ecommerce Store
              </Link>
            </div>

            <div className="md:hidden">
              <ThemeToggle />
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/"
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Home
              </Link>
              <Link
                href="/catalog"
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Catalog
              </Link>
              <Link
                href="/catalog?sort=latest"
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                New Arrivals
              </Link>
              {user?.role === "admin" ? (
                <Link
                  href="/admin"
                  className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-200"
                >
                  Admin
                </Link>
              ) : null}

              <Link
                href="/about"
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                About
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <CartBadgeLink count={cartCount} />
              {user ? (
                <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm md:flex-initial">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
                    {userLabel.slice(0, 1).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {userLabel}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {user.role === "admin" ? "Administrator" : user.email}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <SignOutButton />
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href="/login"
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Log in
                  </Link>

                  <Link
                    href="/register"
                    className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Register
                  </Link>
                </div>
              )}

              <div className="hidden md:block">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
