export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)] px-6 py-12 sm:px-10 lg:px-16">
      <section className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
          About This Project
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">
          CRUD tasks with server-rendered data and optimistic client updates.
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
          This app demonstrates a practical Next.js App Router setup using
          MongoDB and Mongoose for persistence, API route handlers for mutations,
          controlled React forms, and a basic route-level error boundary.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-slate-950 p-6 text-white">
            <h2 className="text-2xl font-bold">Data fetching</h2>
            <p className="mt-4 leading-7 text-slate-300">
              The home page loads tasks in a server component, then the client
              component uses `fetch` for create, update, and delete requests.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-2xl font-bold text-slate-950">UI behavior</h2>
            <p className="mt-4 leading-7 text-slate-600">
              The task list updates optimistically before the network request
              resolves, then rolls back if the API returns an error.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
