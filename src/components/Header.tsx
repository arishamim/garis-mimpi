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
      <header className="bg-[#2E51A2] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight hover:opacity-90 transition">
            Garis Mimpi
          </Link>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center bg-white/10 rounded-full p-1 text-sm font-medium">
              <button
                onClick={() => setLang("id")}
                className={`px-3 py-1 rounded-full transition ${lang === "id" ? "bg-white text-[#2E51A2]" : "text-white/80 hover:text-white"}`}
              >
                ID
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-3 py-1 rounded-full transition ${lang === "en" ? "bg-white text-[#2E51A2]" : "text-white/80 hover:text-white"}`}
              >
                EN
              </button>
            </div>

            {loggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-sm hidden sm:inline">{userEmail?.split("@")[0]}</span>
                <button
                  onClick={logout}
                  className="bg-[#6D001F] hover:bg-[#8a0028] px-4 py-2 rounded-full text-sm font-semibold transition"
                >
                  {t.logout}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="bg-[#6D001F] hover:bg-[#8a0028] px-5 py-2 rounded-full text-sm font-semibold transition"
              >
                {t.login}
              </button>
            )}
          </div>
        </div>
      </header>

      {showLogin && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowLogin(false)}>
          <div className="bg-white text-[#450213] p-6 rounded-2xl w-full max-w-sm mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-1">{t.title}</h3>
            <p className="text-sm opacity-70 mb-4">{t.desc}</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@contoh.com"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-[#2E51A2]"
            />
            <button onClick={handleLogin} className="w-full bg-[#6D001F] hover:bg-[#8a0028] text-white py-3 rounded-xl font-semibold mb-2 transition">
              {t.send}
            </button>
            <button onClick={() => setShowLogin(false)} className="w-full text-sm opacity-70 py-2">
              {t.cancel}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
