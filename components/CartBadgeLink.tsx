import Link from "next/link";

export default function CartBadgeLink({ count }: { count: number }) {
  return (
    <Link
      href="/cart"
      className="relative rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
    >
      Cart
      <span className="ml-2 inline-flex min-w-6 justify-center rounded-full bg-slate-950 px-2 py-0.5 text-xs font-bold text-white">
        {count}
      </span>
    </Link>
  );
}
