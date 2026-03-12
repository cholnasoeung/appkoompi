"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark";

    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
    setMounted(true);
  }, []);

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