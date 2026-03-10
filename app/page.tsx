export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-6 py-12 sm:px-10 lg:px-20">
      <section className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
            Welcome to my portfolio
          </p>

          <h1 className="mt-6 text-5xl font-bold leading-tight text-gray-900 sm:text-6xl">
            Building modern and creative
            <span className="block text-blue-600">web experiences</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            I am learning Next.js, React, and Tailwind CSS while creating
            responsive, clean, and user-friendly websites. This portfolio shows
            my journey, projects, and growth as a frontend developer.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/projects"
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700"
            >
              View Projects
            </a>
            <a
              href="/about"
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-800 transition hover:bg-gray-100"
            >
              About Me
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">10+</h2>
              <p className="text-gray-600">Practice Projects</p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">3+</h2>
              <p className="text-gray-600">Core Technologies</p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">100%</h2>
              <p className="text-gray-600">Learning Focus</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-blue-200 blur-2xl"></div>
          <div className="absolute -bottom-8 right-0 h-32 w-32 rounded-full bg-purple-200 blur-2xl"></div>

          <div className="relative rounded-3xl border border-white/60 bg-white/80 p-8 shadow-2xl backdrop-blur">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-100 p-6">
                <p className="text-sm font-medium text-gray-500">Frontend</p>
                <h3 className="mt-2 text-xl font-bold text-gray-900">
                  Next.js
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Building fast and modern React applications.
                </p>
              </div>

              <div className="rounded-2xl bg-blue-50 p-6">
                <p className="text-sm font-medium text-gray-500">Styling</p>
                <h3 className="mt-2 text-xl font-bold text-gray-900">
                  Tailwind CSS
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Creating responsive and beautiful UI designs.
                </p>
              </div>

              <div className="rounded-2xl bg-purple-50 p-6">
                <p className="text-sm font-medium text-gray-500">Programming</p>
                <h3 className="mt-2 text-xl font-bold text-gray-900">
                  TypeScript
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Writing safer and cleaner code for real projects.
                </p>
              </div>

              <div className="rounded-2xl bg-green-50 p-6">
                <p className="text-sm font-medium text-gray-500">Deployment</p>
                <h3 className="mt-2 text-xl font-bold text-gray-900">
                  Vercel
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Publishing projects online with easy deployment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}