import { auth } from "@/auth";
import Link from "next/link";
import SignOutButton from "./SignOutButton";
import ThemeToggle from "./ThemeToggle";

export default async function Navbar() {
  const session = await auth();
  const user = session?.user;
  const userLabel = user?.name?.trim() || user?.email || "User";

  return (
    <nav className="border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
            Next.js + MongoDB
          </p>
          <Link
            href="/"
            className="text-xl font-black tracking-[-0.03em] text-slate-950"
          >
            Task Manager
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Dashboard
          </Link>
          <Link
            href="/about"
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            About
          </Link>
          {user ? (
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
                {userLabel.slice(0, 1).toUpperCase()}
              </div>
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {userLabel}
                </p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
              <SignOutButton />
            </div>
          ) : (
            <>
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
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
