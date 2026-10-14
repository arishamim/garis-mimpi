"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { useState } from "react";

export default function Header() {
  const { lang, setLang, loggedIn, userEmail, login, logout } = useApp();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");

  const t = {
    id: { login: "Masuk", logout: "Keluar", title: "Masuk / Daftar", desc: "Masukkan email yang terhubung ke nomor HP", send: "Kirim Magic Link", cancel: "Batal" },
    en: { login: "Login", logout: "Logout", title: "Login / Register", desc: "Enter the email linked to your phone", send: "Send Magic Link", cancel: "Cancel" },
  }[lang];

  const handleLogin = () => {
    if (!email.includes("@")) {
      alert(lang === "id" ? "Email tidak valid" : "Invalid email");
      return;
    }
    login(email);
    setShowLogin(false);
    alert(lang === "id" ? `Magic link dikirim ke ${email} (simulasi)` : `Magic link sent to ${email} (simulation)`);
  };

  return (
    <>
      <header style={{
        background: "#0D0D0D",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        padding: "1rem 0"
      }}>
        <div style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <Link href="/" style={{ fontSize: "1.5rem", fontWeight: 800, color: "#FF6B00", textDecoration: "none" }}>
            GARISMIMPI
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ display: "flex", background: "rgba(255,255,255,0.1)", borderRadius: "9999px", padding: "4px" }}>
              <button onClick={() => setLang("id")} style={{
                padding: "6px 12px", borderRadius: "9999px", border: "none", cursor: "pointer",
                background: lang === "id" ? "#FF6B00" : "transparent",
                color: lang === "id" ? "#000" : "rgba(255,255,255,0.7)",
                fontWeight: 600, fontSize: "0.875rem"
              }}>ID</button>
              <button onClick={() => setLang("en")} style={{
                padding: "6px 12px", borderRadius: "9999px", border: "none", cursor: "pointer",
                background: lang === "en" ? "#FF6B00" : "transparent",
                color: lang === "en" ? "#000" : "rgba(255,255,255,0.7)",
                fontWeight: 600, fontSize: "0.875rem"
              }}>EN</button>
            </div>

            {loggedIn ? (
              <button onClick={logout} style={{
                background: "#FF6B00", color: "#000", padding: "8px 16px",
                borderRadius: "9999px", border: "none", fontWeight: 600, cursor: "pointer"
              }}>{t.logout}</button>
            ) : (
              <button onClick={() => setShowLogin(true)} style={{
                background: "#FF6B00", color: "#000", padding: "8px 20px",
                borderRadius: "9999px", border: "none", fontWeight: 600, cursor: "pointer"
              }}>{t.login}</button>
            )}
          </div>
        </div>
      </header>

      {showLogin && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100
        }} onClick={() => setShowLogin(false)}>
          <div style={{
            background: "#1A1A1A", padding: "1.5rem", borderRadius: "1rem",
            width: "100%", maxWidth: "380px", margin: "1rem", border: "1px solid rgba(255,255,255,0.1)"
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{t.title}</h3>
            <p style={{ fontSize: "0.875rem", opacity: 0.6, marginBottom: "1rem" }}>{t.desc}</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@contoh.com"
              style={{
                width: "100%", padding: "0.75rem 1rem", borderRadius: "0.75rem",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.2)",
                color: "#F5F0E8", marginBottom: "0.75rem", boxSizing: "border-box"
              }}
            />
            <button onClick={handleLogin} style={{
              width: "100%", background: "#FF6B00", color: "#000", padding: "0.75rem",
              borderRadius: "0.75rem", border: "none", fontWeight: 600, cursor: "pointer", marginBottom: "0.5rem"
            }}>{t.send}</button>
            <button onClick={() => setShowLogin(false)} style={{
              width: "100%", background: "transparent", color: "rgba(255,255,255,0.6)",
              padding: "0.5rem", border: "none", cursor: "pointer"
            }}>{t.cancel}</button>
          </div>
        </div>
      )}
    </>
  );
}
