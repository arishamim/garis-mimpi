"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function ChatPage() {
  const params = useParams();
  const id = params.id as string;
  const designerName = id.replace("user-", "");

  const [messages, setMessages] = useState([
    { from: "system", text: "Chat dimulai. Desainer bisa membuat tagihan." },
  ]);
  const [text, setText] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [price, setPrice] = useState("");
  const [revisions, setRevisions] = useState("2");
  const [notes, setNotes] = useState("");
  const [invoiceSent, setInvoiceSent] = useState(false);
  const [paid, setPaid] = useState(false);
  const [stars, setStars] = useState(0);

  const send = () => {
    if (!text.trim()) return;
    setMessages([...messages, { from: "me", text }]);
    setText("");
  };

  const sendInvoice = () => {
    if (!price) return;
    setMessages([
      ...messages,
      {
        from: "designer",
        text: `TAGIHAN\nHarga: Rp ${Number(price).toLocaleString("id-ID")}\nRevisi: ${revisions}x\nCatatan: ${notes || "-"}`,
      },
    ]);
    setInvoiceSent(true);
    setShowInvoice(false);
  };

  const pay = () => {
    setPaid(true);
    setMessages([...messages, { from: "system", text: "Pembayaran berhasil (simulasi). Uang masuk escrow." }]);
  };

  const giveStars = (n: number) => {
    setStars(n);
    setMessages([...messages, { from: "system", text: `Pembeli memberi ${n} bintang.` }]);
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <Link href="/" style={{ color: "#FF6B00", textDecoration: "none", fontSize: "0.875rem" }}>← Beranda</Link>
      <h1 style={{ fontSize: "1.75rem", fontWeight: "bold", margin: "1rem 0" }}>Chat dengan {designerName}</h1>

      <div style={{
        background: "#1A1A1A",
        borderRadius: "1rem",
        padding: "1rem",
        minHeight: "320px",
        marginBottom: "1rem",
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: "0.75rem", textAlign: m.from === "me" ? "right" : "left" }}>
            <span style={{
              display: "inline-block",
              background: m.from === "me" ? "#FF6B00" : m.from === "designer" ? "#333" : "#222",
              color: m.from === "me" ? "#000" : "#F5F0E8",
              padding: "0.5rem 0.875rem",
              borderRadius: "1rem",
              whiteSpace: "pre-line",
              maxWidth: "85%"
            }}>
              {m.text}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ketik pesan..."
          style={{ flex: 1, padding: "0.75rem 1rem", borderRadius: "9999px", background: "#1A1A1A", color: "#F5F0E8", border: "1px solid rgba(255,255,255,0.2)" }}
        />
        <button onClick={send} style={{ background: "#FF6B00", color: "#000", padding: "0.75rem 1.5rem", borderRadius: "9999px", border: "none", fontWeight: 600 }}>
          Kirim
        </button>
      </div>

      {!invoiceSent && (
        <button onClick={() => setShowInvoice(!showInvoice)} style={{ background: "transparent", color: "#FF6B00", border: "1px solid #FF6B00", padding: "0.5rem 1rem", borderRadius: "9999px", marginBottom: "1rem" }}>
          Buat Tagihan
        </button>
      )}

      {showInvoice && (
        <div style={{ background: "#1A1A1A", padding: "1rem", borderRadius: "0.75rem", marginBottom: "1rem" }}>
          <input placeholder="Harga (contoh: 150000)" value={price} onChange={(e) => setPrice(e.target.value)} style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem", borderRadius: "0.5rem", background: "#111", color: "#F5F0E8", border: "1px solid #333" }} />
          <input placeholder="Jumlah revisi" value={revisions} onChange={(e) => setRevisions(e.target.value)} style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem", borderRadius: "0.5rem", background: "#111", color: "#F5F0E8", border: "1px solid #333" }} />
          <textarea placeholder="Catatan" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem", borderRadius: "0.5rem", background: "#111", color: "#F5F0E8", border: "1px solid #333" }} />
          <button onClick={sendInvoice} style={{ background: "#FF6B00", color: "#000", padding: "0.5rem 1rem", borderRadius: "9999px", border: "none", fontWeight: 600 }}>Kirim Tagihan</button>
        </div>
      )}

      {invoiceSent && !paid && (
        <button onClick={pay} style={{ background: "#FF6B00", color: "#000", padding: "0.75rem 1.5rem", borderRadius: "9999px", border: "none", fontWeight: 700, marginRight: "0.5rem" }}>
          Bayar Sekarang
        </button>
      )}

      {paid && stars === 0 && (
        <div style={{ marginTop: "1rem" }}>
          <p style={{ marginBottom: "0.5rem" }}>Beri bintang (1–3):</p>
          {[1, 2, 3].map((n) => (
            <button key={n} onClick={() => giveStars(n)} style={{ background: "#FF6B00", color: "#000", padding: "0.5rem 1rem", borderRadius: "9999px", border: "none", marginRight: "0.5rem", fontWeight: 600 }}>
              {n} ★
            </button>
          ))}
        </div>
      )}

      {stars > 0 && <p style={{ marginTop: "1rem", color: "#FF6B00" }}>Terima kasih! Kamu memberi {stars} bintang.</p>}
    </div>
  );
}
