"use client";

import { useEffect, useState } from "react";
import type { StorefrontSlide } from "@/lib/storefront";

const AUTO_SLIDE_DELAY = 5000;

export default function StorefrontHeroSlider({
  slides,
}: {
  slides: StorefrontSlide[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const safeSlides = slides ?? [];
  const currentIndex = safeSlides.length === 0 ? 0 : activeIndex % safeSlides.length;

  useEffect(() => {
    if (safeSlides.length <= 1 || isPaused) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % safeSlides.length);
    }, AUTO_SLIDE_DELAY);

    return () => window.clearTimeout(timeoutId);
  }, [currentIndex, safeSlides.length, isPaused]);

  if (safeSlides.length === 0) {
    return null;
  }

  const activeSlide = safeSlides[currentIndex];

  function goToPrevious() {
    setActiveIndex((current) => (current - 1 + safeSlides.length) % safeSlides.length);
  }

  function goToNext() {
    setActiveIndex((current) => (current + 1) % safeSlides.length);
  }

  return (
    <section className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-7xl">
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 shadow-[0_30px_90px_rgba(15,23,42,0.14)] sm:rounded-[2rem]"
        >
          <div className="relative h-[clamp(16rem,48vw,34rem)] min-h-[16rem] sm:h-[clamp(20rem,44vw,36rem)]">
            <img
              src={activeSlide.imageUrl}
              alt={activeSlide.title}
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.12)_0%,rgba(15,23,42,0.03)_35%,rgba(15,23,42,0.08)_100%)]" />

            <div className="relative z-10 flex h-full items-center justify-end p-3 sm:p-6 lg:p-10">
              {/* Slide content can be restored here later without changing the responsive frame. */}
            </div>

            {safeSlides.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={goToPrevious}
                  aria-label="Previous slide"
                  className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-base font-bold text-slate-900 shadow-md backdrop-blur transition hover:bg-white sm:left-4 sm:h-11 sm:w-11 sm:text-lg"
                >
                  &#8249;
                </button>

                <button
                  type="button"
                  onClick={goToNext}
                  aria-label="Next slide"
                  className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-base font-bold text-slate-900 shadow-md backdrop-blur transition hover:bg-white sm:right-4 sm:h-11 sm:w-11 sm:text-lg"
                >
                  &#8250;
                </button>

                <div className="absolute bottom-3 left-1/2 z-20 flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 items-center gap-2 rounded-full bg-white/85 px-3 py-2 shadow-sm backdrop-blur sm:bottom-5 sm:max-w-none">
                  {safeSlides.map((slide, index) => (
                    <button
                      key={slide._id}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      aria-label={`Go to ${slide.title}`}
                      className={
                        index === currentIndex
                          ? "h-2.5 w-6 rounded-full bg-slate-950 transition-all duration-300 sm:w-8"
                          : "h-2.5 w-2.5 rounded-full bg-slate-300 transition-all duration-300 hover:bg-slate-400"
                      }
                    />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
