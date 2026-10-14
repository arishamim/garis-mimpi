import Link from "next/link";
import type { Designer } from "@/data/mock";

export default function DesignerCard({ designer }: { designer: Designer }) {
  return (
    <Link
      href={`/designer/${designer.id}`}
      className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={designer.photos[0]}
          alt={designer.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute top-3 right-3 bg-[#6D001F] text-white text-xs font-bold px-2.5 py-1 rounded-full">
          ★ {designer.stars}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-lg text-[#450213] truncate">{designer.name}</h3>
        <p className="text-sm text-[#450213]/70 mt-1">Desainer Grafis</p>
      </div>
    </Link>
  );
}
