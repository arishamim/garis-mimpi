"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";

type Profile = { user_id: string; username: string; full_name: string | null };
type Mission = { id: string; title: string; description: string; period: "daily" | "weekly"; stars: number; active: boolean; created_at: string };
type Completion = { id: string; mission_id: string; designer_id: string; period_key: string; status: "submitted" | "approved" | "rejected"; submitted_at: string };
type Ledger = { id: string; designer_id: string; points: number; reason: string; source: "admin" | "mission"; created_at: string };

const moneyDate = (value: string) => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
const panel: React.CSSProperties = { background: "#171717", border: "1px solid #303030", borderRadius: 16, padding: 20 };
const field: React.CSSProperties = { width: "100%", padding: "11px 12px", background: "#101010", border: "1px solid #3b3b3b", color: "#f5f0e8", borderRadius: 9, boxSizing: "border-box" };
const primary: React.CSSProperties = { background: "#FF6B00", color: "#111", border: 0, borderRadius: 999, padding: "10px 16px", fontWeight: 800, cursor: "pointer" };
const mutedButton: React.CSSProperties = { background: "#242424", color: "#f5f0e8", border: "1px solid #444", borderRadius: 999, padding: "8px 12px", fontWeight: 650, cursor: "pointer" };

export default function AdminMasterPage() {
  const { user, loggedIn, authLoading } = useApp();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [ledger, setLedger] = useState<Ledger[]>([]);
  const [selectedDesigner, setSelectedDesigner] = useState("");
  const [points, setPoints] = useState("1");
  const [reason, setReason] = useState("");
  const [missionTitle, setMissionTitle] = useState("");
  const [missionDescription, setMissionDescription] = useState("");
  const [missionPeriod, setMissionPeriod] = useState<"daily" | "weekly">("daily");
  const [missionStars, setMissionStars] = useState("1");

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    const [profileResult, missionResult, completionResult, ledgerResult] = await Promise.all([
      supabase.from("gm_profiles").select("user_id, username, full_name").order("username"),
      supabase.from("gm_missions").select("id, title, description, period, stars, active, created_at").order("created_at", { ascending: false }),
      supabase.from("gm_mission_completions").select("id, mission_id, designer_id, period_key, status, submitted_at").order("submitted_at", { ascending: false }),
      supabase.from("gm_star_ledger").select("id, designer_id, points, reason, source, created_at").order("created_at", { ascending: false }),
    ]);
    const firstError = profileResult.error || missionResult.error || completionResult.error || ledgerResult.error;
    if (firstError) setError("Sebagian data belum bisa dimuat. Pastikan skrip SQL Admin Master sudah dijalankan di Supabase. Detail: " + firstError.message);
    setProfiles((profileResult.data ?? []) as Profile[]);
    setMissions((missionResult.data ?? []) as Mission[]);
    setCompletions((completionResult.data ?? []) as Completion[]);
    setLedger((ledgerResult.data ?? []) as Ledger[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    let active = true;
    async function checkAdmin() {
      if (authLoading) return;
      if (!user) {
        if (active) setChecking(false);
        return;
      }
      const { data, error: checkError } = await supabase.from("gm_admins").select("user_id").eq("user_id", user.id).maybeSingle();
      if (!active) return;
      if (checkError) setError("Tabel admin belum siap. Jalankan skrip SQL Admin Master di Supabase terlebih dahulu.");
      setIsAdmin(!!data);
      setChecking(false);
    }
    void checkAdmin();
    return () => { active = false; };
  }, [user, authLoading]);

  useEffect(() => {
    if (isAdmin) void loadData();
  }, [isAdmin, loadData]);

  const profileNames = useMemo(() => new Map(profiles.map((profile) => [profile.user_id, profile.username || profile.full_name || profile.user_id.slice(0, 8)])), [profiles]);
  const starTotals = useMemo(() => {
    const totals = new Map<string, number>();
    for (const item of ledger) totals.set(item.designer_id, (totals.get(item.designer_id) ?? 0) + item.points);
    return totals;
  }, [ledger]);
  const pendingCompletions = completions.filter((item) => item.status === "submitted");

  const awardStars = async () => {
    if (!user || !selectedDesigner || !reason.trim()) { setError("Pilih desainer dan isi alasan pemberian bintang."); return; }
    const count = Number(points);
    if (!Number.isInteger(count) || count < 1 || count > 1000) { setError("Jumlah bintang harus bilangan bulat antara 1 sampai 1.000."); return; }
    setError(""); setNotice("");
    const { error: insertError } = await supabase.from("gm_star_ledger").insert({
      designer_id: selectedDesigner, points: count, reason: reason.trim(),
      source: "admin", source_ref: crypto.randomUUID(), awarded_by: user.id,
    });
    if (insertError) { setError("Bintang belum berhasil diberikan: " + insertError.message); return; }
    setNotice("Bintang berhasil ditambahkan ke riwayat desainer.");
    setReason("");
    await loadData();
  };

  const createMission = async () => {
    if (!user || !missionTitle.trim()) { setError("Isi judul misi terlebih dahulu."); return; }
    const count = Number(missionStars);
    if (!Number.isInteger(count) || count < 1 || count > 1000) { setError("Hadiah bintang harus bilangan bulat antara 1 sampai 1.000."); return; }
    setError(""); setNotice("");
    const { error: insertError } = await supabase.from("gm_missions").insert({
      title: missionTitle.trim(), description: missionDescription.trim(), period: missionPeriod,
      stars: count, created_by: user.id, active: true,
    });
    if (insertError) { setError("Misi belum berhasil dibuat: " + insertError.message); return; }
    setMissionTitle(""); setMissionDescription(""); setNotice("Misi berhasil dibuat.");
    await loadData();
  };

  const reviewCompletion = async (completion: Completion, approved: boolean) => {
    if (!user) return;
    setError(""); setNotice("");
    const { error: updateError } = await supabase.from("gm_mission_completions").update({
      status: approved ? "approved" : "rejected", reviewed_at: new Date().toISOString(), reviewed_by: user.id,
    }).eq("id", completion.id).eq("status", "submitted");
    if (updateError) { setError("Status misi belum berhasil diperbarui: " + updateError.message); return; }
    setNotice(approved ? "Misi disetujui. Bintang otomatis ditambahkan oleh database." : "Pengajuan misi ditolak.");
    await loadData();
  };

  const toggleMission = async (mission: Mission) => {
    const { error: updateError } = await supabase.from("gm_missions").update({ active: !mission.active }).eq("id", mission.id);
    if (updateError) { setError("Status misi tidak dapat diubah: " + updateError.message); return; }
    await loadData();
  };

  if (authLoading || checking) return <main style={pageStyle}><p>Memeriksa akses Admin Master…</p></main>;
  if (!loggedIn || !user) return <main style={pageStyle}><section style={panel}><h1 style={h1}>Admin Master</h1><p>Silakan login menggunakan akun admin.</p><Link href="/" style={linkStyle}>Kembali ke beranda</Link></section></main>;
  if (!isAdmin) return <main style={pageStyle}><section style={panel}><div style={eyebrow}>GARIS MIMPI / AKSES TERBATAS</div><h1 style={h1}>Admin Master</h1><p>Akun ini belum terdaftar sebagai administrator. Demi keamanan, halaman ini tidak dapat digunakan oleh akun biasa.</p>{error && <p role="alert" style={errorStyle}>{error}</p>}<Link href="/" style={linkStyle}>← Kembali ke beranda</Link></section></main>;

  return <main style={pageStyle}>
    <div style={topbar}><div><div style={eyebrow}>GARIS MIMPI / CONTROL ROOM</div><h1 style={h1}>Admin Master</h1><p style={subtle}>Kelola desainer, bintang, dan misi harian atau mingguan.</p></div><button style={mutedButton} onClick={() => void loadData()} disabled={loading}>{loading ? "Memuat…" : "Muat ulang"}</button></div>
    {error && <div role="alert" style={errorStyle}>{error}</div>}
    {notice && <div role="status" style={successStyle}>{notice}</div>}
    <div style={statsGrid}>
      <section style={panel}><span style={label}>Desainer terdaftar</span><strong style={stat}>{profiles.length}</strong></section>
      <section style={panel}><span style={label}>Misi aktif</span><strong style={stat}>{missions.filter((m) => m.active).length}</strong></section>
      <section style={panel}><span style={label}>Menunggu pemeriksaan</span><strong style={stat}>{pendingCompletions.length}</strong></section>
      <section style={panel}><span style={label}>Riwayat bintang</span><strong style={stat}>{ledger.length}</strong></section>
    </div>

    <div style={twoCols}>
      <section style={panel}>
        <div style={eyebrow}>PENGHARGAAN MANUAL</div><h2 style={h2}>Berikan bintang ⭐</h2><p style={subtle}>Pemberian dicatat di database beserta alasan dan akun admin.</p>
        <label style={label}>Desainer<select value={selectedDesigner} onChange={(e) => setSelectedDesigner(e.target.value)} style={field}><option value="">Pilih desainer</option>{profiles.map((p) => <option key={p.user_id} value={p.user_id}>{p.username} {p.full_name ? "— " + p.full_name : ""}</option>)}</select></label>
        <label style={label}>Jumlah bintang<input type="number" min="1" max="1000" step="1" value={points} onChange={(e) => setPoints(e.target.value)} style={field}/></label>
        <label style={label}>Alasan<textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Contoh: kualitas karya dan respons cepat" style={field}/></label>
        <button style={primary} onClick={() => void awardStars()}>Berikan bintang</button>
      </section>

      <section style={panel}>
        <div style={eyebrow}>TANTANGAN DESAINER</div><h2 style={h2}>Buat misi</h2><p style={subtle}>Hadiah otomatis diberikan database setelah admin menyetujui penyelesaian misi.</p>
        <label style={label}>Nama misi<input value={missionTitle} onChange={(e) => setMissionTitle(e.target.value)} placeholder="Contoh: Unggah satu karya orisinal" style={field}/></label>
        <label style={label}>Instruksi<textarea value={missionDescription} onChange={(e) => setMissionDescription(e.target.value)} rows={3} placeholder="Jelaskan syarat yang harus dipenuhi desainer" style={field}/></label>
        <div style={formRow}><label style={{ ...label, flex: 1 }}>Periode<select value={missionPeriod} onChange={(e) => setMissionPeriod(e.target.value as "daily" | "weekly")} style={field}><option value="daily">Harian</option><option value="weekly">Mingguan</option></select></label><label style={{ ...label, flex: 1 }}>Hadiah ⭐<input type="number" min="1" max="1000" step="1" value={missionStars} onChange={(e) => setMissionStars(e.target.value)} style={field}/></label></div>
        <button style={primary} onClick={() => void createMission()}>Simpan misi</button>
      </section>
    </div>

    <section style={panel}><div style={eyebrow}>MISI AKTIF DAN ARSIP</div><h2 style={h2}>Daftar misi</h2>
      {missions.length === 0 ? <p style={subtle}>Belum ada misi.</p> : <div style={list}>{missions.map((m) => <article key={m.id} style={listItem}><div style={{ flex: 1 }}><strong>{m.title}</strong><p style={subtle}>{m.description || "Tidak ada instruksi tambahan"} · {m.period === "daily" ? "Harian" : "Mingguan"} · ⭐ {m.stars}</p></div><span style={pill(m.active)}>{m.active ? "Aktif" : "Nonaktif"}</span><button style={mutedButton} onClick={() => void toggleMission(m)}>{m.active ? "Nonaktifkan" : "Aktifkan"}</button></article>)}</div>}
    </section>

    <section style={panel}><div style={eyebrow}>VERIFIKASI PENYELESAIAN</div><h2 style={h2}>Pengajuan misi</h2>
      {pendingCompletions.length === 0 ? <p style={subtle}>Tidak ada pengajuan yang menunggu pemeriksaan.</p> : <div style={list}>{pendingCompletions.map((c) => <article key={c.id} style={listItem}><div style={{ flex: 1 }}><strong>{missions.find((m) => m.id === c.mission_id)?.title ?? "Misi"}</strong><p style={subtle}>Desainer: {profileNames.get(c.designer_id) ?? c.designer_id.slice(0, 8)} · Periode: {c.period_key} · Diajukan {moneyDate(c.submitted_at)}</p></div><button style={primary} onClick={() => void reviewCompletion(c, true)}>Setujui ⭐</button><button style={mutedButton} onClick={() => void reviewCompletion(c, false)}>Tolak</button></article>)}</div>}
    </section>

    <section style={panel}><div style={eyebrow}>RINGKASAN DESAINER</div><h2 style={h2}>Saldo bintang</h2>
      {profiles.length === 0 ? <p style={subtle}>Belum ada profil desainer.</p> : <div style={list}>{profiles.map((p) => <article key={p.user_id} style={listItem}><div style={{ flex: 1 }}><strong>{p.username}</strong><p style={subtle}>{p.full_name || "Nama belum diisi"}</p></div><strong style={{ color: "#FFB347", fontSize: "1.1rem" }}>⭐ {starTotals.get(p.user_id) ?? 0}</strong></article>)}</div>}
    </section>

    <section style={panel}><div style={eyebrow}>AUDIT TRAIL</div><h2 style={h2}>Riwayat bintang terbaru</h2>
      {ledger.length === 0 ? <p style={subtle}>Belum ada bintang yang diberikan.</p> : <div style={list}>{ledger.map((item) => <article key={item.id} style={listItem}><div style={{ flex: 1 }}><strong>{profileNames.get(item.designer_id) ?? item.designer_id.slice(0, 8)} · ⭐ {item.points}</strong><p style={subtle}>{item.reason} · {item.source === "mission" ? "Misi" : "Admin"} · {moneyDate(item.created_at)}</p></div></article>)}</div>}
    </section>
    <p style={footnote}>Catatan: pengajuan misi diperiksa admin sebelum bintang diberikan. Database mencegah hadiah misi yang sama masuk dua kali untuk periode yang sama.</p>
  </main>;
}

