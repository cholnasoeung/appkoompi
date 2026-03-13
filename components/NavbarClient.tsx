"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
  categories,
  user,
  userLabel,
}: {
  cartCount: number;
  categories: Array<{ name: string; slug: string }>;
  user: NavbarUser | null;
  userLabel: string;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPagesMenuOpen, setIsPagesMenuOpen] = useState(false);
  const [isCartMenuOpen, setIsCartMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const router = useRouter();

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function closeMenus() {
    setIsMenuOpen(false);
    setIsPagesMenuOpen(false);
    setIsCartMenuOpen(false);
    setIsProfileMenuOpen(false);
  }

  function onCategoryChange(value: string) {
    closeMenus();
    router.push(value ? `/catalog?category=${encodeURIComponent(value)}` : "/catalog");
  }

  function onGenderChange(value: "men" | "women" | "unisex" | "") {
    closeMenus();
    router.push(value ? `/catalog?gender=${encodeURIComponent(value)}` : "/catalog");
  }

  function onMoreMenuChange(value: string) {
    if (!value) {
      return;
    }

    if (value.startsWith("gender:")) {
      onGenderChange(value.replace("gender:", "") as "men" | "women" | "unisex" | "");
      return;
    }

    if (value.startsWith("category:")) {
      onCategoryChange(value.replace("category:", ""));
    }
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto max-w-10xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
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
            <label className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 lg:flex">
              Category
              <select
                aria-label="Header category filter"
                defaultValue=""
                onChange={(event) => onCategoryChange(event.target.value)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold normal-case tracking-normal text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              >
                <option value="">All</option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
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
                onClick={closeMenus}
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Home
              </Link>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsPagesMenuOpen((current) => !current)}
                  aria-expanded={isPagesMenuOpen}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Pages
                  <span className={`text-xs transition ${isPagesMenuOpen ? "rotate-180" : ""}`}>
                    v
                  </span>
                </button>
                {isPagesMenuOpen ? (
                  <div className="absolute left-0 top-[calc(100%+0.4rem)] z-30 min-w-[14rem] overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                    <Link
                      href="/catalog"
                      onClick={closeMenus}
                      className="block px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Catalog
                    </Link>
                    <Link
                      href="/about"
                      onClick={closeMenus}
                      className="block px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      About
                    </Link>
                    <Link
                      href="/catalog?sort=latest"
                      onClick={closeMenus}
                      className="block px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      New Arrivals
                    </Link>
                    {user ? (
                      <Link
                        href="/orders"
                        onClick={closeMenus}
                        className="block px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Orders
                      </Link>
                    ) : null}
                    {user?.role === "admin" ? (
                      <Link
                        href="/admin"
                        onClick={closeMenus}
                        className="block px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-50"
                      >
                        Admin
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <Link
                href="/catalog?gender=women"
                onClick={closeMenus}
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Women
              </Link>
              <Link
                href="/catalog?gender=men"
                onClick={closeMenus}
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Men
              </Link>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsCartMenuOpen((current) => !current);
                  setIsProfileMenuOpen(false);
                }}
                aria-expanded={isCartMenuOpen}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cart
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-950 px-2 text-xs font-bold text-white">
                  {cartCount}
                </span>
              </button>
              {isCartMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+0.45rem)] z-30 w-[17rem] rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                  <p className="text-sm font-bold text-slate-900">Cart summary</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {cartCount} item{cartCount === 1 ? "" : "s"} in your cart
                  </p>
                  <div className="mt-3 grid gap-2">
                    <Link
                      href="/cart"
                      onClick={closeMenus}
                      className="rounded-xl bg-slate-950 px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      View cart
                    </Link>
                    <Link
                      href="/checkout"
                      onClick={closeMenus}
                      className="rounded-xl border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Checkout
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>

            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen((current) => !current);
                    setIsCartMenuOpen(false);
                  }}
                  aria-expanded={isProfileMenuOpen}
                  className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:bg-slate-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
                    {userLabel.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="max-w-28 truncate text-sm font-semibold text-slate-900">
                      {userLabel}
                    </p>
                    <p className="text-xs text-slate-500">Profile</p>
                  </div>
                </button>
                {isProfileMenuOpen ? (
                  <div className="absolute right-0 top-[calc(100%+0.45rem)] z-30 w-[18rem] rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Signed in as
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-900">{userLabel}</p>
                    <p className="mt-1 break-all text-xs text-slate-600">
                      {user.email ?? "No email"}
                    </p>
                    <p className="mt-2 text-xs font-medium text-slate-500">
                      Role: {user.role === "admin" ? "Administrator" : "Customer"}
                    </p>
                    <div className="mt-3 grid gap-2">
                      <Link
                        href="/orders"
                        onClick={closeMenus}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        My orders
                      </Link>
                      <SignOutButton />
                    </div>
                  </div>
                ) : null}
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
              <div className="rounded-2xl border border-slate-200 p-3">
                <p className="px-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Pages
                </p>
                <div className="mt-2 grid gap-1">
                  <Link
                    href="/catalog"
                    onClick={closeMenu}
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Catalog
                  </Link>
                  <Link
                    href="/about"
                    onClick={closeMenu}
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    About
                  </Link>
                  {user?.role === "admin" ? (
                    <Link
                      href="/admin"
                      onClick={closeMenu}
                      className="rounded-xl px-3 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-50"
                    >
                      Admin
                    </Link>
                  ) : null}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/catalog?gender=women"
                  onClick={closeMenu}
                  className="rounded-2xl px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Women
                </Link>
                <Link
                  href="/catalog?gender=men"
                  onClick={closeMenu}
                  className="rounded-2xl px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Men
                </Link>
              </div>
              <div className="rounded-2xl border border-slate-200 px-4 py-3">
                <label
                  htmlFor="mobile-category-filter"
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
                >
                  Category filter
                </label>
                <select
                  id="mobile-category-filter"
                  defaultValue=""
                  onChange={(event) => onCategoryChange(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                >
                  <option value="">All categories</option>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <Link
                href="/catalog?sort=latest"
                onClick={closeMenu}
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                New Arrivals
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
