"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import Link from "next/link";

export default function ProfilePage() {
  const { loggedIn, userEmail } = useApp();
  const [profile, setProfile] = useState({
    username: "",
    fullName: "",
    ewallet: "",
    phone: "",
    bio: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem("garis-profile");
    if (savedProfile) setProfile(JSON.parse(savedProfile));
  }, []);

  if (!loggedIn) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <h2>Login dulu</h2>
        <Link href="/" style={{ color: "#FF6B00" }}>Kembali</Link>
      </div>
    );
  }

  const handleSave = () => {
    localStorage.setItem("garis-profile", JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1.5rem" }}>Profil Saya</h1>
      <p style={{ opacity: 0.7, marginBottom: "1.5rem" }}>Email: {userEmail}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input
          placeholder="Username"
          value={profile.username}
          onChange={(e) => setProfile({ ...profile, username: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="Nama Lengkap"
          value={profile.fullName}
          onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="Nomor E-Wallet (GoPay/OVO/DANA)"
          value={profile.ewallet}
          onChange={(e) => setProfile({ ...profile, ewallet: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="Nomor HP"
          value={profile.phone}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          style={inputStyle}
        />
        <textarea
          placeholder="Bio singkat (opsional)"
          value={profile.bio}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      <button onClick={handleSave} style={btnStyle}>
        Simpan Profil
      </button>

      {saved && <p style={{ color: "#FF6B00", marginTop: "1rem" }}>Profil tersimpan!</p>}

      <Link href="/" style={{ display: "inline-block", marginTop: "2rem", color: "#FF6B00" }}>← Kembali</Link>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  borderRadius: "0.5rem",
  background: "#1A1A1A",
  color: "#F5F0E8",
  border: "1px solid rgba(255,255,255,0.2)",
  boxSizing: "border-box",
};

const btnStyle: React.CSSProperties = {
  marginTop: "1.5rem",
  background: "#FF6B00",
  color: "#000",
  padding: "0.75rem 2rem",
  borderRadius: "9999px",
  border: "none",
  fontWeight: 700,
  cursor: "pointer",
};
