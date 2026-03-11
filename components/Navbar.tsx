import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
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
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
