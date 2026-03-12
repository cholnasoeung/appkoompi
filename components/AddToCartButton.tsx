"use client";

import { useState, useTransition } from "react";

const guestSessionStorageKey = "cholna_guest_session_id";

function getGuestSessionId() {
  if (typeof window === "undefined") {
    return null;
  }

  const existingSessionId = window.localStorage.getItem(guestSessionStorageKey);

  if (existingSessionId) {
    return existingSessionId;
  }

  const nextSessionId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `guest-${Date.now()}`;

  window.localStorage.setItem(guestSessionStorageKey, nextSessionId);
  return nextSessionId;
}

export default function AddToCartButton({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAddToCart() {
    setMessage(null);

    startTransition(async () => {
      const sessionId = getGuestSessionId();
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
          sessionId,
        }),
      });

      const data = await response.json();
      setMessage(response.ok ? "Added" : data.message ?? "Unable to add");
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isPending}
        className={
          className ??
          "rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {isPending ? "Adding..." : "Add to cart"}
      </button>
      {message ? (
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
          {message}
        </p>
      ) : null}
    </div>
  );
}