const pageStyle: React.CSSProperties = { maxWidth: 1120, margin: "0 auto", padding: "32px 20px 64px", color: "#F5F0E8" };
const h1: React.CSSProperties = { fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 850, letterSpacing: "-0.04em", margin: "8px 0" };
const h2: React.CSSProperties = { fontSize: "1.25rem", fontWeight: 800, margin: "8px 0 10px" };
const eyebrow: React.CSSProperties = { fontSize: ".72rem", letterSpacing: ".14em", color: "#FF8A3D", fontWeight: 800 };
const subtle: React.CSSProperties = { color: "#A9A9A9", lineHeight: 1.55, fontSize: ".9rem", margin: "6px 0 16px" };
const label: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 7, color: "#D8D8D8", fontSize: ".86rem", marginBottom: 14 };
const stat: React.CSSProperties = { display: "block", fontSize: "2rem", marginTop: 8 };
const statsGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, margin: "24px 0" };
const twoCols: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: 16, marginBottom: 16 };
const topbar: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" };
const formRow: React.CSSProperties = { display: "flex", gap: 12, flexWrap: "wrap" };
const list: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 10 };
const listItem: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", borderTop: "1px solid #303030", paddingTop: 14 };
const errorStyle: React.CSSProperties = { background: "#351919", border: "1px solid #7F3030", padding: 12, borderRadius: 10, margin: "16px 0", color: "#FFB4B4" };
const successStyle: React.CSSProperties = { background: "#15311E", border: "1px solid #2D7042", padding: 12, borderRadius: 10, margin: "16px 0", color: "#B8F5C9" };
const linkStyle: React.CSSProperties = { color: "#FF8A3D" };
const footnote: React.CSSProperties = { color: "#929292", fontSize: ".82rem", lineHeight: 1.6, marginTop: 18 };
const pill = (active: boolean): React.CSSProperties => ({ color: active ? "#B8F5C9" : "#D0D0D0", background: active ? "#15311E" : "#303030", borderRadius: 999, padding: "5px 10px", fontSize: ".75rem", fontWeight: 750 });
