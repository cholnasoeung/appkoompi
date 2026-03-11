"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-6 py-16">
      <section className="mx-auto max-w-2xl rounded-[2rem] border border-rose-200 bg-white p-10 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-600">
          Error Boundary
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-slate-950">
          Something went wrong while loading the task manager.
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          This is a basic App Router error boundary. Use reset to retry the
          failed render or data request.
        </p>
        <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
          {error.message || "Unexpected application error."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
