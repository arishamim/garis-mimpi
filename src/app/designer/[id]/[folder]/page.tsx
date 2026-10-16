"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function FolderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const folder = decodeURIComponent((params.folder as string) || "");
  const ownerName = id.replace("user-", "");
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("works")
        .select("image_url")
        .eq("owner", ownerName)
        .eq("folder", folder);

      if (!error && data) {
        setImages(data.map((d: any) => d.image_url));
      }
    }
    load();
  }, [ownerName, folder]);

  return (
    <div>
      <Link href={`/designer/${id}`} style={{ color: "#FF6B00", textDecoration: "none", fontSize: "0.875rem" }}>
        ← Kembali ke {ownerName}
      </Link>

      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginTop: "1rem", marginBottom: "1.5rem" }}>
        {folder || "Folder"}
      </h1>

      {images.length === 0 ? (
        <p style={{ opacity: 0.6 }}>Belum ada karya di folder ini.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {images.map((src, i) => (
            <img key={i} src={src} alt="" style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "0.75rem" }} />
          ))}
        </div>
      )}

      <button
        onClick={() => router.push(`/chat/${id}`)}
        style={{
          background: "#FF6B00",
          color: "#000",
          padding: "0.875rem 2rem",
          borderRadius: "9999px",
          border: "none",
          fontWeight: 700,
          cursor: "pointer"
        }}
      >
        Order Jasa
      </button>
    </div>
  );
}
