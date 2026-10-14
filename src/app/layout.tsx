import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Garis Mimpi — Design Marketplace",
  description: "Platform marketplace khusus untuk penggiat desain grafis",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#D4BFA2] text-[#450213]">
        <AppProvider>
          <Header />
          <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
          <footer className="bg-[#450213] text-white text-center py-6 text-sm mt-12">
            © 2026 Garis Mimpi • Fee platform 8% • Transaksi di luar platform dilarang
          </footer>
        </AppProvider>
      </body>
    </html>
  );
}
