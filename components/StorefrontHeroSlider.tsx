"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { StorefrontProduct } from "@/lib/storefront";

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

const slideThemes = [
  {
    shell:
      "bg-[linear-gradient(135deg,_#f5f5f4_0%,_#ffffff_48%,_#e5e7eb_100%)]",
    card:
      "bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_transparent_42%),linear-gradient(135deg,_#111827,_#374151_56%,_#d1d5db)]",
    accent: "text-rose-500",
  },
  {
    shell:
      "bg-[linear-gradient(135deg,_#eff6ff_0%,_#ffffff_50%,_#dbeafe_100%)]",
    card:
      "bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_transparent_38%),linear-gradient(135deg,_#082f49,_#155e75_56%,_#e0f2fe)]",
    accent: "text-sky-500",
  },
  {
    shell:
      "bg-[linear-gradient(135deg,_#fefce8_0%,_#ffffff_48%,_#fde68a_100%)]",
    card:
      "bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_transparent_38%),linear-gradient(135deg,_#451a03,_#9a3412_56%,_#fdba74)]",
    accent: "text-amber-500",
  },
];

export default function StorefrontHeroSlider({
  products,
}: {
  products: StorefrontProduct[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (products.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % products.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [products.length]);

  if (products.length === 0) {
    return null;
  }

  const activeProduct = products[activeIndex];
  const theme = slideThemes[activeIndex % slideThemes.length];
  const activePrice = activeProduct.discountPrice ?? activeProduct.price;

  function goToSlide(index: number) {
    setActiveIndex(index);
  }

  function goToPrevious() {
    setActiveIndex((current) => (current - 1 + products.length) % products.length);
  }

  function goToNext() {
    setActiveIndex((current) => (current + 1) % products.length);
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          Campaign drop
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPrevious}
            className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 transition hover:bg-slate-50"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 transition hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      </div>

      <div
        className={`relative overflow-hidden rounded-[2.2rem] border border-slate-200 shadow-[0_28px_80px_rgba(15,23,42,0.12)] ${theme.shell}`}
      >
        <div className="absolute left-10 top-0 h-full w-px bg-slate-300/60" />
        <div className="absolute right-10 top-0 h-full w-px bg-slate-300/60" />
        <div className="absolute inset-x-0 top-14 h-px bg-slate-300/40" />

        <div className="grid min-h-[26rem] items-stretch lg:grid-cols-[0.85fr_1.15fr]">
          <div className="relative z-10 flex flex-col justify-between p-8 sm:p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                {activeProduct.categoryName}
              </p>
              <h1 className="mt-4 max-w-md text-5xl font-black uppercase tracking-[-0.06em] text-slate-950 sm:text-6xl">
                {activeProduct.name}
              </h1>
              <p
                className={`mt-3 text-3xl font-black uppercase italic tracking-[-0.05em] ${theme.accent}`}
              >
                Cholna spotlight
              </p>
              <p className="mt-5 max-w-md text-sm leading-7 text-slate-600 sm:text-base">
                {activeProduct.description}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-end gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  From
                </p>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-black tracking-[-0.05em] text-slate-950">
                    {formatPrice(activePrice)}
                  </p>
                  {activeProduct.discountPrice ? (
                    <p className="text-sm font-semibold text-slate-400 line-through">
                      {formatPrice(activeProduct.price)}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="#featured"
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Shop now
                </Link>
                <Link
                  href="#collections"
                  className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Explore collection
                </Link>
              </div>
            </div>
          </div>

          <div className="relative flex min-h-[18rem] items-end justify-center p-6 sm:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,_rgba(255,255,255,0.9),_transparent_22%),radial-gradient(circle_at_20%_35%,_rgba(15,23,42,0.08),_transparent_24%)]" />
            <div className="absolute left-8 top-12 h-40 w-px bg-slate-500/35" />
            <div className="absolute right-16 top-10 h-32 w-px bg-slate-500/35" />
            <div className="absolute left-6 top-32 h-px w-14 bg-slate-500/35" />
            <div className="absolute right-14 top-28 h-px w-16 bg-slate-500/35" />

            <div className={`relative flex h-[24rem] w-full max-w-3xl items-end justify-between rounded-[2rem] p-6 text-white ${theme.card}`}>
              <div className="flex h-full items-end">
                <div className="h-[72%] w-44 rounded-t-[8rem] rounded-b-[2rem] bg-[linear-gradient(180deg,_rgba(255,255,255,0.18),_rgba(15,23,42,0.86))] shadow-[0_20px_60px_rgba(15,23,42,0.26)] backdrop-blur-sm sm:w-52" />
              </div>

              <div className="absolute bottom-6 left-1/2 w-[46%] -translate-x-1/2 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/70">
                  {activeProduct.brand ?? "Cholna Select"}
                </p>
                <h2 className="mt-2 text-4xl font-black uppercase tracking-[-0.08em] sm:text-6xl">
                  CHOLNA
                </h2>
                <p className={`mt-2 text-xl font-black uppercase italic sm:text-3xl ${theme.accent}`}>
                  {activeProduct.categoryName}
                </p>
              </div>

              <div className="ml-auto h-full w-56 rounded-t-[10rem] rounded-b-[2rem] bg-[radial-gradient(circle_at_50%_18%,_rgba(255,255,255,0.95),_rgba(255,255,255,0.18)_20%,_transparent_21%),linear-gradient(180deg,_rgba(255,255,255,0.2),_rgba(2,6,23,0.92))] shadow-[0_26px_80px_rgba(15,23,42,0.3)] sm:w-72" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/85 px-3 py-2 shadow-sm backdrop-blur">
          {products.map((product, index) => (
            <button
              key={product._id}
              type="button"
              onClick={() => goToSlide(index)}
              aria-label={`Go to ${product.name}`}
              className={
                index === activeIndex
                  ? "h-2.5 w-7 rounded-full bg-slate-950"
                  : "h-2.5 w-2.5 rounded-full bg-slate-300 transition hover:bg-slate-400"
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
