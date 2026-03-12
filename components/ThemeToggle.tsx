"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

export default function ThemeToggle() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const toggleTheme = () => {
    const nextMode = !darkMode;

    setDarkMode(nextMode);
    document.documentElement.classList.toggle("dark", nextMode);
    localStorage.setItem("theme", nextMode ? "dark" : "light");
  };

  if (!mounted) {
    return (
      <button
        disabled
        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-400"
      >
        Theme
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      {darkMode ? "Light" : "Dark"}
    </button>
  );
}
