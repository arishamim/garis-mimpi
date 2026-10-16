"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import Link from "next/link";

export default function UploadPage() {
  const { loggedIn, userEmail } = useApp();
  const [folders, setFolders] = useState<string[]>(["3D Furniture", "Logo", "Ilustrasi"]);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [newFolder, setNewFolder] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [message, setMessage] = useState("");
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("garis-folders");
    if (saved) setFolders(JSON.parse(saved));
  }, []);

  if (!loggedIn) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Login dulu untuk upload karya</h2>
        <Link href="/" style={{ color: "#FF6B00" }}>Kembali ke Beranda</Link>
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

  const handleUpload = () => {
    if (!selectedFolder) {
      setMessage("Pilih atau buat folder dulu.");
      return;
    }
    if (!fileName) {
      setMessage("Pilih file dulu.");
      return;
    }

    // Ambil username dari profil
    const profile = JSON.parse(localStorage.getItem("garis-profile") || "{}");
    const displayName = profile.username || profile.fullName || userEmail?.split("@")[0] || "User";

    const works = JSON.parse(localStorage.getItem("garis-works") || "[]");
    const newWork = {
      id: Date.now(),
      title: fileName,
      folder: selectedFolder,
      owner: displayName,          // ← sekarang pakai username
      stars: 0,
      image: "https://picsum.photos/seed/" + Date.now() + "/400/300",
    };
    works.push(newWork);
    localStorage.setItem("garis-works", JSON.stringify(works));

    setMessage(`Karya berhasil diupload sebagai "${displayName}".`);
    setFileName("");
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Tambah Karya</h1>
      <p style={{ opacity: 0.7, marginBottom: "2rem" }}>Pastikan sudah isi Username di Profil.</p>

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
        <input
          type="file"
          onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
          style={{ color: "#F5F0E8" }}
        />
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

      <Link href="/" style={{ display: "inline-block", marginTop: "2rem", color: "#FF6B00" }}>← Kembali ke Beranda</Link>
    </div>
  );
}
