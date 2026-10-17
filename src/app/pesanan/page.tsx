"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";

type Invoice = {
  id: string;
  conversation_id: string;
  buyer_id: string;
  designer_id: string;
  price: number;
  revisions: number;
  notes: string | null;
  status: string;
  platform_fee_percent: number | null;
  created_at: string;
};

const statusLabels: Record<string, string> = {
  pending: "Menunggu pembayaran",
  awaiting_payment: "Menunggu pembayaran",
  paid: "Sudah dibayar",
  in_progress: "Sedang dikerjakan",
  revision: "Dalam revisi",
  completed: "Selesai",
  disputed: "Dalam sengketa",
  cancelled: "Dibatalkan",
};

const statusColors: Record<string, { color: string; background: string }> = {
  pending: { color: "#9A5A00", background: "#FFF0D2" },
  awaiting_payment: { color: "#9A5A00", background: "#FFF0D2" },
  paid: { color: "#155E75", background: "#CFFAFE" },
  in_progress: { color: "#1D4ED8", background: "#DBEAFE" },
  revision: { color: "#6D28D9", background: "#EDE9FE" },
  completed: { color: "#166534", background: "#DCFCE7" },
  disputed: { color: "#991B1B", background: "#FEE2E2" },
  cancelled: { color: "#525252", background: "#E5E5E5" },
};

