"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";

type Conversation = {
  id: string;
  buyer_id: string;
  designer_id: string;
  status: string;
};

type ChatMessage = {
  id: string;
  sender_id: string | null;
  message_type: string;
  content: string;
  created_at: string;
};

type Invoice = {
  id: string;
  buyer_id: string;
  designer_id: string;
  price: number;
  revisions: number;
  notes: string;
  status: string;
  platform_fee_percent: number;
  created_at: string;
};

const money = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const invoiceStatusLabel: Record<string, string> = {
  pending: "Menunggu pembayaran",
  awaiting_payment: "Menunggu pembayaran",
  paid: "Sudah dibayar",
  in_progress: "Sedang dikerjakan",
  revision: "Dalam revisi",
  completed: "Selesai",
  disputed: "Dalam sengketa",
  cancelled: "Dibatalkan",
};

const invoiceStatusColor = (status: string) => {
  if (status === "completed" || status === "paid") return "#86efac";
  if (status === "cancelled" || status === "disputed") return "#fca5a5";
  return "#fdba74";
};

const boxStyle: React.CSSProperties = {
  background: "#1A1A1A",
  borderRadius: "1rem",
  padding: "1rem",
  border: "1px solid rgba(255,255,255,0.1)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem",
  borderRadius: "0.5rem",
  background: "#111",
  color: "#F5F0E8",
  border: "1px solid #333",
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
  background: "#FF6B00",
  color: "#000",
  padding: "0.7rem 1rem",
  borderRadius: "9999px",
  border: "none",
  fontWeight: 700,
  cursor: "pointer",
};

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const routeId = String(params.id ?? "");
  const { user, authLoading } = useApp();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [designerName, setDesignerName] = useState("Desainer");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [text, setText] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [price, setPrice] = useState("");
  const [revisions, setRevisions] = useState("2");
  const [notes, setNotes] = useState("");
  const [stars, setStars] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const isUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

  const loadConversationData = useCallback(async (conversationId: string) => {
    const { data: conversationData, error: conversationError } = await supabase
      .from("gm_conversations")
      .select("id, buyer_id, designer_id, status")
      .eq("id", conversationId)
      .maybeSingle();

    if (conversationError) throw conversationError;
    if (!conversationData) throw new Error("Percakapan tidak ditemukan atau akun ini tidak memiliki akses.");

    const { data: messageData, error: messageError } = await supabase
      .from("gm_messages")
      .select("id, sender_id, message_type, content, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (messageError) throw messageError;

    const { data: invoiceData, error: invoiceError } = await supabase
      .from("gm_invoices")
      .select("id, buyer_id, designer_id, price, revisions, notes, status, platform_fee_percent, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false });

    if (invoiceError) throw invoiceError;

    setConversation(conversationData as Conversation);
    setMessages((messageData ?? []) as ChatMessage[]);
    setInvoices((invoiceData ?? []) as Invoice[]);

    const { data: designerProfile } = await supabase
      .from("gm_profiles")
      .select("username, full_name")
      .eq("user_id", conversationData.designer_id)
      .maybeSingle();

    setDesignerName(designerProfile?.full_name || designerProfile?.username || "Desainer");
  }, []);

  useEffect(() => {
    if (authLoading) return;

    let active = true;

    async function initialize() {
      setLoading(true);
      setNotice("");

      if (!user) {
        setNotice("Silakan masuk menggunakan magic link email terlebih dahulu.");
        setLoading(false);
        return;
      }

      try {
        if (isUuid(routeId)) {
          await loadConversationData(routeId);
        } else {
          const targetUsername = decodeURIComponent(routeId.replace(/^user-/, ""));

          const { data: targetProfile, error: targetError } = await supabase
            .from("gm_profiles")
            .select("user_id, username, full_name")
            .eq("username", targetUsername)
            .maybeSingle();

          if (targetError) throw targetError;
          if (!targetProfile) {
            throw new Error("Username desainer belum terdaftar di profil Supabase. Minta desainer menyimpan username di halaman Profil.");
          }
          if (targetProfile.user_id === user.id) {
            throw new Error("Ini profil akunmu sendiri. Untuk membuka percakapan, pilih profil desainer lain.");
          }

          const { data: existing, error: existingError } = await supabase
            .from("gm_conversations")
            .select("id, buyer_id, designer_id, status")
            .eq("buyer_id", user.id)
            .eq("designer_id", targetProfile.user_id)
            .maybeSingle();

          if (existingError) throw existingError;

          let conversationId = existing?.id;

          if (!conversationId) {
            const { data: created, error: createError } = await supabase
              .from("gm_conversations")
              .insert({
                buyer_id: user.id,
                designer_id: targetProfile.user_id,
              })
              .select("id")
              .single();

            if (createError) throw createError;
            conversationId = created.id;

            const { error: systemMessageError } = await supabase
              .from("gm_messages")
              .insert({
                conversation_id: conversationId,
                sender_id: user.id,
                message_type: "system",
                content: "Percakapan dimulai. Pesan dan tagihan akan disimpan di Garis Mimpi.",
              });

            if (systemMessageError) console.error("Pesan awal gagal disimpan:", systemMessageError.message);
          }

          if (!active) return;
          router.replace("/chat/" + conversationId);
          return;
        }
      } catch (error) {
        if (active) setNotice(error instanceof Error ? error.message : "Gagal memuat percakapan.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void initialize();

    return () => {
      active = false;
    };
  }, [authLoading, user, routeId, router, loadConversationData]);

  const sendMessage = async () => {
    if (!user || !conversation || !text.trim() || busy) return;

    setBusy(true);
    setNotice("");

    const { error } = await supabase.from("gm_messages").insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      message_type: "text",
      content: text.trim(),
    });

    if (error) {
      setNotice("Pesan gagal dikirim: " + error.message);
    } else {
      setText("");
      try {
        await loadConversationData(conversation.id);
      } catch (loadError) {
        setNotice(loadError instanceof Error ? loadError.message : "Pesan terkirim, tetapi gagal memuat ulang chat.");
      }
    }

    setBusy(false);
  };

  const sendInvoice = async () => {
    if (!user || !conversation || busy) return;

    if (user.id !== conversation.designer_id) {
      setNotice("Hanya desainer pada percakapan ini yang dapat membuat tagihan.");
      return;
    }

    const parsedPrice = Number(price);
    const parsedRevisions = Number(revisions);

    if (!Number.isSafeInteger(parsedPrice) || parsedPrice <= 0) {
      setNotice("Masukkan harga dalam Rupiah berupa bilangan bulat yang lebih besar dari nol.");
      return;
    }
    if (!Number.isInteger(parsedRevisions) || parsedRevisions < 0 || parsedRevisions > 100) {
      setNotice("Jumlah revisi harus berupa bilangan bulat dari 0 sampai 100.");
      return;
    }

    setBusy(true);
    setNotice("");

    const { data: invoice, error } = await supabase
      .from("gm_invoices")
      .insert({
        conversation_id: conversation.id,
        buyer_id: conversation.buyer_id,
        designer_id: conversation.designer_id,
        price: parsedPrice,
        revisions: parsedRevisions,
        notes: notes.trim(),
        status: "pending",
        platform_fee_percent: 8,
      })
      .select("id")
      .single();

    if (error) {
      setNotice("Tagihan gagal disimpan: " + error.message);
      setBusy(false);
      return;
    }

    const { error: messageError } = await supabase.from("gm_messages").insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      message_type: "system",
      content: "Tagihan dibuat: " + money(parsedPrice) + " • Revisi " + parsedRevisions + "x • Status: menunggu pembayaran.",
    });

    if (messageError) console.error("Tagihan tersimpan tetapi pesan pemberitahuan gagal:", messageError.message);

    setPrice("");
    setRevisions("2");
    setNotes("");
    setShowInvoice(false);
    setNotice("Tagihan berhasil disimpan. ID: " + invoice.id + ". Pembayaran belum dilakukan.");

    try {
      await loadConversationData(conversation.id);
    } catch (loadError) {
      setNotice(
        "Tagihan berhasil disimpan, tetapi daftar tagihan gagal dimuat ulang. Muat ulang halaman untuk melihatnya. " +
        (loadError instanceof Error ? loadError.message : "")
      );
    } finally {
      setBusy(false);
    }
  };

  const markStarsLocally = (n: number) => {
    // Rating permanen memerlukan tabel rating dan validasi pesanan selesai.
    setStars(n);
    setNotice("Pilihan " + n + " bintang dicatat sementara di halaman. Penyimpanan rating permanen belum diaktifkan.");
  };

  if (authLoading || loading) {
    return <div style={{ maxWidth: "700px", margin: "0 auto", padding: "3rem 0" }}>Memuat percakapan...</div>;
  }

  if (!user) {
    return (
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "3rem 0" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>Masuk untuk melanjutkan chat</h1>
        <p style={{ margin: "1rem 0", opacity: 0.75 }}>{notice}</p>
        <Link href="/" style={{ color: "#FF6B00" }}>← Kembali ke beranda dan masuk</Link>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "3rem 0" }}>
        <Link href="/" style={{ color: "#FF6B00" }}>← Beranda</Link>
        <p role="status" style={{ ...boxStyle, marginTop: "1rem", lineHeight: 1.6 }}>{notice || "Percakapan belum tersedia."}</p>
      </div>
    );
  }

  const isDesigner = user.id === conversation.designer_id;
  const isBuyer = user.id === conversation.buyer_id;
  const latestInvoice = invoices[0] ?? null;

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <Link href="/" style={{ color: "#FF6B00", textDecoration: "none", fontSize: "0.875rem" }}>← Beranda</Link>
      <h1 style={{ fontSize: "1.75rem", fontWeight: "bold", margin: "1rem 0" }}>
        Chat dengan {designerName}
      </h1>
      <p style={{ opacity: 0.65, fontSize: "0.85rem", marginBottom: "1rem" }}>
        ID percakapan: {conversation.id}
      </p>

      <div style={{ ...boxStyle, minHeight: "320px", marginBottom: "1rem" }}>
        {messages.length === 0 && <p style={{ opacity: 0.6 }}>Belum ada pesan. Mulai percakapan di bawah.</p>}
        {messages.map((message) => {
          const mine = message.sender_id === user.id;
          return (
            <div key={message.id} style={{ marginBottom: "0.75rem", textAlign: mine ? "right" : "left" }}>
              <span style={{
                display: "inline-block",
                background: mine ? "#FF6B00" : message.message_type === "system" ? "#222" : "#333",
                color: mine ? "#000" : "#F5F0E8",
                padding: "0.5rem 0.875rem",
                borderRadius: "1rem",
                whiteSpace: "pre-line",
                maxWidth: "85%",
                overflowWrap: "anywhere",
              }}>
                {message.content}
              </span>
              <div style={{ fontSize: "0.7rem", opacity: 0.45, marginTop: "0.2rem" }}>
                {new Date(message.created_at).toLocaleString("id-ID")}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && void sendMessage()}
          placeholder="Ketik pesan..."
          maxLength={10000}
          style={{ ...inputStyle, flex: 1, borderRadius: "9999px" }}
        />
        <button onClick={() => void sendMessage()} disabled={busy || !text.trim()} style={{ ...buttonStyle, opacity: busy ? 0.6 : 1 }}>
          Kirim
        </button>
      </div>

      {isDesigner && (
        <>
          <button onClick={() => setShowInvoice((value) => !value)} style={{ ...buttonStyle, background: "transparent", color: "#FF6B00", border: "1px solid #FF6B00", marginBottom: "1rem" }}>
            {showInvoice ? "Tutup Formulir" : "Buat Tagihan"}
          </button>

          {showInvoice && (
            <div style={{ ...boxStyle, marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Buat Tagihan Baru</h2>
              <label style={{ display: "block", marginBottom: "0.75rem" }}>
                Harga (Rupiah)
                <input type="number" min="1" step="1" placeholder="Contoh: 150000" value={price} onChange={(event) => setPrice(event.target.value)} style={{ ...inputStyle, marginTop: "0.35rem" }} />
              </label>
              <label style={{ display: "block", marginBottom: "0.75rem" }}>
                Jumlah revisi
                <input type="number" min="0" max="100" step="1" value={revisions} onChange={(event) => setRevisions(event.target.value)} style={{ ...inputStyle, marginTop: "0.35rem" }} />
              </label>
              <label style={{ display: "block", marginBottom: "0.75rem" }}>
                Catatan pekerjaan
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} maxLength={5000} placeholder="Jelaskan lingkup pekerjaan dan ketentuan..." style={{ ...inputStyle, marginTop: "0.35rem", resize: "vertical" }} />
              </label>
              <p style={{ fontSize: "0.85rem", opacity: 0.7, marginBottom: "1rem" }}>
                Fee platform 8% dicatat pada tagihan. Ini belum memproses pembayaran atau escrow.
              </p>
              <button onClick={() => void sendInvoice()} disabled={busy} style={buttonStyle}>
                {busy ? "Menyimpan..." : "Kirim Tagihan"}
              </button>
            </div>
          )}
        </>
      )}

      <section style={{ ...boxStyle, marginTop: "1rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.75rem" }}>Tagihan</h2>
        {invoices.length === 0 ? (
          <p style={{ opacity: 0.65 }}>Belum ada tagihan.</p>
        ) : invoices.map((invoice) => {
          const amount = Number(invoice.price);
          const feePercent = Number(invoice.platform_fee_percent);
          const estimatedFee = Math.round((amount * feePercent) / 100);
          const estimatedDesignerNet = amount - estimatedFee;

          return (
            <div key={invoice.id} style={{ borderTop: "1px solid #333", padding: "1rem 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <p style={{ fontSize: "1.2rem", fontWeight: 800, color: "#FF6B00" }}>{money(amount)}</p>
                  <p style={{ opacity: 0.55, fontSize: "0.75rem", marginTop: "0.25rem" }}>
                    Dibuat {new Date(invoice.created_at).toLocaleString("id-ID")}
                  </p>
                </div>
                <span style={{
                  display: "inline-block",
                  padding: "0.35rem 0.65rem",
                  borderRadius: "9999px",
                  background: "rgba(255,255,255,0.06)",
                  color: invoiceStatusColor(invoice.status),
                  fontSize: "0.8rem",
                  fontWeight: 700,
                }}>
                  {invoiceStatusLabel[invoice.status] || invoice.status}
                </span>
              </div>

              <div style={{ marginTop: "0.85rem", display: "grid", gap: "0.4rem" }}>
                <p>Jumlah revisi: <strong>{invoice.revisions}x</strong></p>
                <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>Catatan pekerjaan: {invoice.notes || "-"}</p>
              </div>

              <div style={{ marginTop: "0.85rem", padding: "0.75rem", borderRadius: "0.65rem", background: "#111", fontSize: "0.9rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                  <span>Harga pekerjaan</span><strong>{money(amount)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginTop: "0.4rem" }}>
                  <span>Fee platform ({feePercent}%)</span><span>{money(estimatedFee)}</span>
                </div>
                {isDesigner && (
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginTop: "0.4rem", borderTop: "1px solid #333", paddingTop: "0.5rem" }}>
                    <span>Perkiraan bersih desainer*</span><strong>{money(estimatedDesignerNet)}</strong>
                  </div>
                )}
              </div>

              {isBuyer && (invoice.status === "pending" || invoice.status === "awaiting_payment") && (
                <p style={{ marginTop: "0.75rem", opacity: 0.75, fontSize: "0.85rem", lineHeight: 1.5 }}>
                  Tagihan ini belum dibayar. Pembayaran online dan escrow belum aktif; jangan mengirim uang berdasarkan status pada halaman ini.
                </p>
              )}
              <p style={{ marginTop: "0.65rem", opacity: 0.45, fontSize: "0.72rem", overflowWrap: "anywhere" }}>
                ID tagihan: {invoice.id}
              </p>
            </div>
          );
        })}
      </section>

      {isBuyer && latestInvoice?.status === "completed" && stars === 0 && (
        <div style={{ ...boxStyle, marginTop: "1rem" }}>
          <p style={{ marginBottom: "0.75rem" }}>Beri bintang (1–3):</p>
          {[1, 2, 3].map((number) => (
            <button key={number} onClick={() => markStarsLocally(number)} style={{ ...buttonStyle, marginRight: "0.5rem" }}>
              {number} ★
            </button>
          ))}
        </div>
      )}

      {notice && <p role="status" style={{ marginTop: "1rem", color: notice.startsWith("Gagal") ? "#ff8c8c" : "#FF6B00", lineHeight: 1.6 }}>{notice}</p>}

      <p style={{ marginTop: "1.25rem", opacity: 0.5, fontSize: "0.8rem", lineHeight: 1.5 }}>
        *Perkiraan bersih desainer mengasumsikan fee platform dipotong dari harga pekerjaan, bukan ditambahkan ke tagihan pembeli. Aturan fee dan pembayaran final perlu dikonfirmasi sebelum integrasi pembayaran.
      </p>
      <p style={{ marginTop: "0.5rem", opacity: 0.5, fontSize: "0.8rem" }}>
        Pembayaran dan escrow belum diaktifkan. Jangan mengirim uang berdasarkan status di halaman ini.
      </p>
    </div>
  );
}
