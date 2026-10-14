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
      <body className="min-h-screen bg-[#D4BFA2] text-[#450213] antialiased">
        <AppProvider>
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            {children}
          </main>
          <footer className="bg-[#450213] text-white text-center py-8 text-sm mt-16">
            <div className="max-w-7xl mx-auto px-4">
              © 2026 Garis Mimpi • Fee platform 8% • Transaksi di luar platform dilarang
            </div>
          </footer>
        </AppProvider>
      </body>
    </html>
  );
}
