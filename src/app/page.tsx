"use client";

import { designers } from "@/data/mock";
import DesignerCard from "@/components/DesignerCard";
import { useApp } from "@/context/AppContext";

export default function Home() {
  const { lang } = useApp();

  const t = {
    id: { 
      title: "Temukan Desainer Impianmu", 
      sub: "Marketplace desain grafis dengan sistem bintang & transaksi aman" 
    },
    en: { 
      title: "Find Your Dream Designer", 
      sub: "Graphic design marketplace with star ranking & secure transactions" 
    },
  }[lang];

  const sorted = [...designers].sort((a, b) => b.stars - a.stars);

  return (
    <div className="pb-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#450213] mb-3">
          {t.title}
        </h1>
        <p className="text-[#450213]/80 text-lg max-w-2xl mx-auto">
          {t.sub}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sorted.map((d) => (
          <DesignerCard key={d.id} designer={d} />
        ))}
      </div>
    </div>
  );
}
