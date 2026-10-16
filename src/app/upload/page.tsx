"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function UploadPage() {
  const { loggedIn } = useApp();
  const [folders, setFolders] = useState<string[]>(["3D Furniture", "Logo", "Ilustrasi"]);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [newFolder, setNewFolder] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("garis-folders");
    if (saved) setFolders(JSON.parse(saved));
  }, []);

  if (!loggedIn) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <h2>Login dulu</h2>
        <Link href="/" style={{ color: "#FF6B00" }}>Kembali</Link>
      </div>
    );
  }

  const profile = JSON.parse(localStorage.getItem("garis-profile") || "{}");
  const profileComplete = profile.username && profile.fullName && profile.ewallet;

  if (!profileComplete) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <h2>Lengkapi Profil Dulu</h2>
        <Link href="/profile" style={{ color: "#FF6B00" }}>Isi Profil</Link>
      </div>
    );
  }

  const handleCreateFolder = () => {
    if (!newFolder.trim()) return;
    const name = newFolder.trim();
    if (!folders.includes(name)) {
      const updated = [...folders, name];
      setFolders(updated);
      localStorage.setItem("garis-folders", JSON.stringify(updated));
    }
    setSelectedFolder(name);
    setNewFolder("");
    setShowNew(false);
  };

  const handleUpload = async () => {
    if (!selectedFolder || !file) {
      setMessage("Pilih folder dan file dulu.");
      return;
    }

    setUploading(true);
    setMessage("Mengupload...");

    const displayName = profile.username || profile.fullName || "User";
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${displayName}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("works")
      .upload(filePath, file);

    if (uploadError) {
      setMessage("Gagal upload: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("works")
      .getPublicUrl(filePath);

    const { error: dbError } = await supabase.from("works").insert({
      title: file.name,
      folder: selectedFolder,
      owner: displayName,
      image_url: urlData.publicUrl,
      stars: 0,
    });

    if (dbError) {
      setMessage("Gagal simpan data: " + dbError.message);
    } else {
      setMessage("Karya berhasil diupload!");
      setFile(null);
    }

    setUploading(false);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>Tambah Karya</h1>

      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>Pilih Folder</label>
        <select
          value={selectedFolder}
          onChange={(e) => setSelectedFolder(e.target.value)}
          style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", background: "#1A1A1A", color: "#F5F0E8", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <option value="">-- Pilih folder --</option>
          {folders.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <button onClick={() => setShowNew(!showNew)} style={{ background: "transparent", color: "#FF6B00", border: "1px solid #FF6B00", padding: "0.5rem 1rem", borderRadius: "9999px", marginBottom: "1rem" }}>
        + Buat Folder Baru
      </button>

      {showNew && (
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <input value={newFolder} onChange={(e) => setNewFolder(e.target.value)} placeholder="Nama folder" style={{ flex: 1, padding: "0.75rem", borderRadius: "0.5rem", background: "#1A1A1A", color: "#F5F0E8", border: "1px solid rgba(255,255,255,0.2)" }} />
          <button onClick={handleCreateFolder} style={{ background: "#FF6B00", color: "#000", padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "none" }}>Buat</button>
        </div>
      )}

      <div style={{ marginBottom: "1.5rem" }}>
        <label>Upload File</label><br />
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ marginTop: "0.5rem", color: "#F5F0E8" }} />
      </div>

      <button
        onClick={handleUpload}
        disabled={uploading}
        style={{ background: "#FF6B00", color: "#000", padding: "0.875rem 2rem", borderRadius: "9999px", border: "none", fontWeight: 700, cursor: uploading ? "not-allowed" : "pointer" }}
      >
        {uploading ? "Mengupload..." : "Upload Karya"}
      </button>

      {message && <p style={{ marginTop: "1rem", padding: "1rem", background: "rgba(255,107,0,0.1)", borderRadius: "0.5rem" }}>{message}</p>}

      <Link href="/" style={{ display: "inline-block", marginTop: "2rem", color: "#FF6B00" }}>← Kembali</Link>
    </div>
  );
}
