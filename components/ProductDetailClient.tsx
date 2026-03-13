"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { StorefrontProduct } from "@/lib/storefront";

type ProductDetailClientProps = {
  product: StorefrontProduct;
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

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

export default function ProductDetailClient({
  product,
}: ProductDetailClientProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const gallery = useMemo(() => {
    if (product.images.length > 0) {
      return product.images;
    }

    return product.imageUrl
      ? [{ url: product.imageUrl, alt: product.name, isPrimary: true }]
      : [];
  }, [product.imageUrl, product.images, product.name]);
  const initialImageIndex = Math.max(
    gallery.findIndex((image) => image.isPrimary),
    0
  );
  const [activeImageIndex, setActiveImageIndex] = useState(initialImageIndex);
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.sizes[0] ?? null
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors[0] ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activePrice = product.discountPrice ?? product.price;
  const activeImage = gallery[activeImageIndex] ?? null;

  function goToImage(nextIndex: number) {
    if (gallery.length === 0) {
      return;
    }

    const normalizedIndex = (nextIndex + gallery.length) % gallery.length;
    setActiveImageIndex(normalizedIndex);
  }

  function openLogin() {
    const callbackUrl =
      typeof window !== "undefined" ? window.location.href : "/";
    void signIn(undefined, { callbackUrl });
  }

  function addToCart() {
    setMessage(null);

    if (!session?.user?.id) {
      openLogin();
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          quantity,
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

      setMessage("Added to cart.");
      router.refresh();
    });
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[0.58fr_0.42fr]">
      <div className="grid gap-4 md:grid-cols-[5.5rem_minmax(0,1fr)]">
        <div className="order-2 flex gap-3 overflow-x-auto md:order-1 md:flex-col">
          {gallery.length > 0 ? (
            gallery.map((image, index) => (
              <button
                key={`${image.url}-${index}`}
                type="button"
                onClick={() => setActiveImageIndex(index)}
                className={
                  index === activeImageIndex
                    ? "h-24 w-20 shrink-0 overflow-hidden border border-black bg-white"
                    : "h-24 w-20 shrink-0 overflow-hidden border border-slate-200 bg-white"
                }
              >
                <img
                  src={image.url}
                  alt={image.alt ?? product.name}
                  className="h-full w-full object-cover"
                />
              </button>
            ))
          ) : (
            <div className="flex h-24 w-20 items-center justify-center border border-dashed border-slate-300 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              No Image
            </div>
          )}
        </div>

        <div className="order-1 relative overflow-hidden bg-[#f4f4f4] md:order-2">
          <div className="aspect-[4/5]">
            {activeImage ? (
              <img
                src={activeImage.url}
                alt={activeImage.alt ?? product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                No Image
              </div>
            )}
          </div>

          {gallery.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => goToImage(activeImageIndex - 1)}
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-black shadow"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => goToImage(activeImageIndex + 1)}
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-black shadow"
              >
                ›
              </button>
            </>
          ) : null}

          <p className="absolute bottom-6 right-[-1.6rem] rotate-90 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-800">
            {product.brand ?? "Store"}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-2xl font-black text-black">
            US {formatPrice(activePrice)}
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-black">
            {product.name}
          </h1>
          {product.discountPrice ? (
            <p className="mt-2 text-sm text-slate-400 line-through">
              US {formatPrice(product.price)}
            </p>
          ) : null}
        </div>

        {product.colors.length > 0 ? (
          <div>
            <p className="text-sm font-bold text-black">
              {product.colors.length} Colors available
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {product.colors.map((color, index) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    setSelectedColor(color);
                    if (gallery[index]) {
                      setActiveImageIndex(index);
                    }
                  }}
                  className={
                    selectedColor === color
                      ? "w-20 border border-black bg-white p-2 text-center"
                      : "w-20 border border-slate-200 bg-white p-2 text-center"
                  }
                >
                  <div className="aspect-[4/5] overflow-hidden bg-[#f3f3f3]">
                    {gallery[index] ? (
                      <img
                        src={gallery[index].url}
                        alt={color}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.18em] text-slate-400">
                        {color}
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-slate-700">{color}</p>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {product.sizes.length > 0 ? (
          <div>
            <p className="text-sm font-bold text-black">Size</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={
                    selectedSize === size
                      ? "min-w-14 border border-black bg-white px-4 py-2 text-sm font-semibold text-black"
                      : "min-w-14 border border-slate-200 bg-[#f7f7f7] px-4 py-2 text-sm font-semibold text-slate-700"
                  }
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div>
          <p className="text-sm font-bold text-black">Quantity</p>
          <div className="mt-3 flex w-fit items-center gap-1">
            <button
              type="button"
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              className="h-10 w-10 border border-slate-200 bg-[#f7f7f7] text-lg text-slate-700"
            >
              -
            </button>
            <div className="flex h-10 min-w-12 items-center justify-center border border-slate-200 bg-white text-sm font-semibold text-black">
              {quantity}
            </div>
            <button
              type="button"
              onClick={() => setQuantity((current) => current + 1)}
              className="h-10 w-10 border border-slate-200 bg-[#f7f7f7] text-lg text-slate-700"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={addToCart}
            disabled={isPending || status === "loading"}
            className="flex-1 bg-black px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {status === "loading"
              ? "Loading..."
              : session?.user?.id
                ? isPending
                  ? "Adding..."
                  : "Add to bag"
                : "Login to add"}
          </button>
          <Link
            href="/cart"
            className="flex h-[3.5rem] w-[3.5rem] items-center justify-center border border-slate-200 bg-white text-xl text-slate-700"
          >
            ♡
          </Link>
        </div>

        {message ? (
          <div
            className={
              message === "Added to cart."
                ? "border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                : "border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            }
          >
            {message}
          </div>
        ) : null}

        <div className="space-y-px bg-slate-200">
          <div className="grid gap-4 bg-[#f7f7f7] p-5 sm:grid-cols-2">
            <div>
              <p className="font-semibold text-black">Fast Delivery</p>
              <p className="mt-1 text-sm text-slate-600">From 1 - 3 days</p>
            </div>
            <div>
              <p className="font-semibold text-black">Support hotline</p>
              <p className="mt-1 text-sm text-slate-600">(+855) 085 330 330</p>
            </div>
            <div>
              <p className="font-semibold text-black">Easy payment</p>
              <p className="mt-1 text-sm text-slate-600">Many forms</p>
            </div>
          </div>
          <details className="bg-white px-5 py-4" open>
            <summary className="cursor-pointer text-sm font-semibold text-black">
              Product details
            </summary>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {product.description}
            </p>
          </details>
          <details className="bg-white px-5 py-4">
            <summary className="cursor-pointer text-sm font-semibold text-black">
              Size guide
            </summary>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Available sizes: {product.sizes.length > 0 ? product.sizes.join(", ") : "Standard fit"}.
            </p>
          </details>
          <details className="bg-white px-5 py-4">
            <summary className="cursor-pointer text-sm font-semibold text-black">
              Online exchange policy
            </summary>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Exchange eligible items within 30 days when returned in original condition.
            </p>
          </details>
        </div>
      </div>
    </section>
  );
}
