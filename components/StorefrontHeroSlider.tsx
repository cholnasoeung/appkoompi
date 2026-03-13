"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { StorefrontProduct } from "@/lib/storefront";

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

const AUTO_SLIDE_DELAY = 5000;

const slideThemes = [
  {
    shell:
      "bg-[linear-gradient(135deg,_#f8fafc_0%,_#ffffff_45%,_#e2e8f0_100%)]",
    card:
      "bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_transparent_42%),linear-gradient(135deg,_#0f172a,_#334155_56%,_#cbd5e1)]",
    accent: "text-rose-500",
    badge: "bg-rose-500/10 text-rose-600 border border-rose-200",
  },
  {
    shell:
      "bg-[linear-gradient(135deg,_#eff6ff_0%,_#ffffff_48%,_#dbeafe_100%)]",
    card:
      "bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_transparent_38%),linear-gradient(135deg,_#082f49,_#155e75_56%,_#e0f2fe)]",
    accent: "text-sky-500",
    badge: "bg-sky-500/10 text-sky-600 border border-sky-200",
  },
  {
    shell:
      "bg-[linear-gradient(135deg,_#fffbeb_0%,_#ffffff_48%,_#fde68a_100%)]",
    card:
      "bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_transparent_38%),linear-gradient(135deg,_#451a03,_#9a3412_56%,_#fdba74)]",
    accent: "text-amber-500",
    badge: "bg-amber-500/10 text-amber-700 border border-amber-200",
  },
];

