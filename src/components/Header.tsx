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
      <header className="bg-[#2E51A2] text-white px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          Garis Mimpi
        </Link>
        <div className="flex items-center gap-5">
          <div className="text-sm font-medium">
            <button onClick={() => setLang("id")} className={lang === "id" ? "underline" : "opacity-70"}>
              ID
            </button>
            <span className="mx-1">|</span>
            <button onClick={() => setLang("en")} className={lang === "en" ? "underline" : "opacity-70"}>
              EN
            </button>
          </div>
          {loggedIn ? (
            <div className="flex items-center gap-3">
              <span className="text-sm">{userEmail?.split("@")[0]}</span>
              <button onClick={logout} className="bg-[#6D001F] hover:bg-[#8a0028] px-3 py-1.5 rounded text-sm">
                {t.logout}
              </button>
            </div>
          ) : (
            <button onClick={() => setShowLogin(true)} className="bg-[#6D001F] hover:bg-[#8a0028] px-4 py-2 rounded-lg text-sm font-semibold">
              {t.login}
            </button>
          )}
        </div>
      </header>

      {showLogin && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowLogin(false)}>
          <div className="bg-white text-[#450213] p-6 rounded-2xl w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-1">{t.title}</h3>
            <p className="text-sm opacity-70 mb-4">{t.desc}</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@contoh.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-[#2E51A2]"
            />
            <button onClick={handleLogin} className="w-full bg-[#6D001F] text-white py-2.5 rounded-lg font-semibold mb-2">
              {t.send}
            </button>
            <button onClick={() => setShowLogin(false)} className="w-full text-sm opacity-70">
              {t.cancel}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
