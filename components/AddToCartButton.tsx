"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useTransition } from "react";

type AddToCartButtonProps = {
  productId: string;
  productName: string;
  sizes: string[];
  colors: string[];
  className?: string;
};

async function readJsonResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export default function AddToCartButton({
  productId,
  productName,
  sizes,
  colors,
  className,
}: AddToCartButtonProps) {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(sizes[0] ?? null);
  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0] ?? null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openSelector() {
    setMessage(null);

    if (!session?.user?.id) {
      const callbackUrl =
        typeof window !== "undefined" ? window.location.href : "/";
      void signIn(undefined, { callbackUrl });
      return;
    }

    setIsOpen(true);
  }

  function submitSelection() {
    setMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
          size: selectedSize,
          color: selectedColor,
        }),
      });

      const data = await readJsonResponse(response);

      if (!response.ok) {
        setMessage(
          typeof data?.message === "string"
            ? data.message
            : "Unable to add item."
        );
        return;
      }

      setMessage("Added to cart");
      setIsOpen(false);
    });
  }

  return (
    <>
      <div className="space-y-2">
        <button
          type="button"
          onClick={openSelector}
          disabled={isPending || status === "loading"}
          className={
            className ??
            "rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          }
        >
          {status === "loading"
            ? "Loading..."
            : session?.user?.id
              ? "Select options"
              : "Login to add"}
        </button>
        {message ? (
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
            {message}
          </p>
        ) : null}
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.24)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Select details
                </p>
                <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">
                  {productName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-5">
              {sizes.length > 0 ? (
                <div>
                  <p className="text-sm font-semibold text-slate-700">Size</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={
                          selectedSize === size
                            ? "rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                            : "rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                        }
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {colors.length > 0 ? (
                <div>
                  <p className="text-sm font-semibold text-slate-700">Color</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={
                          selectedColor === color
                            ? "rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950"
                            : "rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                        }
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {message ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {message}
                </div>
              ) : null}

              <button
                type="button"
                onClick={submitSelection}
                disabled={isPending}
                className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {isPending ? "Adding..." : "Add to cart"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
