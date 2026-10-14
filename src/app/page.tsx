"use client";

import { designers } from "@/data/mock";
import DesignerCard from "@/components/DesignerCard";
import { useApp } from "@/context/AppContext";

export default function Home() {
  const { lang } = useApp();

  const t = {
    id: { title: "Desainer Terbaik", sub: "Temukan desainer berdasarkan jumlah bintang tertinggi" },
    en: { title: "Top Designers", sub: "Discover designers ranked by total stars" },
  }[lang];

  // Sort by stars desc
  const sorted = [...designers].sort((a, b) => b.stars - a.stars);

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold mb-2">{t.title}</h1>
      <p className="opacity-75 mb-8">{t.sub}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {sorted.map((d) => (
          <DesignerCard key={d.id} designer={d} />
        ))}
      </div>
    </div>
  );
}
