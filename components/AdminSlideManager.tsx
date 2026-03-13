"use client";

import { useState, useTransition } from "react";
import type { AdminSlideSummary } from "@/lib/admin";

type FormState = {
  id: string | null;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
  badge: string;
  sortOrder: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  id: null,
  title: "",
  subtitle: "",
  description: "",
  imageUrl: "",
  ctaLabel: "",
  ctaHref: "/catalog",
  badge: "",
  sortOrder: "0",
  isActive: true,
};

async function readJsonResponse(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function slideToForm(slide: AdminSlideSummary): FormState {
  return {
    id: slide._id,
    title: slide.title,
    subtitle: slide.subtitle ?? "",
    description: slide.description ?? "",
    imageUrl: slide.imageUrl,
    ctaLabel: slide.ctaLabel ?? "",
    ctaHref: slide.ctaHref ?? "/catalog",
    badge: slide.badge ?? "",
    sortOrder: String(slide.sortOrder),
    isActive: slide.isActive,
  };
}

export default function AdminSlideManager({
  initialSlides,
}: {
  initialSlides: AdminSlideSummary[];
}) {
  const [slides, setSlides] = useState(initialSlides);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/uploads", {
      method: "POST",
      body: formData,
    });
    const data = await readJsonResponse(response);

    if (!response.ok) {
      setError(typeof data?.message === "string" ? data.message : "Unable to upload image.");
      return;
    }

    if (typeof data?.url === "string") {
      updateField("imageUrl", data.url);
      setFeedback("Slide image uploaded.");
    }

    event.target.value = "";
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFeedback(null);

    startTransition(async () => {
      const isEditing = Boolean(form.id);
      const response = await fetch(
        isEditing ? `/api/admin/slides/${form.id}` : "/api/admin/slides",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            subtitle: form.subtitle,
            description: form.description,
            imageUrl: form.imageUrl,
            ctaLabel: form.ctaLabel,
            ctaHref: form.ctaHref,
            badge: form.badge,
            sortOrder: Number(form.sortOrder),
            isActive: form.isActive,
          }),
        }
      );

      const data = await readJsonResponse(response);
      if (!response.ok) {
        setError(typeof data?.message === "string" ? data.message : "Unable to save slide.");
        return;
      }

      const savedSlide =
        data && "slide" in data && data.slide ? (data.slide as AdminSlideSummary) : null;
      if (!savedSlide) {
        setError("Slide saved, but the response was invalid.");
        return;
      }

      setSlides((current) => {
        if (isEditing) {
          return current.map((slide) => (slide._id === savedSlide._id ? savedSlide : slide));
        }
        return [...current, savedSlide].sort((a, b) => a.sortOrder - b.sortOrder);
      });

      resetForm();
      setFeedback(isEditing ? "Slide updated." : "Slide created.");
    });
  }

  function handleDelete(slideId: string) {
    setError(null);
    setFeedback(null);

    startTransition(async () => {
      const response = await fetch(`/api/admin/slides/${slideId}`, { method: "DELETE" });
      const data = await readJsonResponse(response);
      if (!response.ok) {
        setError(typeof data?.message === "string" ? data.message : "Unable to delete slide.");
        return;
      }

      setSlides((current) => current.filter((slide) => slide._id !== slideId));
      if (form.id === slideId) {
        resetForm();
      }
      setFeedback("Slide deleted.");
    });
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
              Homepage slider
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">
              Manage slides
            </h2>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            New slide
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {slides.length === 0 ? (
            <div className="rounded-[1.5rem] border border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
              No slides yet.
            </div>
          ) : (
            slides.map((slide) => (
              <article key={slide._id} className="rounded-[1.5rem] border border-slate-200 p-4">
                <div className="flex gap-4">
                  <div className="h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    <img src={slide.imageUrl} alt={slide.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-950">{slide.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{slide.subtitle ?? "No subtitle"}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700">
                        Sort {slide.sortOrder}
                      </span>
                      <span className={slide.isActive ? "rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700" : "rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700"}>
                        {slide.isActive ? "Active" : "Hidden"}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setForm(slideToForm(slide))}
                        className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(slide._id)}
                        className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
          Slide editor
        </p>
        <h3 className="mt-2 text-xl font-black tracking-[-0.04em] text-slate-950">
          {form.id ? "Edit slide" : "Create slide"}
        </h3>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <input value={form.title} onChange={(event) => updateField("title", event.target.value)} placeholder="Slide title" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100" />
          <input value={form.subtitle} onChange={(event) => updateField("subtitle", event.target.value)} placeholder="Subtitle" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100" />
          <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} rows={4} placeholder="Description" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100" />
          <div className="space-y-3 rounded-[1.5rem] border border-slate-200 p-4">
            <input value={form.imageUrl} onChange={(event) => updateField("imageUrl", event.target.value)} placeholder="Image URL" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100" />
            <label className="inline-flex cursor-pointer rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Upload slide image
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleImageUpload} className="hidden" />
            </label>
            {form.imageUrl ? (
              <div className="overflow-hidden rounded-xl bg-slate-100">
                <img src={form.imageUrl} alt={form.title || "Slide preview"} className="h-52 w-full object-cover" />
              </div>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <input value={form.ctaLabel} onChange={(event) => updateField("ctaLabel", event.target.value)} placeholder="CTA label" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100" />
            <input value={form.ctaHref} onChange={(event) => updateField("ctaHref", event.target.value)} placeholder="/catalog" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <input value={form.badge} onChange={(event) => updateField("badge", event.target.value)} placeholder="Badge" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100" />
            <input value={form.sortOrder} onChange={(event) => updateField("sortOrder", event.target.value)} placeholder="Sort order" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100" />
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={form.isActive} onChange={(event) => updateField("isActive", event.target.checked)} />
            Active in homepage slider
          </label>

          {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          {feedback ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div> : null}

          <button type="submit" disabled={isPending} className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
            {isPending ? "Saving..." : form.id ? "Update slide" : "Create slide"}
          </button>
        </form>
      </section>
    </div>
  );
}
