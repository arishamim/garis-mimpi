"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function ChatPage() {
  const params = useParams();
  const id = params.id as string;
  const [messages, setMessages] = useState([
    { from: "system", text: "Chat dimulai. Desainer akan membuat tagihan di sini." },
  ]);
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    setMessages([...messages, { from: "me", text }]);
    setText("");
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <Link href="/" style={{ color: "#FF6B00", textDecoration: "none", fontSize: "0.875rem" }}>← Beranda</Link>
      <h1 style={{ fontSize: "1.75rem", fontWeight: "bold", margin: "1rem 0" }}>Chat dengan {id.replace("user-", "")}</h1>

      <div style={{
        background: "#1A1A1A",
        borderRadius: "1rem",
        padding: "1rem",
        minHeight: "300px",
        marginBottom: "1rem",
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            marginBottom: "0.75rem",
            textAlign: m.from === "me" ? "right" : "left"
          }}>
            <span style={{
              display: "inline-block",
              background: m.from === "me" ? "#FF6B00" : "#333",
              color: m.from === "me" ? "#000" : "#F5F0E8",
              padding: "0.5rem 0.875rem",
              borderRadius: "1rem",
              maxWidth: "80%"
            }}>
              {m.text}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ketik pesan..."
          style={{
            flex: 1,
            padding: "0.75rem 1rem",
            borderRadius: "9999px",
            background: "#1A1A1A",
            color: "#F5F0E8",
            border: "1px solid rgba(255,255,255,0.2)"
          }}
        />
        <button onClick={send} style={{
          background: "#FF6B00",
          color: "#000",
          padding: "0.75rem 1.5rem",
          borderRadius: "9999px",
          border: "none",
          fontWeight: 600,
          cursor: "pointer"
        }}>
          Kirim
        </button>
      </div>
    </div>
  );
}