const money = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const dateLabel = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export default function PesananPage() {
  const { user, loggedIn, authLoading } = useApp();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("semua");

  useEffect(() => {
    let active = true;

    async function loadInvoices() {
      if (authLoading) return;
      if (!user) {
        if (active) {
          setInvoices([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError("");
      const { data, error: queryError } = await supabase
        .from("gm_invoices")
        .select("id, conversation_id, buyer_id, designer_id, price, revisions, notes, status, platform_fee_percent, created_at")
        .or(`buyer_id.eq.${user.id},designer_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (!active) return;
      if (queryError) {
        setError("Tagihan belum bisa dimuat. " + queryError.message);
        setInvoices([]);
      } else {
        setInvoices((data ?? []) as Invoice[]);
      }
      setLoading(false);
    }

    void loadInvoices();
    return () => {
      active = false;
    };
  }, [user, authLoading]);

  const visibleInvoices = useMemo(
    () => filter === "semua" ? invoices : invoices.filter((invoice) => invoice.status === filter),
    [invoices, filter]
  );

  const totalValue = invoices.reduce((sum, invoice) => sum + (Number(invoice.price) || 0), 0);
  const activeCount = invoices.filter((invoice) => !["completed", "cancelled"].includes(invoice.status)).length;

  if (authLoading || loading) {
    return <main style={pageStyle}><p style={{ opacity: 0.75 }}>Memuat daftar pesanan…</p></main>;
  }

  if (!loggedIn || !user) {
    return (
      <main style={pageStyle}>
        <Link href="/" style={backLink}>← Kembali ke beranda</Link>
        <section style={emptyCard}>
          <div style={eyebrow}>GARIS MIMPI / PESANAN</div>
          <h1 style={heading}>Pesanan dan tagihanmu</h1>
          <p style={paragraph}>Masuk terlebih dahulu untuk melihat tagihan yang terhubung ke akunmu.</p>
          <Link href="/profile" style={buttonLink}>Buka halaman profil</Link>
          <p style={smallText}>Kamu juga bisa menggunakan tombol Masuk di bagian atas halaman.</p>
        </section>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={topLine}>
        <div>
          <div style={eyebrow}>RUANG KERJA / PESANAN</div>
          <h1 style={heading}>Pesanan & tagihan</h1>
          <p style={paragraph}>Pantau status tagihan dan lanjutkan percakapan dengan desainer dari satu tempat.</p>
        </div>
        <Link href="/" style={backLink}>← Jelajahi karya</Link>
      </div>

      <div style={statsGrid}>
        <section style={statCard}>
          <span style={statLabel}>Total tagihan</span>
          <strong style={statValue}>{invoices.length}</strong>
        </section>
        <section style={statCard}>
          <span style={statLabel}>Pesanan berjalan</span>
          <strong style={statValue}>{activeCount}</strong>
        </section>
        <section style={statCard}>
          <span style={statLabel}>Akumulasi nilai tagihan</span>
          <strong style={{ ...statValue, fontSize: "1.15rem" }}>{money(totalValue)}</strong>
        </section>
      </div>

      <div style={filterRow}>
        <label htmlFor="invoice-filter" style={statLabel}>Filter status</label>
        <select id="invoice-filter" value={filter} onChange={(event) => setFilter(event.target.value)} style={selectStyle}>
          <option value="semua">Semua status</option>
          <option value="pending">Menunggu pembayaran</option>
          <option value="awaiting_payment">Menunggu pembayaran (alternatif)</option>
          <option value="paid">Sudah dibayar</option>
          <option value="in_progress">Sedang dikerjakan</option>
          <option value="revision">Dalam revisi</option>
          <option value="completed">Selesai</option>
          <option value="disputed">Dalam sengketa</option>
          <option value="cancelled">Dibatalkan</option>
        </select>
      </div>

      {error && <div role="alert" style={errorCard}>{error}<p style={smallText}>Jika pesan ini menyebut kolom atau tabel tidak ditemukan, struktur database perlu dicocokkan sebelum fitur dilanjutkan.</p></div>}

      {!error && invoices.length === 0 && (
        <section style={emptyCard}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✳</div>
          <h2 style={subheading}>Belum ada tagihan</h2>
          <p style={paragraph}>Tagihan yang dibuat dalam percakapan akan muncul di halaman ini setelah tersimpan di database.</p>
          <Link href="/" style={buttonLink}>Jelajahi karya desainer</Link>
        </section>
      )}

      {!error && invoices.length > 0 && visibleInvoices.length === 0 && (
        <section style={emptyCard}>
          <h2 style={subheading}>Tidak ada tagihan dengan status ini</h2>
          <button onClick={() => setFilter("semua")} style={buttonStyle}>Tampilkan semua</button>
        </section>
      )}

      <div style={listStyle}>
        {visibleInvoices.map((invoice) => {
          const status = statusColors[invoice.status] ?? { color: "#404040", background: "#E5E5E5" };
          const role = invoice.buyer_id === user.id ? "Kamu sebagai pembeli" : "Kamu sebagai desainer";
          return (
            <article key={invoice.id} style={invoiceCard}>
              <div style={invoiceTop}>
                <div>
                  <div style={eyebrow}>TAGIHAN • {invoice.id.slice(0, 8).toUpperCase()}</div>
                  <h2 style={subheading}>{money(Number(invoice.price) || 0)}</h2>
                  <p style={smallText}>{role} · {dateLabel(invoice.created_at)}</p>
                </div>
                <span style={{ ...statusPill, color: status.color, background: status.background }}>
                  {statusLabels[invoice.status] ?? invoice.status}
                </span>
              </div>
              <div style={detailsGrid}>
                <div><span style={detailLabel}>Revisi</span><strong>{invoice.revisions}</strong></div>
                <div><span style={detailLabel}>Biaya platform (estimasi)</span><strong>{invoice.platform_fee_percent ?? 8}%</strong></div>
              </div>
              {invoice.notes?.trim() && <p style={notesStyle}>{invoice.notes}</p>}
              <div style={cardFooter}>
                <span style={smallText}>Pembayaran belum diproses melalui halaman ini.</span>
                <Link href={`/chat/${invoice.conversation_id}`} style={buttonLink}>Buka percakapan →</Link>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}

const pageStyle: React.CSSProperties = { maxWidth: 1000, margin: "0 auto", padding: "2.5rem 1.25rem 5rem", color: "#F5F0E8" };
const topLine: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap", marginBottom: "1.75rem" };
const eyebrow: React.CSSProperties = { fontSize: "0.72rem", letterSpacing: "0.16em", fontWeight: 800, color: "#FF6B00", marginBottom: "0.65rem" };
const heading: React.CSSProperties = { fontSize: "clamp(2rem, 5vw, 3.25rem)", letterSpacing: "-0.055em", lineHeight: 1.05, margin: "0 0 0.75rem", fontWeight: 900 };
const subheading: React.CSSProperties = { fontSize: "1.25rem", margin: "0.35rem 0 0.5rem", fontWeight: 800 };
const paragraph: React.CSSProperties = { color: "rgba(245,240,232,0.7)", lineHeight: 1.65, margin: "0 0 1rem", maxWidth: 620 };
const smallText: React.CSSProperties = { fontSize: "0.82rem", color: "rgba(245,240,232,0.65)", lineHeight: 1.55, margin: "0.35rem 0" };
const backLink: React.CSSProperties = { color: "#F5F0E8", opacity: 0.8, textDecoration: "none", fontSize: "0.9rem", fontWeight: 700 };
const statsGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.8rem", marginBottom: "1.5rem" };
const statCard: React.CSSProperties = { border: "1px solid rgba(255,255,255,0.13)", borderRadius: "1rem", padding: "1rem 1.1rem", background: "#171717" };
const statLabel: React.CSSProperties = { display: "block", fontSize: "0.8rem", color: "rgba(245,240,232,0.65)", marginBottom: "0.45rem" };
const statValue: React.CSSProperties = { display: "block", fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-0.04em", overflowWrap: "anywhere" };
const filterRow: React.CSSProperties = { display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem" };
const selectStyle: React.CSSProperties = { padding: "0.65rem 0.85rem", borderRadius: "0.7rem", border: "1px solid rgba(255,255,255,0.18)", background: "#171717", color: "#F5F0E8" };
const invoiceCard: React.CSSProperties = { border: "1px solid rgba(255,255,255,0.13)", background: "#171717", borderRadius: "1rem", padding: "1.15rem", marginBottom: "0.9rem" };
const invoiceTop: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" };
const statusPill: React.CSSProperties = { borderRadius: "999px", padding: "0.45rem 0.7rem", fontSize: "0.78rem", fontWeight: 800 };
const detailsGrid: React.CSSProperties = { display: "flex", gap: "2rem", flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: "1rem", paddingTop: "1rem" };
const detailLabel: React.CSSProperties = { display: "block", fontSize: "0.75rem", opacity: 0.65, marginBottom: "0.35rem" };
const notesStyle: React.CSSProperties = { background: "rgba(255,255,255,0.04)", borderRadius: "0.7rem", padding: "0.8rem", whiteSpace: "pre-wrap", lineHeight: 1.55 };
const cardFooter: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.8rem", borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: "1rem", paddingTop: "1rem" };
const emptyCard: React.CSSProperties = { border: "1px solid rgba(255,255,255,0.13)", background: "#171717", borderRadius: "1.25rem", padding: "clamp(1.25rem, 4vw, 2rem)", margin: "1rem 0 1.5rem" };
const buttonLink: React.CSSProperties = { display: "inline-block", background: "#FF6B00", color: "#0D0D0D", padding: "0.75rem 1rem", borderRadius: "999px", textDecoration: "none", fontWeight: 800, fontSize: "0.88rem" };
const buttonStyle: React.CSSProperties = { background: "transparent", color: "#F5F0E8", border: "1px solid rgba(255,255,255,0.2)", padding: "0.65rem 0.9rem", borderRadius: "999px", cursor: "pointer" };
const errorCard: React.CSSProperties = { background: "#3A1717", border: "1px solid #8C3A3A", borderRadius: "0.9rem", padding: "1rem", margin: "1rem 0" };
