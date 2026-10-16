"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FolderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const folder = decodeURIComponent(params.folder as string);

  const files = [
    "https://picsum.photos/seed/" + folder + "1/400/300",
    "https://picsum.photos/seed/" + folder + "2/400/300",
    "https://picsum.photos/seed/" + folder + "3/400/300",
  ];

  const handleOrder = () => {
    router.push(`/chat/${id}`);
  };

  return (
    <div>
      <Link href={`/designer/${id}`} style={{ color: "#FF6B00", textDecoration: "none", fontSize: "0.875rem" }}>← Kembali ke {id}</Link>

      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginTop: "1rem", marginBottom: "1.5rem" }}>{folder}</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {files.map((src, i) => (
          <img key={i} src={src} alt="" style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "0.75rem" }} />
        ))}
      </div>

      <button
        onClick={handleOrder}
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
        Order Jasa
      </button>
    </div>
  );
}
