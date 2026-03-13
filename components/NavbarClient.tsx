"use client";

import Link from "next/link";
import { useState } from "react";
import CartBadgeLink from "@/components/CartBadgeLink";
import SignOutButton from "@/components/SignOutButton";
import ThemeToggle from "@/components/ThemeToggle";

type NavbarUser = {
  name: string | null;
  email: string | null;
  role?: string | null;
};

export default function NavbarClient({
  cartCount,
  user,
  userLabel,
}: {
  cartCount: number;
  user: NavbarUser | null;
  userLabel: string;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto max-w-10xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700 sm:text-xs sm:tracking-[0.22em]">
              Curated home, work, travel
            </p>
            <Link
              href="/"
              onClick={closeMenu}
              className="block truncate text-lg font-black tracking-[-0.03em] text-slate-950 sm:text-xl"
            >
              Ecommerce Store
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <CartBadgeLink count={cartCount} />
            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              aria-expanded={isMenuOpen}
              aria-label="Toggle navigation menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <span className="sr-only">Menu</span>
              <div className="flex flex-col gap-1.5">
                <span className="block h-0.5 w-5 rounded-full bg-current" />
                <span className="block h-0.5 w-5 rounded-full bg-current" />
                <span className="block h-0.5 w-5 rounded-full bg-current" />
              </div>
            </button>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
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
              <Link
                href="/about"
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                About
              </Link>
              {user ? (
                <Link
                  href="/orders"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Orders
                </Link>
              ) : null}
              {user?.role === "admin" ? (
                <Link
                  href="/admin"
                  className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-200"
                >
                  Admin
                </Link>
              ) : null}
            </div>

            <CartBadgeLink count={cartCount} />

            {user ? (
              <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
                  {userLabel.slice(0, 1).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {userLabel}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {user.role === "admin" ? "Administrator" : user.email}
                  </p>
                </div>

                <SignOutButton />
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

            <ThemeToggle />
          </div>
        </div>

        {isMenuOpen ? (
          <div className="mt-4 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)] lg:hidden">
            <div className="grid gap-2">
              <Link
                href="/"
                onClick={closeMenu}
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Home
              </Link>
              <Link
                href="/catalog"
                onClick={closeMenu}
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Catalog
              </Link>
              <Link
                href="/catalog?sort=latest"
                onClick={closeMenu}
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                New Arrivals
              </Link>
              <Link
                href="/about"
                onClick={closeMenu}
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                About
              </Link>
              {user ? (
                <Link
                  href="/orders"
                  onClick={closeMenu}
                  className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Orders
                </Link>
              ) : null}
              {user?.role === "admin" ? (
                <Link
                  href="/admin"
                  onClick={closeMenu}
                  className="rounded-2xl bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-200"
                >
                  Admin
                </Link>
              ) : null}
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4">
              {user ? (
                <div className="space-y-3">
                  <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
                      {userLabel.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {userLabel}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {user.role === "admin" ? "Administrator" : user.email}
                      </p>
                    </div>
                  </div>
                  <SignOutButton />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
