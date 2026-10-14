# Garis Mimpi — Starter Code

Versi starter untuk marketplace desain grafis sesuai spesifikasi v1.1.

## Fitur yang sudah ada

- Beranda: daftar desainer diurutkan berdasarkan jumlah bintang
- Halaman desainer: daftar folder kategori
- Di dalam folder: grid file/karya
- Language switcher ID | EN
- Simulasi login (magic link via email)
- Color palette sesuai spesifikasi
- Alur order (simulasi, cek login dulu)
- Responsive grid

## Cara menjalankan

1. Extract ZIP ini
2. Masuk ke folder `garis-mimpi`
3. Install dependencies:

```bash
npm install
```

4. Jalankan development server:

```bash
npm run dev
```

5. Buka http://localhost:3000

## Struktur

```
src/
├── app/                  # Halaman (App Router)
│   ├── page.tsx          # Beranda
│   ├── designer/[id]/    # Halaman desainer
│   └── designer/[id]/[folder]/  # Isi folder
├── components/           # Header, DesignerCard
├── context/              # Language + Auth simulation
├── data/mock.ts          # Data dummy (ganti dengan DB nanti)
└── app/globals.css       # Tailwind + warna
```

## Catatan untuk pengembangan selanjutnya

- Ganti mock data dengan database (PostgreSQL)
- Implementasi auth asli (magic link / OTP)
- Integrasi pembayaran (Xendit / Midtrans)
- Upload file + storage (Cloudflare R2 / S3)
- Chat internal
- Sistem bintang dari pembeli + admin
- Role admin / desainer / pembeli

Semua warna sudah sesuai:
- Rich Sky Bold `#2E51A2`
- Vogue Blonde `#D4BFA2`
- Shadow Rouge `#450213`
- Crimson Chic `#6D001F`

Selamat coding! Kalau ada error, mudah diperbaiki karena strukturnya sederhana.
