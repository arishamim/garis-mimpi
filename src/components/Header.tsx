"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { useState } from "react";

export default function Header() {
  const { lang, setLang, loggedIn, userEmail, login, logout, authLoading } = useApp();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const t = {
    id: { login: "Masuk", logout: "Keluar", upload: "Tambah Karya" },
    en: { login: "Login", logout: "Logout", upload: "Add Work" },
  }[lang];

  const handleLogin = async () => {
    if (!email.trim().includes("@")) {
      setNotice(lang === "id" ? "Email tidak valid." : "Invalid email.");
      return;
    }

    setBusy(true);
    setNotice("");
    try {
      await login(email);
      setNotice(
        lang === "id"
          ? "Tautan masuk dikirim. Periksa kotak masuk email kamu."
          : "Sign-in link sent. Check your email inbox."
      );
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Gagal mengirim tautan masuk.");
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal keluar.");
    }
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
          justifyContent: "space-between",
          gap: "1rem"
        }}>
          <Link href="/" style={{ fontSize: "1.5rem", fontWeight: 800, color: "#FF6B00", textDecoration: "none" }}>
            GARISMIMPI
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", background: "rgba(255,255,255,0.1)", borderRadius: "9999px", padding: "4px" }}>
              {(["id", "en"] as const).map((language) => (
                <button key={language} onClick={() => setLang(language)} style={{
                  padding: "6px 12px", borderRadius: "9999px", border: "none", cursor: "pointer",
                  background: lang === language ? "#FF6B00" : "transparent",
                  color: lang === language ? "#000" : "rgba(255,255,255,0.7)",
                  fontWeight: 600, fontSize: "0.875rem"
                }}>{language.toUpperCase()}</button>
              ))}
            </div>

            {loggedIn && (
              <>
                <Link href="/profile" style={navStyle}>Profil</Link>
                <Link href="/upload" style={{ ...navStyle, color: "#FF6B00", borderColor: "#FF6B00" }}>{t.upload}</Link>
                <span style={{ fontSize: "0.8rem", opacity: 0.65, maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis" }}>{userEmail}</span>
                <button onClick={handleLogout} style={primaryStyle}>{t.logout}</button>
              </>
            )}

            {!loggedIn && (
              <button onClick={() => { setShowLogin(true); setNotice(""); }} disabled={authLoading} style={primaryStyle}>
                {authLoading ? "Memuat..." : t.login}
              </button>
            )}
          </div>
        </div>
      </header>

      {showLogin && (
        <div style={overlayStyle} onClick={() => setShowLogin(false)}>
          <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Masuk / Daftar</h3>
            <p style={{ opacity: 0.7, fontSize: "0.9rem", marginBottom: "1rem" }}>
              Masukkan email aktif. Kami akan mengirim tautan masuk dari Supabase.
            </p>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && void handleLogin()}
              placeholder="email@contoh.com"
              autoComplete="email"
              style={inputStyle}
            />
            <button onClick={() => void handleLogin()} disabled={busy} style={{ ...primaryStyle, width: "100%", marginTop: "0.75rem", opacity: busy ? 0.65 : 1 }}>
              {busy ? "Mengirim..." : "Kirim Magic Link"}
            </button>
            {notice && <p role="status" style={{ marginTop: "0.75rem", color: notice.includes("Gagal") || notice.includes("tidak valid") ? "#ff8c8c" : "#FF6B00", lineHeight: 1.5 }}>{notice}</p>}
            <button onClick={() => setShowLogin(false)} style={{ ...navStyle, width: "100%", marginTop: "0.75rem" }}>Tutup</button>
          </div>
        </div>
      )}
    </>
  );
}

const navStyle: React.CSSProperties = {
  background: "transparent", color: "#F5F0E8", padding: "8px 14px",
  borderRadius: "9999px", border: "1px solid rgba(255,255,255,0.2)",
  fontWeight: 600, textDecoration: "none", fontSize: "0.875rem", cursor: "pointer"
};

const primaryStyle: React.CSSProperties = {
  background: "#FF6B00", color: "#000", padding: "8px 16px",
  borderRadius: "9999px", border: "none", fontWeight: 700, cursor: "pointer"
};

const overlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100
};

const modalStyle: React.CSSProperties = {
  background: "#1A1A1A", padding: "1.5rem", borderRadius: "1rem",
  width: "100%", maxWidth: "380px", margin: "1rem",
  border: "1px solid rgba(255,255,255,0.1)", color: "#F5F0E8"
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.75rem 1rem", borderRadius: "0.75rem",
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.2)",
  color: "#F5F0E8", marginBottom: "0.25rem", boxSizing: "border-box"
};
