"use client";

import AddToCartButton from "@/components/AddToCartButton";
import type { StorefrontProduct } from "@/lib/storefront";

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

export default function StorefrontProductCard({
  product,
  compact = false,
}: {
  product: StorefrontProduct;
  compact?: boolean;
}) {
  const activePrice = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice !== null;

  return (
    <article className="group overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
      <div className="relative">
        <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
          {hasDiscount ? (
            <span className="rounded-full bg-rose-500 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
              Sale
            </span>
          ) : null}
          {product.isFeatured ? (
            <span className="rounded-full bg-slate-950 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
              Featured
            </span>
          ) : null}
        </div>

        <div className="flex h-72 items-end bg-[linear-gradient(135deg,_#f8fafc,_#e2e8f0_55%,_#fde68a)] p-6">
          <div className="w-full rounded-[1.3rem] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_transparent_30%),linear-gradient(135deg,_#0f172a,_#334155_55%,_#cbd5e1)] p-5 text-white shadow-inner">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-200">
              {product.categoryName}
            </p>
            <h3 className="mt-3 text-2xl font-black tracking-[-0.04em]">
              {product.name}
            </h3>
          </div>
        </div>
      </div>

      <div className={compact ? "space-y-4 p-5" : "space-y-5 p-6"}>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {product.brand ?? "Cholna Select"}
          </p>
          <p className="text-sm leading-6 text-slate-600">
            {compact ? product.shortDescription : product.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {product.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Price
            </p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-black tracking-[-0.04em] text-slate-950">
                {formatPrice(activePrice)}
              </p>
              {hasDiscount ? (
                <p className="text-sm text-slate-400 line-through">
                  {formatPrice(product.price)}
                </p>
              ) : null}
            </div>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
            {product.ratingAverage.toFixed(1)} / 5
          </p>
        </div>

        <AddToCartButton
          productId={product._id}
          productName={product.name}
          sizes={product.sizes}
          colors={product.colors}
          className="w-full rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>
    </article>
  );
}
