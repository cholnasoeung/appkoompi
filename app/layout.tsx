import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Task Manager",
  description:
    "Full CRUD task manager with Next.js, MongoDB, Tailwind CSS, optimistic UI, and server-rendered data fetching",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-white text-black dark:bg-black dark:text-white">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
