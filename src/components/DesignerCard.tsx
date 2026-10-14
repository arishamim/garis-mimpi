import Link from "next/link";
import type { Designer } from "@/data/mock";

export default function DesignerCard({ designer }: { designer: Designer }) {
  const photoCount = designer.photos.length;
  return (
    <Link
      href={`/designer/${designer.id}`}
      className="bg-[#F7F1E8] rounded-2xl overflow-hidden shadow hover:shadow-lg hover:-translate-y-1 transition-all block"
    >
      <div className={`h-44 grid ${photoCount === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
        {designer.photos.slice(0, 4).map((src, i) => (
          <img key={i} src={src} alt="" className="w-full h-full object-cover" />
        ))}
      </div>
      <div className="p-4">
        <div className="font-bold text-lg text-[#450213]">{designer.name}</div>
        <div className="text-yellow-600 mt-1 text-lg">
          ★★★ <span className="text-[#450213] font-semibold ml-1">{designer.stars}</span>
        </div>
      </div>
    </Link>
  );
}
