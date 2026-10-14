// Mock data untuk Garis Mimpi starter
// Ganti dengan data dari database nanti

export type Designer = {
  id: string;
  name: string;
  stars: number;
  photos: string[]; // url preview yang dipilih desainer (1-4)
  bio?: string;
};

export type Folder = {
  id: string;
  name: string;
  preview: string[];
  fileCount: number;
};

export type WorkFile = {
  id: string;
  name: string;
  url: string;
  type: "image" | "pdf" | "other";
};

export const designers: Designer[] = [
  {
    id: "awan",
    name: "Awan Santoso",
    stars: 1248,
    photos: [
      "https://picsum.photos/seed/awan1/600/400",
      "https://picsum.photos/seed/awan2/600/400",
      "https://picsum.photos/seed/awan3/600/400",
      "https://picsum.photos/seed/awan4/600/400",
    ],
  },
  {
    id: "laras",
    name: "Laras Putri",
    stars: 987,
    photos: [
      "https://picsum.photos/seed/laras1/600/400",
      "https://picsum.photos/seed/laras2/600/400",
    ],
  },
  {
    id: "dimas",
    name: "Dimas Wijaya",
    stars: 856,
    photos: ["https://picsum.photos/seed/dimas1/600/400"],
  },
  {
    id: "nadia",
    name: "Nadia Pramesti",
    stars: 742,
    photos: [
      "https://picsum.photos/seed/nadia1/600/400",
      "https://picsum.photos/seed/nadia2/600/400",
      "https://picsum.photos/seed/nadia3/600/400",
      "https://picsum.photos/seed/nadia4/600/400",
    ],
  },
];

export const foldersByDesigner: Record<string, Folder[]> = {
  awan: [
    { id: "3d", name: "3D Furniture", preview: ["https://picsum.photos/seed/3d1/400/300", "https://picsum.photos/seed/3d2/400/300"], fileCount: 12 },
    { id: "sm", name: "Template Sosial Media", preview: ["https://picsum.photos/seed/sm1/400/300", "https://picsum.photos/seed/sm2/400/300"], fileCount: 28 },
    { id: "logo", name: "Logo", preview: ["https://picsum.photos/seed/logo1/400/300", "https://picsum.photos/seed/logo2/400/300"], fileCount: 15 },
  ],
  laras: [
    { id: "illus", name: "Ilustrasi Merchandise", preview: ["https://picsum.photos/seed/illus1/400/300", "https://picsum.photos/seed/illus2/400/300"], fileCount: 9 },
    { id: "pack", name: "Packaging", preview: ["https://picsum.photos/seed/pack1/400/300", "https://picsum.photos/seed/pack2/400/300"], fileCount: 7 },
  ],
  dimas: [
    { id: "web", name: "Web Design", preview: ["https://picsum.photos/seed/web1/400/300", "https://picsum.photos/seed/web2/400/300"], fileCount: 5 },
  ],
  nadia: [
    { id: "brand", name: "Brand Identity", preview: ["https://picsum.photos/seed/brand1/400/300", "https://picsum.photos/seed/brand2/400/300"], fileCount: 11 },
    { id: "poster", name: "Poster & Flyer", preview: ["https://picsum.photos/seed/poster1/400/300", "https://picsum.photos/seed/poster2/400/300"], fileCount: 18 },
  ],
};

// Generate dummy files
export function getFiles(designerId: string, folderId: string): WorkFile[] {
  return Array.from({ length: 8 }).map((_, i) => ({
    id: `${folderId}-${i}`,
    name: `Desain ${i + 1}.jpg`,
    url: `https://picsum.photos/seed/${designerId}${folderId}${i}/600/450`,
    type: "image" as const,
  }));
}
