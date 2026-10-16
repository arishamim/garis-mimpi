"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DesignerPage() {
  const params = useParams();
  const id = params.id as string;
  const ownerName = id.replace("user-", "");
  const [folders, setFolders] = useState<{ name: string; photos: string[] }[]>([]);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("works")
        .select("folder, image_url")
        .eq("owner", ownerName);

      if (error || !data) return;

      const map: Record<string, string[]> = {};
      data.forEach((w: any) => {
        if (!map[w.folder]) map[w.folder] = [];
        map[w.folder].push(w.image_url);
      });

      setFolders(
        Object.entries(map).map(([name, photos]) => ({ name, photos }))
      );
    }
    load();
  }, [ownerName]);

  return (
    <div>
      <Link href="/" style={{ color: "#FF6B00", textDecoration: "none", fontSize: "0.875rem" }}>← Kembali</Link>

      <div style={{ marginTop: "1.5rem", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.25rem", fontWeight: "bold" }}>{ownerName}</h1>
      </div>

      <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>Folder</h2>

      {folders.length === 0 ? (
        <p style={{ opacity: 0.6 }}>Belum ada karya.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
          {folders.map((folder) => (
            <Link
              key={folder.name}
              href={`/designer/${id}/${encodeURIComponent(folder.name)}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div style={{ background: "#F5F0E8", borderRadius: "1rem", overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px", height: "180px", background: "#e5e5e5" }}>
                  {folder.photos.slice(0, 4).map((src, i) => (
                    <img key={i} src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ))}
                </div>
                <div style={{ padding: "0.875rem 1rem", color: "#1A1A1A", fontWeight: 600 }}>
                  📁 {folder.name}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
