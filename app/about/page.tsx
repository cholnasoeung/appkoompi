export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12 sm:px-10 lg:px-20">
      <section className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-md sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
          About Me
        </p>

        <h1 className="mt-3 text-4xl font-bold text-gray-900 sm:text-5xl">
          Learn more about who I am
        </h1>

        <p className="mt-6 text-lg leading-8 text-gray-600">
          I am learning Next.js, React, and Tailwind CSS while building modern,
          responsive websites. This portfolio is part of my journey to improve
          my frontend development skills and create real projects for practice.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-xl font-semibold text-gray-900">My Goal</h2>
            <p className="mt-3 text-gray-600">
              My goal is to become confident in building clean, responsive, and
              user-friendly web applications using modern tools.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-xl font-semibold text-gray-900">What I’m Learning</h2>
            <p className="mt-3 text-gray-600">
              I am practicing App Router, reusable components, Tailwind layout,
              GitHub workflow, and deployment with Vercel.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <a
            href="/projects"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            View My Projects
          </a>
        </div>
      </section>
    </main>
  );
}