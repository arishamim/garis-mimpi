"use client";

import { designers } from "@/data/mock";
import DesignerCard from "@/components/DesignerCard";
import { useApp } from "@/context/AppContext";

export default function Home() {
  const { lang } = useApp();

  const t = {
    id: { title: "Garis Mimpi,", sub: "DESAIN BERANI, IDE NYATA." },
    en: { title: "Garis Mimpi,", sub: "BOLD DESIGN, REAL IDEAS." },
  }[lang];

  const sorted = [...designers].sort((a, b) => b.stars - a.stars);

  return (
    <div>
      <div className="text-center mb-12">
        <div className="text-[#FF6B00] text-xs font-bold tracking-widest mb-3">★ KARYA ANAK MUDA, UNTUK SEMUA</div>
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
          {t.title}<br />
          <span className="text-[#FF6B00]">{t.sub}</span>
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
