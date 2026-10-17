"use client";

import { useState, useEffect, type CSSProperties } from "react";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type ProfileForm = {
  username: string;
  fullName: string;
  ewallet: string;
  phone: string;
  bio: string;
};

const emptyProfile: ProfileForm = {
  username: "",
  fullName: "",
  ewallet: "",
  phone: "",
  bio: "",
};

export default function ProfilePage() {
  const { loggedIn, userEmail, user, authLoading } = useApp();
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!user) {
        if (active) setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("gm_profiles")
        .select("username, full_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!active) return;

      if (error) {
        setMessage("Gagal memuat profil database: " + error.message);
      } else if (data) {
        setProfile((current) => ({
          ...current,
          username: data.username ?? "",
          fullName: data.full_name ?? "",
        }));
      }

      try {
        const local = localStorage.getItem("garis-profile");
        if (local) {
          const parsed = JSON.parse(local);
          setProfile((current) => ({
            ...current,
            ewallet: parsed.ewallet ?? current.ewallet,
            phone: parsed.phone ?? current.phone,
            bio: parsed.bio ?? current.bio,
          }));
        }
      } catch {
        // Abaikan data profil lokal yang rusak.
      }

      setLoading(false);
    }

    void loadProfile();
    return () => { active = false; };
  }, [user]);

  const handleSave = async () => {
    if (!user) {
      setMessage("Sesi login belum tersedia. Masuk kembali menggunakan magic link.");
      return;
    }

    const username = profile.username.trim();
    const fullName = profile.fullName.trim();

    if (!/^[a-zA-Z0-9_-]{3,30}$/.test(username)) {
      setMessage("Username harus 3–30 karakter dan hanya boleh berisi huruf, angka, _ atau -.");
      return;
    }

    setSaving(true);
    setMessage("");
    setSaved(false);

    const { error } = await supabase.from("gm_profiles").upsert({
      user_id: user.id,
      username,
      full_name: fullName,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    if (error) {
      setMessage("Gagal menyimpan profil: " + error.message);
      setSaving(false);
      return;
    }

    // Informasi tambahan tetap lokal sampai skema profil diperluas.
    localStorage.setItem("garis-profile", JSON.stringify({
      ...profile,
      username,
      fullName,
    }));

    setProfile((current) => ({ ...current, username, fullName }));
    setSaved(true);
    setMessage("Profil berhasil disimpan ke database.");
    setSaving(false);
  };

  if (authLoading || loading) {
    return <div style={{ maxWidth: "500px", margin: "0 auto", padding: "3rem 0" }}>Memuat profil...</div>;
  }

  if (!loggedIn || !user) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <h2>Login dulu</h2>
        <p style={{ opacity: 0.7, margin: "1rem 0" }}>Masuk menggunakan magic link email sebelum mengatur profil.</p>
        <Link href="/" style={{ color: "#FF6B00" }}>Kembali ke beranda</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1.5rem" }}>Profil Saya</h1>
      <p style={{ opacity: 0.7, marginBottom: "1.5rem" }}>Email: {userEmail}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <label>
          Username
          <input placeholder="contoh: aris_design" value={profile.username}
            onChange={(event) => setProfile({ ...profile, username: event.target.value })}
            style={inputStyle} />
        </label>
        <label>
          Nama Lengkap
          <input placeholder="Nama lengkap" value={profile.fullName}
            onChange={(event) => setProfile({ ...profile, fullName: event.target.value })}
            style={inputStyle} />
        </label>
        <label>
          Nomor E-Wallet (GoPay/OVO/DANA)
          <input placeholder="Nomor e-wallet" value={profile.ewallet}
            onChange={(event) => setProfile({ ...profile, ewallet: event.target.value })}
            style={inputStyle} />
        </label>
        <label>
          Nomor HP
          <input placeholder="Nomor HP" value={profile.phone}
            onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
            style={inputStyle} />
        </label>
        <label>
          Bio singkat (opsional)
          <textarea placeholder="Ceritakan singkat tentang kamu" value={profile.bio}
            onChange={(event) => setProfile({ ...profile, bio: event.target.value })}
            rows={3} style={{ ...inputStyle, resize: "vertical" }} />
        </label>
      </div>

      <button onClick={() => void handleSave()} disabled={saving} style={{ ...btnStyle, opacity: saving ? 0.65 : 1 }}>
        {saving ? "Menyimpan..." : "Simpan Profil"}
      </button>

      {message && <p role="status" style={{ color: message.startsWith("Gagal") ? "#ff8c8c" : "#FF6B00", marginTop: "1rem", lineHeight: 1.5 }}>{message}</p>}
      {saved && <p style={{ color: "#FF6B00", marginTop: "0.5rem" }}>Username sekarang terhubung ke akun Supabase.</p>}

      <Link href="/" style={{ display: "inline-block", marginTop: "2rem", color: "#FF6B00" }}>← Kembali</Link>
    </div>
  );
}

const inputStyle: CSSProperties = {
  display: "block", width: "100%", padding: "0.75rem 1rem",
  borderRadius: "0.5rem", background: "#1A1A1A", color: "#F5F0E8",
  border: "1px solid rgba(255,255,255,0.2)", boxSizing: "border-box",
  marginTop: "0.4rem"
};

const btnStyle: CSSProperties = {
  marginTop: "1.5rem", background: "#FF6B00", color: "#000",
  padding: "0.75rem 2rem", borderRadius: "9999px", border: "none",
  fontWeight: 700, cursor: "pointer"
};
