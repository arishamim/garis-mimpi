"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import Link from "next/link";

const FOLDER_PRESETS = [
  { category: "3D", items: ["3D Furniture", "3D Mockup"] },
  { category: "Ilustrasi", items: ["Comic", "Merchandise", "Character", "Digital Art"] },
  { category: "Logo", items: ["Logo", "Brand Identity"] },
  { category: "Lainnya", items: ["Social Media", "Poster & Flyer", "Packaging", "UI/UX", "Typography"] },
];

export default function UploadPage() {
  const { loggedIn } = useApp();
  const [folders, setFolders] = useState<string[]>(["3D Furniture", "Logo"]);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [newFolder, setNewFolder] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [message, setMessage] = useState("");

  if (!loggedIn) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Login dulu untuk upload karya</h2>
        <p style={{ opacity: 0.7 }}>Gunakan tombol Masuk di header.</p>
      </div>
    );
  }

  const handleCreateFolder = () => {
    if (!newFolder.trim()) return;
    if (!folders.includes(newFolder.trim())) {
      setFolders([...folders, newFolder.trim()]);
    }
    setSelectedFolder(newFolder.trim());
    setNewFolder("");
    setShowNew(false);
    setMessage(`Folder "${newFolder.trim()}" siap digunakan.`);
  };

  const handleUpload = () => {
    if (!selectedFolder) {
      setMessage("Pilih atau buat folder dulu.");
      return;
    }
    setMessage(`Karya berhasil diupload ke folder "${selectedFolder}" (simulasi).`);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Tambah Karya</h1>
      <p style={{ opacity: 0.7, marginBottom: "2rem" }}>Lengkapi profil dulu sebelum upload (simulasi: sudah dianggap lengkap).</p>

      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Pilih Folder</label>
        <select
          value={selectedFolder}
          onChange={(e) => setSelectedFolder(e.target.value)}
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "0.5rem",
            background: "#1A1A1A",
            color: "#F5F0E8",
            border: "1px solid rgba(255,255,255,0.2)"
          }}
        >
          <option value="">-- Pilih folder --</option>
          {folders.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <button
        onClick={() => setShowNew(!showNew)}
        style={{
          background: "transparent",
          color: "#FF6B00",
          border: "1px solid #FF6B00",
          padding: "0.5rem 1rem",
          borderRadius: "9999px",
          marginBottom: "1rem",
          cursor: "pointer"
        }}
      >
        + Buat Folder Baru
      </button>

      {showNew && (
        <div style={{ marginBottom: "1.5rem", display: "flex", gap: "0.5rem" }}>
          <input
            value={newFolder}
            onChange={(e) => setNewFolder(e.target.value)}
            placeholder="Nama folder baru"
            style={{
              flex: 1,
              padding: "0.75rem",
              borderRadius: "0.5rem",
              background: "#1A1A1A",
              color: "#F5F0E8",
              border: "1px solid rgba(255,255,255,0.2)"
            }}
          />
          <button
            onClick={handleCreateFolder}
            style={{
              background: "#FF6B00",
              color: "#000",
              padding: "0.75rem 1.25rem",
              borderRadius: "0.5rem",
              border: "none",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Buat
          </button>
        </div>
      )}

      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Upload File</label>
        <input type="file" multiple style={{ color: "#F5F0E8" }} />
        <p style={{ fontSize: "0.75rem", opacity: 0.6, marginTop: "0.25rem" }}>Format bebas (simulasi). Hasil akhir order wajib ZIP.</p>
      </div>

      <button
        onClick={handleUpload}
        style={{
          background: "#FF6B00",
          color: "#000",
          padding: "0.875rem 2rem",
          borderRadius: "9999px",
          border: "none",
          fontWeight: 700,
          fontSize: "1rem",
          cursor: "pointer"
        }}
      >
        Upload Karya
      </button>

      {message && (
        <p style={{ marginTop: "1.5rem", padding: "1rem", background: "rgba(255,107,0,0.1)", borderRadius: "0.5rem" }}>
          {message}
        </p>
      )}

      <div style={{ marginTop: "2rem", fontSize: "0.875rem", opacity: 0.6 }}>
        <p>Preset kategori yang disarankan:</p>
        <ul style={{ marginTop: "0.5rem", paddingLeft: "1.25rem" }}>
          {FOLDER_PRESETS.map((g) => (
            <li key={g.category}><strong>{g.category}:</strong> {g.items.join(", ")}</li>
          ))}
        </ul>
      </div>

      <Link href="/" style={{ display: "inline-block", marginTop: "2rem", color: "#FF6B00" }}>← Kembali ke Beranda</Link>
    </div>
  );
}
