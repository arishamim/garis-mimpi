"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { designers } from "@/data/mock";

export default function DesignerPage() {
  const params = useParams();
  const id = params.id as string;
  const [folders, setFolders] = useState<{ name: string; photos: string[] }[]>([]);

  const designer = designers.find((d) => d.id === id) || {
    id,
    name: id.replace("user-", ""),
    stars: 0,
    photos: [],
  };

  useEffect(() => {
    const works = JSON.parse(localStorage.getItem("garis-works") || "[]");
    const ownerName = designer.name;

    // Ambil karya milik desainer ini
    const myWorks = works.filter((w: any) => w.owner === ownerName);

    // Kelompokkan berdasarkan folder
    const folderMap: Record<string, string[]> = {};
    myWorks.forEach((w: any) => {
      if (!folderMap[w.folder]) folderMap[w.folder] = [];
      folderMap[w.folder].push(w.image);
    });

    // Jika tidak ada karya, tampilkan folder default kosong
    const defaultFolders = ["3D Furniture", "Ilustrasi", "Logo", "Social Media"];
    const result = Object.keys(folderMap).length > 0
      ? Object.entries(folderMap).map(([name, photos]) => ({ name, photos }))
      : defaultFolders.map((name) => ({ name, photos: [] }));

    setFolders(result);
  }, [designer.name]);

  return (
    <div>
      <Link href="/" style={{ color: "#FF6B00", textDecoration: "none", fontSize: "0.875rem" }}>← Kembali</Link>

      <div style={{ marginTop: "1.5rem", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.25rem", fontWeight: "bold" }}>{designer.name}</h1>
        <div style={{ color: "#FF6B00", fontSize: "1.25rem", marginTop: "0.5rem" }}>★ {designer.stars} bintang</div>
      </div>

      <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>Folder</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
        {folders.map((folder) => (
          <Link
            key={folder.name}
            href={`/designer/${id}/${encodeURIComponent(folder.name)}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div style={{
              background: "#F5F0E8",
              borderRadius: "1rem",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,0.25)"
            }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2px",
                height: "180px",
                background: "#e5e5e5"
              }}>
                {folder.photos.length > 0 ? (
                  folder.photos.slice(0, 4).map((src, i) => (
                    <img key={i} src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ))
                ) : (
                  <div style={{
                    gridColumn: "1 / -1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#888",
                    fontSize: "0.875rem"
                  }}>
                    Belum ada karya
                  </div>
                )}
              </div>
              <div style={{ padding: "0.875rem 1rem", color: "#1A1A1A", fontWeight: 600 }}>
                📁 {folder.name}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
