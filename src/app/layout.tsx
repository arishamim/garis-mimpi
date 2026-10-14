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
      <body className="min-h-screen bg-[#0D0D0D] text-[#F5F0E8] antialiased">
        <AppProvider>
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            {children}
          </main>
          <footer className="border-t border-white/10 text-center py-8 text-sm text-white/50 mt-16">
            © 2026 Garis Mimpi • Fee platform 8% • Transaksi di luar platform dilarang
          </footer>
        </AppProvider>
      </body>
    </html>
  );
}
