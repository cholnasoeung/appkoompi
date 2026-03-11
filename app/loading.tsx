export default function LoadingPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef6ff_100%)] px-6 py-16">
      <section className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-10 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-40 rounded-full bg-slate-200" />
          <div className="h-14 w-full max-w-3xl rounded-3xl bg-slate-200" />
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="h-28 rounded-3xl bg-slate-200" />
            <div className="h-28 rounded-3xl bg-slate-200" />
            <div className="h-28 rounded-3xl bg-slate-200" />
            <div className="h-28 rounded-3xl bg-slate-200" />
          </div>
          <div className="h-64 rounded-[2rem] bg-slate-100" />
        </div>
      </section>
    </main>
  );
}
