"use client";

import { useEffect, useState } from "react";
import { designers as mockDesigners } from "@/data/mock";
import DesignerCard from "@/components/DesignerCard";
import { useApp } from "@/context/AppContext";

export default function Home() {
  const { lang } = useApp();
  const [allDesigners, setAllDesigners] = useState(mockDesigners);

  useEffect(() => {
    const works = JSON.parse(localStorage.getItem("garis-works") || "[]");
    if (works.length === 0) return;

    // Group uploaded works by owner
    const uploadedByOwner: Record<string, any> = {};
    works.forEach((w: any) => {
      if (!uploadedByOwner[w.owner]) {
        uploadedByOwner[w.owner] = {
          id: "user-" + w.owner,
          name: w.owner,
          stars: 0,
          photos: [],
        };
      }
      uploadedByOwner[w.owner].photos.push(w.image);
      uploadedByOwner[w.owner].stars += w.stars || 0;
    });

    const uploadedList = Object.values(uploadedByOwner);
    setAllDesigners([...uploadedList, ...mockDesigners]);
  }, []);

  const t = {
    id: { badge: "★ KARYA ANAK MUDA, UNTUK SEMUA", title: "Garis Mimpi,", sub: "DESAIN BERANI, IDE NYATA." },
    en: { badge: "★ YOUNG CREATIVES, FOR EVERYONE", title: "Garis Mimpi,", sub: "BOLD DESIGN, REAL IDEAS." },
  }[lang];

  const sorted = [...allDesigners].sort((a, b) => b.stars - a.stars);

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div style={{ color: "#FF6B00", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
          {t.badge}
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: 1.1 }}>
          {t.title}<br />
          <span style={{ color: "#FF6B00" }}>{t.sub}</span>
        </h1>
      </div>

      <div className="designer-grid">
        {sorted.map((d) => (
          <DesignerCard key={d.id} designer={d} />
        ))}
      </div>
    </div>
  );
}
