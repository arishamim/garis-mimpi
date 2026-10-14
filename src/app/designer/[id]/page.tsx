"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { designers, foldersByDesigner } from "@/data/mock";
import { useApp } from "@/context/AppContext";

export const dynamic = "force-dynamic";

export default function DesignerPage() {
  const params = useParams();
  const id = params.id as string;
  const { lang } = useApp();

  const designer = designers.find((d) => d.id === id);
  const folders = foldersByDesigner[id] || [];

  if (!designer) {
    return <div>Desainer tidak ditemukan</div>;
  }

  const t = {
    id: { back: "← Kembali", cat: "Folder Kategori", stars: "bintang" },
    en: { back: "← Back", cat: "Category Folders", stars: "stars" },
  }[lang];

  return (
    <div>
      <Link href="/" className="text-[#2E51A2] font-semibold mb-6 inline-block">
        {t.back}
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-[#2E51A2] flex items-center justify-center text-white text-2xl font-bold">
          {designer.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{designer.name}</h1>
          <div className="text-yellow-600 text-xl mt-1">
            ★★★ <span className="text-[#450213] font-semibold ml-1">{designer.stars}</span> {t.stars}
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">{t.cat}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {folders.map((f) => (
          <Link
            key={f.id}
            href={`/designer/${id}/${f.id}`}
            className="bg-[#F7F1E8] rounded-2xl overflow-hidden shadow hover:shadow-md transition block"
          >
            <div className="h-40 grid grid-cols-2">
              {f.preview.map((src, i) => (
                <img key={i} src={src} alt="" className="w-full h-full object-cover" />
              ))}
            </div>
            <div className="p-4">
              <div className="font-semibold text-lg">📁 {f.name}</div>
              <div className="text-sm opacity-70">{f.fileCount} file</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
