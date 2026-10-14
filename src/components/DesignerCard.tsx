import Link from "next/link";
import type { Designer } from "@/data/mock";

export default function DesignerCard({ designer }: { designer: Designer }) {
  return (
    <Link
      href={`/designer/${designer.id}`}
      className="group bg-[#F5F0E8] text-[#1A1A1A] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={designer.photos[0]}
          alt={designer.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute top-3 right-3 bg-[#FF6B00] text-black text-xs font-bold px-2.5 py-1 rounded-full">
          ★ {designer.stars}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg truncate">{designer.name}</h3>
        <p className="text-sm text-black/60 mt-0.5">Desainer Grafis</p>
      </div>
    </Link>
  );
}
