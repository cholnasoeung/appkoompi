export default function ProjectsPage() {
  const projects = [
    {
      title: "Portfolio Website",
      description:
        "A modern personal portfolio built with Next.js and Tailwind CSS to showcase my skills and projects.",
      tech: ["Next.js", "Tailwind CSS", "TypeScript"],
      status: "Completed",
    },
    {
      title: "Hospital Dashboard",
      description:
        "A dashboard concept for managing reports, data, and workflows with a clean responsive interface.",
      tech: ["React", "Tailwind CSS", "UI Design"],
      status: "In Progress",
    },
    {
      title: "Student Learning App",
      description:
        "A learning platform idea to help students track lessons, progress, and study materials.",
      tech: ["Next.js", "App Router", "Vercel"],
      status: "Planned",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-6 py-12 sm:px-10 lg:px-20">
      <section className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
            My Work
          </p>

          <h1 className="mt-4 text-4xl font-bold text-gray-900 sm:text-5xl">
            Projects I’ve Built
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Here are some of the projects I have worked on while learning
            Next.js, React, Tailwind CSS, and modern frontend development.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project, index) => (
            <div
              key={index}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {project.title}
                </h2>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                  {project.status}
                </span>
              </div>

              <p className="mt-4 leading-7 text-gray-600">
                {project.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {project.tech.map((item, techIndex) => (
                  <span
                    key={techIndex}
                    className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex gap-3">
                <a
                  href="#"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
                >
                  View Project
                </a>
                <a
                  href="#"
                  className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  Source Code
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}