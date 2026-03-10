export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-6 py-12 sm:px-10 lg:px-20">
      <section className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
            Contact Me
          </p>

          <h1 className="mt-4 text-4xl font-bold text-gray-900 sm:text-5xl">
            Let’s Work Together
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            I’m learning and building modern websites with Next.js, React, and
            Tailwind CSS. Feel free to reach out for collaboration, project
            ideas, or just to say hello.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900">
              Send me a message
            </h2>
            <p className="mt-3 text-gray-600">
              Fill out the form below and I’ll get back to you soon.
            </p>

            <form className="mt-8 space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Write your message..."
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700"
              >
                Send Message
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900">
              Contact Information
            </h2>
            <p className="mt-3 text-gray-600">
              You can also connect with me through these channels.
            </p>

            <div className="mt-8 space-y-6">
              <div className="rounded-xl bg-slate-50 p-5">
                <h3 className="text-lg font-semibold text-gray-900">Email</h3>
                <p className="mt-2 text-gray-600">yourname@email.com</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <h3 className="text-lg font-semibold text-gray-900">Phone</h3>
                <p className="mt-2 text-gray-600">+855 XX XXX XXX</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <h3 className="text-lg font-semibold text-gray-900">Location</h3>
                <p className="mt-2 text-gray-600">Phnom Penh, Cambodia</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <h3 className="text-lg font-semibold text-gray-900">
                  Social Links
                </h3>
                <div className="mt-3 flex flex-wrap gap-3">
                  <a
                    href="#"
                    className="rounded-lg bg-gray-900 px-4 py-2 text-white transition hover:bg-black"
                  >
                    GitHub
                  </a>
                  <a
                    href="#"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                  >
                    LinkedIn
                  </a>
                  <a
                    href="#"
                    className="rounded-lg bg-pink-500 px-4 py-2 text-white transition hover:bg-pink-600"
                  >
                    Portfolio
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}