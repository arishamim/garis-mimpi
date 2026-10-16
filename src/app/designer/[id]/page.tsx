"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { designers } from "@/data/mock";

export default function DesignerPage() {
  const params = useParams();
  const id = params.id as string;

  const designer = designers.find((d) => d.id === id) || {
    id,
    name: id.replace("user-", ""),
    stars: 0,
    photos: ["https://picsum.photos/seed/" + id + "/800/600"],
  };

  // Contoh folder dengan preview foto (2-4 gambar)
  const folders = [
    {
      name: "3D Furniture",
      photos: [
        "https://picsum.photos/seed/furn1/300/300",
        "https://picsum.photos/seed/furn2/300/300",
        "https://picsum.photos/seed/furn3/300/300",
        "https://picsum.photos/seed/furn4/300/300",
      ],
    },
    {
      name: "Ilustrasi",
      photos: [
        "https://picsum.photos/seed/ill1/300/300",
        "https://picsum.photos/seed/ill2/300/300",
        "https://picsum.photos/seed/ill3/300/300",
      ],
    },
    {
      name: "Logo",
      photos: [
        "https://picsum.photos/seed/logo1/300/300",
        "https://picsum.photos/seed/logo2/300/300",
      ],
    },
    {
      name: "Social Media",
      photos: [
        "https://picsum.photos/seed/soc1/300/300",
        "https://picsum.photos/seed/soc2/300/300",
        "https://picsum.photos/seed/soc3/300/300",
        "https://picsum.photos/seed/soc4/300/300",
      ],
    },
  ];

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
              {/* Grid foto 2x2 seperti Instagram */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2px",
                height: "180px",
                background: "#ddd"
              }}>
                {folder.photos.slice(0, 4).map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ))}
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
