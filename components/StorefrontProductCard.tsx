"use client";

import type { StorefrontProduct } from "@/lib/storefront";
import Link from "next/link";

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

export default function StorefrontProductCard({
  product,
  compact = false,
  showDescription = true,
}: {
  product: StorefrontProduct;
  compact?: boolean;
  showDescription?: boolean;
}) {
  const activePrice = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice !== null;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - activePrice) / product.price) * 100)
    : null;

  return (
    <article className="group flex h-full flex-col overflow-hidden bg-white transition hover:-translate-y-1">
      <div className="relative overflow-hidden rounded-[1.4rem] bg-[#f3f3f3]">
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
          {discountPercent ? (
            <span className="rounded-sm bg-red-500 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
              -{discountPercent}%
            </span>
          ) : null}
          {product.isFeatured ? (
            <span className="rounded-sm bg-black px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
              Hot
            </span>
          ) : null}
        </div>

        <Link href={`/products/${product.slug}`} className={compact ? "block aspect-[3/4]" : "block aspect-[4/5]"}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(180deg,_#f8fafc,_#e2e8f0)] text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              No Image
            </div>
          )}
        </Link>

        <p className="absolute bottom-5 right-[-1.6rem] rotate-90 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-700">
          {product.brand ?? "Store"}
        </p>
      </div>

      <div
        className={
          compact
            ? "flex flex-1 flex-col space-y-3 px-1 pb-1 pt-3"
            : "flex flex-1 flex-col space-y-4 px-1 pb-1 pt-4"
        }
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-h-[5.5rem] flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {product.categoryName}
            </p>
            <Link
              href={`/products/${product.slug}`}
              className="mt-1 block text-base font-semibold leading-6 text-black sm:text-lg"
            >
              {product.name}
            </Link>
          </div>
          <button
            type="button"
            aria-label={`Save ${product.name}`}
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12.62 20.55a1 1 0 0 1-1.24 0C6.3 16.44 3 13.39 3 9.5A4.5 4.5 0 0 1 7.5 5c1.74 0 3.13.81 4.5 2.09A6.16 6.16 0 0 1 16.5 5 4.5 4.5 0 0 1 21 9.5c0 3.89-3.3 6.94-8.38 11.05Z" />
            </svg>
          </button>
        </div>

        {showDescription ? (
          <p className="min-h-12 text-sm leading-6 text-slate-600">
            {compact ? product.shortDescription : product.description}
          </p>
        ) : null}

        <div className="flex items-center gap-2 text-sm">
          <p className="font-bold text-red-600">US {formatPrice(activePrice)}</p>
          {hasDiscount ? (
            <p className="text-slate-400 line-through">US {formatPrice(product.price)}</p>
          ) : null}
        </div>

        <div className="min-h-[2rem]">
          <div className="flex flex-wrap gap-2">
          {product.sizes.slice(0, 4).map((size) => (
            <span
              key={size}
              className="min-w-9 rounded-sm border border-slate-300 px-2 py-1 text-center text-[11px] font-medium text-slate-700"
            >
              {size}
            </span>
          ))}
          </div>
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="mt-auto block w-full rounded-none bg-black px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          View details
        </Link>
      </div>
    </article>
  );
}
