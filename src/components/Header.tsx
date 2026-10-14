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
      <header className="bg-[#0D0D0D] border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-extrabold text-[#FF6B00] tracking-tight">
            GARISMIMPI
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white/10 rounded-full p-1 text-sm">
              <button onClick={() => setLang("id")} className={`px-3 py-1 rounded-full ${lang === "id" ? "bg-[#FF6B00] text-black" : "text-white/70"}`}>ID</button>
              <button onClick={() => setLang("en")} className={`px-3 py-1 rounded-full ${lang === "en" ? "bg-[#FF6B00] text-black" : "text-white/70"}`}>EN</button>
            </div>

            {loggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-sm hidden sm:inline">{userEmail?.split("@")[0]}</span>
                <button onClick={logout} className="bg-[#FF6B00] text-black px-4 py-2 rounded-full text-sm font-semibold">
                  {t.logout}
                </button>
              </div>
            ) : (
              <button onClick={() => setShowLogin(true)} className="bg-[#FF6B00] text-black px-5 py-2 rounded-full text-sm font-semibold">
                {t.login}
              </button>
            )}
          </div>
        </div>
      </header>

      {showLogin && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowLogin(false)}>
          <div className="bg-[#1A1A1A] text-[#F5F0E8] p-6 rounded-2xl w-full max-w-sm mx-4 border border-white/10" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-1">{t.title}</h3>
            <p className="text-sm text-white/60 mb-4">{t.desc}</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@contoh.com"
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            />
            <button onClick={handleLogin} className="w-full bg-[#FF6B00] text-black py-3 rounded-xl font-semibold mb-2">
              {t.send}
            </button>
            <button onClick={() => setShowLogin(false)} className="w-full text-sm text-white/60 py-2">
              {t.cancel}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