export default function StorefrontHeroSlider({
  products,
}: {
  products: StorefrontProduct[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const safeProducts = useMemo(() => products ?? [], [products]);

  useEffect(() => {
    if (safeProducts.length <= 1 || isPaused) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % safeProducts.length);
    }, AUTO_SLIDE_DELAY);

    return () => window.clearInterval(intervalId);
  }, [safeProducts.length, isPaused]);

  useEffect(() => {
    if (activeIndex >= safeProducts.length && safeProducts.length > 0) {
      setActiveIndex(0);
    }
  }, [activeIndex, safeProducts.length]);

  if (safeProducts.length === 0) {
    return null;
  }

  const activeProduct = safeProducts[activeIndex];
  const theme = slideThemes[activeIndex % slideThemes.length];
  const activePrice = activeProduct.discountPrice ?? activeProduct.price;
  const hasDiscount =
    typeof activeProduct.discountPrice === "number" &&
    activeProduct.discountPrice < activeProduct.price;

  function goToSlide(index: number) {
    setActiveIndex(index);
  }

  function goToPrevious() {
    setActiveIndex((current) => (current - 1 + safeProducts.length) % safeProducts.length);
  }

  function goToNext() {
    setActiveIndex((current) => (current + 1) % safeProducts.length);
  }

  return (
    <section className="w-full px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Campaign drop
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">
            Featured spotlight
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPrevious}
            aria-label="Previous slide"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={goToNext}
            aria-label="Next slide"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      </div>

      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className={`relative overflow-hidden rounded-[2rem] border border-slate-200 shadow-[0_30px_90px_rgba(15,23,42,0.12)] transition-all duration-500 ${theme.shell}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.9),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(15,23,42,0.05),_transparent_24%)]" />
        <div className="absolute left-10 top-0 hidden h-full w-px bg-slate-300/50 lg:block" />
        <div className="absolute right-10 top-0 hidden h-full w-px bg-slate-300/50 lg:block" />
        <div className="absolute inset-x-0 top-16 hidden h-px bg-slate-300/40 lg:block" />

        <div className="grid min-h-[30rem] items-stretch lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative z-10 flex flex-col justify-between p-8 sm:p-10 lg:p-12">
            <div className="max-w-xl">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] ${theme.badge}`}
              >
                {activeProduct.categoryName}
              </span>

              <h1 className="mt-5 text-4xl font-black uppercase tracking-[-0.06em] text-slate-950 sm:text-5xl xl:text-6xl">
                {activeProduct.name}
              </h1>

              <p
                className={`mt-3 text-2xl font-black uppercase italic tracking-[-0.04em] sm:text-3xl ${theme.accent}`}
              >
                Ecommerce spotlight
              </p>

              <p className="mt-5 max-w-lg text-sm leading-7 text-slate-600 sm:text-base">
                {activeProduct.description}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <span>{activeProduct.brand ?? "Store Select"}</span>
                <span className="h-1 w-1 rounded-full bg-slate-400" />
                <span>Premium pick</span>
                <span className="h-1 w-1 rounded-full bg-slate-400" />
                <span>Auto slider</span>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  From
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <p className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">
                    {formatPrice(activePrice)}
                  </p>

                  {hasDiscount ? (
                    <>
                      <p className="text-sm font-semibold text-slate-400 line-through">
                        {formatPrice(activeProduct.price)}
                      </p>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                        Sale
                      </span>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="#featured"
                  className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  Shop now
                </Link>
                <Link
                  href="#collections"
                  className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  Explore collection
                </Link>
              </div>
            </div>
          </div>

          <div className="relative flex min-h-[20rem] items-end justify-center p-6 sm:p-10 lg:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,_rgba(255,255,255,0.88),_transparent_22%),radial-gradient(circle_at_20%_35%,_rgba(15,23,42,0.08),_transparent_24%)]" />
            <div className="absolute left-8 top-12 hidden h-40 w-px bg-slate-500/30 lg:block" />
            <div className="absolute right-16 top-10 hidden h-32 w-px bg-slate-500/30 lg:block" />
            <div className="absolute left-6 top-32 hidden h-px w-14 bg-slate-500/30 lg:block" />
            <div className="absolute right-14 top-28 hidden h-px w-16 bg-slate-500/30 lg:block" />

            <div
              className={`relative flex h-[24rem] w-full max-w-4xl items-end justify-between rounded-[2rem] p-6 text-white shadow-[0_26px_80px_rgba(15,23,42,0.24)] transition-all duration-500 ${theme.card}`}
            >
              <div className="absolute inset-x-10 top-6 h-px bg-white/10" />
              <div className="absolute inset-y-8 left-8 w-px bg-white/10" />
              <div className="absolute inset-y-8 right-8 w-px bg-white/10" />

              <div className="flex h-full items-end">
                <div className="h-[72%] w-40 rounded-t-[8rem] rounded-b-[2rem] bg-[linear-gradient(180deg,_rgba(255,255,255,0.18),_rgba(15,23,42,0.86))] shadow-[0_20px_60px_rgba(15,23,42,0.26)] backdrop-blur-sm transition-all duration-500 sm:w-52" />
              </div>

              <div className="absolute bottom-8 left-1/2 w-[50%] -translate-x-1/2 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/70">
                  {activeProduct.brand ?? "Store Select"}
                </p>
                <h2 className="mt-2 text-4xl font-black uppercase tracking-[-0.08em] sm:text-6xl">
                  STORE
                </h2>
                <p
                  className={`mt-2 text-xl font-black uppercase italic sm:text-3xl ${theme.accent}`}
                >
                  {activeProduct.categoryName}
                </p>
              </div>

              <div className="ml-auto h-full w-52 rounded-t-[10rem] rounded-b-[2rem] bg-[radial-gradient(circle_at_50%_18%,_rgba(255,255,255,0.95),_rgba(255,255,255,0.18)_20%,_transparent_21%),linear-gradient(180deg,_rgba(255,255,255,0.2),_rgba(2,6,23,0.92))] shadow-[0_26px_80px_rgba(15,23,42,0.3)] transition-all duration-500 sm:w-72" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
          {safeProducts.map((product, index) => (
            <button
              key={product._id}
              type="button"
              onClick={() => goToSlide(index)}
              aria-label={`Go to ${product.name}`}
              className={
                index === activeIndex
                  ? "h-2.5 w-8 rounded-full bg-slate-950 transition-all duration-300"
                  : "h-2.5 w-2.5 rounded-full bg-slate-300 transition-all duration-300 hover:bg-slate-400"
              }
            />
          ))}
        </div>

        {safeProducts.length > 1 ? (
          <div className="absolute right-4 top-4 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 shadow-sm backdrop-blur">
            {String(activeIndex + 1).padStart(2, "0")} / {String(safeProducts.length).padStart(2, "0")}
          </div>
        ) : null}
      </div>
    </section>
  );
}