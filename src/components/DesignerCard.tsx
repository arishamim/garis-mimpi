import Link from "next/link";
import type { Designer } from "@/data/mock";

export default function DesignerCard({ designer }: { designer: Designer }) {
  return (
    <Link href={`/designer/${designer.id}`} className="designer-card">
      <div style={{ position: "relative" }}>
        <img src={designer.photos[0]} alt={designer.name} />
        <div className="star-badge">★ {designer.stars}</div>
      </div>
      <div className="info">
        <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{designer.name}</div>
        <div style={{ fontSize: "0.875rem", opacity: 0.6, marginTop: "2px" }}>Desainer Grafis</div>
      </div>
    </Link>
  );
}
