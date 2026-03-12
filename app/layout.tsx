import { auth } from "@/auth";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cholna Store",
  description:
    "Modern ecommerce storefront for curated products across home, workspace, and travel.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        <SessionProviderWrapper session={session}>
          <Navbar />
          {children}
          <Footer />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
