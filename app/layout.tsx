import type { Metadata, Viewport } from "next";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Métro Paris — apprendre les stations en s'amusant",
  description:
    "Apprends, mémorise et maîtrise toutes les stations du métro parisien grâce à des quiz interactifs, une carte dynamique et un système de répétition espacée.",
};

export const viewport: Viewport = {
  themeColor: "#FAF8F3",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
