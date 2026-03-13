"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { StorefrontSlide } from "@/lib/storefront";

const AUTO_SLIDE_DELAY = 5000;

export default function StorefrontHeroSlider({
  slides,
}: {
  slides: StorefrontSlide[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const safeSlides = useMemo(() => slides ?? [], [slides]);

  useEffect(() => {
    if (safeSlides.length <= 1 || isPaused) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % safeSlides.length);
    }, AUTO_SLIDE_DELAY);

    return () => window.clearInterval(intervalId);
  }, [safeSlides.length, isPaused]);

  if (safeSlides.length === 0) {
    return null;
  }

  const activeSlide = safeSlides[activeIndex];

  function goToPrevious() {
    setActiveIndex(
      (current) => (current - 1 + safeSlides.length) % safeSlides.length
    );
  }

  function goToNext() {
    setActiveIndex((current) => (current + 1) % safeSlides.length);
  }

  return (
    <section className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative overflow-hidden rounded-[2rem] border border-slate-200 shadow-[0_30px_90px_rgba(15,23,42,0.14)]"
      >
        <div className="relative min-h-[24rem] sm:min-h-[30rem] lg:min-h-[34rem]">
          <img
            src={activeSlide.imageUrl}
            alt={activeSlide.title}
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.12)_0%,rgba(15,23,42,0.03)_35%,rgba(15,23,42,0.08)_100%)]" />

          <div className="relative z-10 flex min-h-[24rem] items-center justify-end p-4 sm:min-h-[30rem] sm:p-8 lg:min-h-[34rem] lg:p-12">
            {/* <div className="w-full max-w-[22rem] rounded-[1.6rem] border border-black/10 bg-white/90 p-5 text-center shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-sm sm:max-w-[24rem] sm:p-6 lg:mr-4">
              {activeSlide.badge ? (
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  {activeSlide.badge}
                </p>
              ) : null}

              <h1 className="mt-3 text-3xl font-black leading-[1.05] tracking-[-0.05em] text-slate-950 sm:text-4xl">
                {activeSlide.title}
              </h1>

              {activeSlide.subtitle ? (
                <p className="mt-3 text-base font-medium text-slate-600 sm:text-lg">
                  {activeSlide.subtitle}
                </p>
              ) : null}

              {activeSlide.description ? (
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {activeSlide.description}
                </p>
              ) : null}

              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href={activeSlide.ctaHref ?? "/catalog"}
                  className="inline-flex items-center justify-center rounded-[1rem] bg-white px-6 py-3 text-base font-semibold text-slate-950 shadow-sm ring-1 ring-slate-300 transition hover:bg-slate-50"
                >
                  {activeSlide.ctaLabel ?? "Shop now"}
                </Link>

                <Link
                  href="/catalog"
                  className="inline-flex items-center justify-center rounded-[1rem] bg-slate-950 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-800"
                >
                  Browse catalog
                </Link>
              </div>
            </div> */}
          </div>

          {safeSlides.length > 1 ? (
            <>
              <button
                type="button"
                onClick={goToPrevious}
                aria-label="Previous slide"
                className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-lg font-bold text-slate-900 shadow-md backdrop-blur transition hover:bg-white"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={goToNext}
                aria-label="Next slide"
                className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-lg font-bold text-slate-900 shadow-md backdrop-blur transition hover:bg-white"
              >
                ›
              </button>

              <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/85 px-3 py-2 shadow-sm backdrop-blur">
                {safeSlides.map((slide, index) => (
                  <button
                    key={slide._id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Go to ${slide.title}`}
                    className={
                      index === activeIndex
                        ? "h-2.5 w-8 rounded-full bg-slate-950 transition-all duration-300"
                        : "h-2.5 w-2.5 rounded-full bg-slate-300 transition-all duration-300 hover:bg-slate-400"
                    }
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}