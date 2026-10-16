"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { designers } from "@/data/mock";
import { useApp } from "@/context/AppContext";

export default function DesignerPage() {
  const params = useParams();
  const id = params.id as string;
  const { lang } = useApp();

  const designer = designers.find((d) => d.id === id) || {
    id,
    name: id.replace("user-", ""),
    stars: 0,
    photos: ["https://picsum.photos/seed/" + id + "/800/600"],
  };

  const folders = ["3D Furniture", "Ilustrasi", "Logo", "Social Media"];

  return (
    <div>
      <Link href="/" style={{ color: "#FF6B00", textDecoration: "none", fontSize: "0.875rem" }}>← Kembali</Link>

      <div style={{ marginTop: "1.5rem", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.25rem", fontWeight: "bold" }}>{designer.name}</h1>
        <div style={{ color: "#FF6B00", fontSize: "1.25rem", marginTop: "0.5rem" }}>★ {designer.stars} bintang</div>
      </div>

      <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>Folder</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
        {folders.map((folder) => (
          <Link
            key={folder}
            href={`/designer/${id}/${encodeURIComponent(folder)}`}
            style={{
              background: "#F5F0E8",
              color: "#1A1A1A",
              borderRadius: "1rem",
              padding: "1.25rem",
              textDecoration: "none",
              fontWeight: 600,
              display: "block"
            }}
          >
            📁 {folder}
          </Link>
        ))}
      </div>
    </div>
  );
}
