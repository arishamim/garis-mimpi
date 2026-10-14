"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { designers, foldersByDesigner, getFiles } from "@/data/mock";
import { useApp } from "@/context/AppContext";

export const dynamic = "force-dynamic";

export default function FolderPage() {
  const params = useParams();
  const designerId = params.id as string;
  const folderId = params.folder as string;
  const { lang, loggedIn } = useApp();

  const designer = designers.find((d) => d.id === designerId);
  const folder = (foldersByDesigner[designerId] || []).find((f) => f.id === folderId);
  const files = getFiles(designerId, folderId);

  if (!designer || !folder) {
    return <div>Folder tidak ditemukan</div>;
  }

  const t = {
    id: {
      back: "← Kembali ke desainer",
      order: "Order Jasa",
      needLogin: "Silakan login terlebih dahulu untuk melakukan pembelian.",
      success: "Order berhasil dibuat (simulasi escrow). Lanjut ke pembayaran e-wallet.",
    },
    en: {
      back: "← Back to designer",
      order: "Order Service",
      needLogin: "Please login first to make a purchase.",
      success: "Order created successfully (escrow simulation). Proceed to e-wallet payment.",
    },
  }[lang];

  const handleOrder = () => {
    if (!loggedIn) {
      alert(t.needLogin);
      return;
    }
    alert(t.success);
  };

  return (
    <div>
      <Link href={`/designer/${designerId}`} className="text-[#2E51A2] font-semibold mb-6 inline-block">
        {t.back}
      </Link>

      <h1 className="text-3xl font-bold mb-1">📁 {folder.name}</h1>
      <p className="opacity-75 mb-6">
        oleh {designer.name} • {files.length} file
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {files.map((file) => (
          <div key={file.id} className="bg-white rounded-xl overflow-hidden shadow">
            <img src={file.url} alt={file.name} className="w-full h-40 object-cover" />
            <div className="p-2 text-sm truncate">{file.name}</div>
          </div>
        ))}
      </div>

      <button
        onClick={handleOrder}
        className="bg-[#6D001F] hover:bg-[#8a0028] text-white px-8 py-3 rounded-lg font-semibold text-lg"
      >
        {t.order}
      </button>
      <p className="text-xs mt-3 opacity-60">Pembayaran via e-wallet • Fee 8% • Escrow aman</p>
    </div>
  );
}
