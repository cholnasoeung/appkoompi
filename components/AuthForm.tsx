"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

type AuthFormProps = {
  mode: "login" | "register";
  callbackUrl?: string;
  initialError?: string | null;
  githubEnabled?: boolean;
};

const copy = {
  login: {
    eyebrow: "Protected Workspace",
    title: "Sign in to manage your tasks.",
    subtitle:
      "Use GitHub or your email and password to access your personal task board.",
    submit: "Sign in",
    alternateLabel: "Need an account?",
    alternateHref: "/register",
    alternateAction: "Create one",
  },
  register: {
    eyebrow: "Create Account",
    title: "Set up your credentials login.",
    subtitle:
      "Create an account, then use the same email and password alongside GitHub sign-in.",
    submit: "Create account",
    alternateLabel: "Already have an account?",
    alternateHref: "/login",
    alternateAction: "Sign in",
  },
} as const;

export default function AuthForm({
  mode,
  callbackUrl = "/",
  initialError = null,
  githubEnabled = false,
}: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(initialError);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleGitHubSignIn() {
    setError(null);
    await signIn("github", { callbackUrl });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      if (mode === "register") {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message ?? "Unable to create account.");
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      router.push(result?.url ?? callbackUrl);
      router.refresh();
    });
  }

  const content = copy[mode];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.14),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] px-6 py-16">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-white/70 bg-white/75 p-10 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-700">
            {content.eyebrow}
          </p>
          <h1 className="mt-5 max-w-lg text-4xl font-black tracking-[-0.04em] text-slate-950">
            {content.title}
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
            {content.subtitle}
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                Auth
              </p>
              <p className="mt-3 text-2xl font-black">NextAuth.js</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Providers
              </p>
              <p className="mt-3 text-2xl font-black text-slate-950">
                GitHub + Credentials
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Access
              </p>
              <p className="mt-3 text-2xl font-black text-slate-950">
                Middleware Protected
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200/70 bg-white p-8 shadow-xl shadow-slate-200/70">
          {githubEnabled ? (
            <>
              <button
                type="button"
                onClick={handleGitHubSignIn}
                className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Continue with GitHub
              </button>

              <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                <span>or</span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>
            </>
          ) : (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              GitHub login is disabled until `GITHUB_ID` and `GITHUB_SECRET`
              are set.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" ? (
              <div>
                <label
                  htmlFor="name"
                  className="text-sm font-semibold text-slate-700"
                >
                  Name
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  placeholder="Your name"
                />
              </div>
            ) : null}

            <div>
              <label
                htmlFor="email"
                className="text-sm font-semibold text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-semibold text-slate-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                placeholder="At least 8 characters"
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Please wait..." : content.submit}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            {content.alternateLabel}{" "}
            <Link
              href={content.alternateHref}
              className="font-semibold text-sky-700 hover:text-sky-800"
            >
              {content.alternateAction}
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
