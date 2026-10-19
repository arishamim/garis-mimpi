"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";

type Mission = { id: string; title: string; description: string; period: "daily" | "weekly"; stars: number };
type Completion = { id: string; mission_id: string; period_key: string; status: "submitted" | "approved" | "rejected" };

function periodKey(period: "daily" | "weekly") {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  if (period === "daily") return `${y}-${m}-${d}`;
  const utc = new Date(Date.UTC(y, now.getMonth(), now.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utc.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export default function MissionsPage() {
  const { user, loggedIn, authLoading } = useApp();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [stars, setStars] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [missionResult, completionResult, starResult] = await Promise.all([
      supabase.from("gm_missions").select("id, title, description, period, stars").eq("active", true).order("created_at", { ascending: false }),
      supabase.from("gm_mission_completions").select("id, mission_id, period_key, status").eq("designer_id", user.id),
      supabase.from("gm_star_ledger").select("points").eq("designer_id", user.id),
    ]);
    const queryError = missionResult.error || completionResult.error || starResult.error;
    if (queryError) setError("Data misi belum tersedia. Pastikan skrip SQL Admin Master sudah dijalankan. " + queryError.message);
    setMissions((missionResult.data ?? []) as Mission[]);
    setCompletions((completionResult.data ?? []) as Completion[]);
    setStars((starResult.data ?? []).reduce((sum, item) => sum + Number(item.points || 0), 0));
    setLoading(false);
  }, [user]);

  useEffect(() => { if (user) void load(); else if (!authLoading) setLoading(false); }, [user, authLoading, load]);

  const submitMission = async (mission: Mission) => {
    if (!user) return;
    setBusyId(mission.id); setError(""); setMessage("");
    const key = periodKey(mission.period);
    const { error: insertError } = await supabase.from("gm_mission_completions").insert({
      mission_id: mission.id, designer_id: user.id, period_key: key, status: "submitted",
    });
    if (insertError) {
      setError(insertError.code === "23505" ? "Misi ini sudah dikirim untuk periode ini." : "Pengajuan misi gagal: " + insertError.message);
    } else {
      setMessage("Pengajuan berhasil dikirim. Bintang akan otomatis masuk setelah admin memverifikasi penyelesaian misi.");
    }
    setBusyId("");
    await load();
  };

  if (authLoading || loading) return <main style={pageStyle}><p>Memuat misi…</p></main>;
  if (!loggedIn || !user) return <main style={pageStyle}><section style={card}><h1 style={title}>Misi Desainer</h1><p>Login terlebih dahulu untuk mengikuti misi dan mengumpulkan bintang.</p><Link href="/" style={link}>Kembali ke beranda</Link></section></main>;

  return <main style={pageStyle}>
    <div style={top}><div><div style={eyebrow}>GARIS MIMPI / REWARD CENTER</div><h1 style={title}>Misi Desainer</h1><p style={muted}>Selesaikan tantangan harian dan mingguan untuk mengumpulkan bintang.</p></div><section style={starCard}><span style={muted}>Bintang terkumpul</span><strong style={{ fontSize: "2rem", color: "#FFB347" }}>⭐ {stars}</strong></section></div>
    {error && <p role="alert" style={errorBox}>{error}</p>}
    {message && <p role="status" style={successBox}>{message}</p>}
    {missions.length === 0 ? <section style={card}><h2 style={heading}>Belum ada misi aktif</h2><p style={muted}>Cek kembali nanti, admin akan menambahkan misi baru.</p></section> : <div style={grid}>{missions.map((mission) => {
      const key = periodKey(mission.period);
      const completion = completions.find((item) => item.mission_id === mission.id && item.period_key === key);
      const label = completion?.status === "approved" ? "Selesai · bintang diberikan" : completion?.status === "submitted" ? "Menunggu verifikasi" : completion?.status === "rejected" ? "Ditolak · bisa ajukan ulang setelah diperbaiki" : "Ikuti misi";
      return <section key={mission.id} style={card}><div style={row}><span style={tag}>{mission.period === "daily" ? "MISI HARIAN" : "MISI MINGGUAN"}</span><strong style={{ color: "#FFB347" }}>⭐ {mission.stars}</strong></div><h2 style={heading}>{mission.title}</h2><p style={muted}>{mission.description || "Ikuti instruksi misi ini untuk mendapatkan bintang."}</p><p style={periodText}>Periode: {key}</p>{completion?.status === "rejected" ? <button style={button} disabled={busyId === mission.id} onClick={() => void submitMission(mission)}>{busyId === mission.id ? "Mengirim…" : "Ajukan ulang"}</button> : <button style={completion ? disabledButton : button} disabled={!!completion || busyId === mission.id} onClick={() => void submitMission(mission)}>{busyId === mission.id ? "Mengirim…" : completion ? label : label}</button>}</section>;
    })}</div>}
    <p style={footnote}>Untuk menjaga keadilan, pengajuan diperiksa admin. Setelah disetujui, bintang masuk otomatis dan satu misi hanya bisa mendapat hadiah sekali dalam satu periode.</p>
  </main>;
}

const pageStyle: React.CSSProperties = { maxWidth: 1100, margin: "0 auto", padding: "32px 20px 64px", color: "#F5F0E8" };
const card: React.CSSProperties = { background: "#171717", border: "1px solid #303030", borderRadius: 16, padding: 22 };
const title: React.CSSProperties = { fontSize: "clamp(2rem, 4vw, 2.7rem)", fontWeight: 850, letterSpacing: "-.04em", margin: "8px 0" };
const heading: React.CSSProperties = { fontSize: "1.2rem", fontWeight: 800, margin: "16px 0 8px" };
const eyebrow: React.CSSProperties = { fontSize: ".72rem", letterSpacing: ".14em", color: "#FF8A3D", fontWeight: 800 };
const muted: React.CSSProperties = { color: "#A9A9A9", lineHeight: 1.6, fontSize: ".9rem" };
const top: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 24 };
const starCard: React.CSSProperties = { background: "#171717", border: "1px solid #303030", borderRadius: 16, padding: "16px 22px", display: "flex", flexDirection: "column", gap: 6 };
const grid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 16 };
const row: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 };
const tag: React.CSSProperties = { color: "#FFB347", background: "#342416", borderRadius: 999, padding: "5px 9px", fontSize: ".7rem", fontWeight: 800, letterSpacing: ".08em" };
const periodText: React.CSSProperties = { color: "#777", fontSize: ".8rem" };
const button: React.CSSProperties = { background: "#FF6B00", color: "#111", border: 0, borderRadius: 999, padding: "10px 16px", fontWeight: 800, cursor: "pointer" };
const disabledButton: React.CSSProperties = { ...button, background: "#303030", color: "#A0A0A0", cursor: "not-allowed" };
const link: React.CSSProperties = { color: "#FF8A3D" };
const errorBox: React.CSSProperties = { background: "#351919", border: "1px solid #7F3030", padding: 12, borderRadius: 10, color: "#FFB4B4" };
const successBox: React.CSSProperties = { background: "#15311E", border: "1px solid #2D7042", padding: 12, borderRadius: 10, color: "#B8F5C9" };
const footnote: React.CSSProperties = { color: "#929292", fontSize: ".82rem", lineHeight: 1.6, marginTop: 22 };
