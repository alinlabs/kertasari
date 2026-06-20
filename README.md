# Sistem Informasi Kuliah Praktik Pengabdian Masyarakat (KPPM) - Desa Kertasari

Aplikasi berbasis web modern ini dirancang sebagai platform Sistem Informasi dan Manajemen Terpadu untuk menunjang kegiatan Kuliah Praktik Pengabdian Masyarakat (KPPM) STIE Wikara di Desa Kertasari. Aplikasi ini menyediakan solusi komprehensif untuk dokumentasi administrasi, absensi, pengelolaan program kerja, pengelolaan keuangan, serta informasi interaktif mengenai profil wilayah.

## Fitur Utama

1. **Dashboard (Beranda)**
   - Akses cepat dan ringkasan aktivitas terkini.
   - Peta interaktif Profil Desa Kertasari.
   - Ringkasan statistik kelompok dan progres program kerja (Proker).

2. **Manajemen Program Kerja (Proker)**
   - Pencatatan dan pelacakan daftar program kerja.
   - Sistem timeline dari kegiatan lapangan, perencanaan, hingga evaluasi.

3. **Agenda & Timeline**
   - Penjadwalan kalender terpadu.
   - Fitur pengingat dan perubahan status jadwal harian secara real-time.

4. **Kehadiran & Absensi**
   - Sistem rekap absensi harian secara digital.
   - Pemilihan status kehadiran, dan pelacakan keterangan individu dari setiap anggota KPPM.
   - Export rekap absensi langsung terformat menjadi dokumen PDF dan Excel.

5. **Pengelolaan Keuangan**
   - Buku kas digital meliputi rekapitulasi pemasukan, pengeluaran, dan saldo proyek.
   - Visualisasi keuangan interaktif yang dapat memudahkan anggota mengatur manajemen dana kas kegiatan.

6. **Administrasi & Keanggotaan**
   - Manajemen basis data internal anggota kelompok dan struktural KPPM.
   - Akses ringkas data divisi, profil individu, dan export data struktural secara cepat.

7. **Profil / Seputar Kami**
   - Menampilkan latar belakang, slogan, dan informasi terperinci seputar Desa Kertasari (termasuk Visi, Misi, Sejarah).
   - Export eksklusif berbentuk PDF, berdesain seperti lembar resume resmi atau publikasi majalah.

8. **Pengaturan & Notifikasi**
   - Kustomisasi profil dan notifikasi.
   - Pembersihan *cache* dan fungsionalitas memori perangkat lokal (*Local Storage*).
   - Support notifikasi *push/desktop* bawaan browser.

## Tech Stack & Architecture
- **Framework:** [React 19](https://react.dev/) dengan [Vite](https://vitejs.dev/)
- **Bahasa:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Iconography:** [Lucide React](https://lucide.dev/)
- **State & Storage:** Menggunakan kapabilitas memori lokal browser (`localStorage`) dalam React *Context API*.
- **Motion/Animation:** [Motion (sebelumnya Framer Motion)](https://motion.dev/)
- **Dokumen Export:** Menggunakan library seperti `jspdf` dan `html2canvas` / `html-to-image` serta integrasi export ke XLSX.

## Data Interaktif Peta & Sumber API Dasar

Pada modul *MapComponent.tsx*, aplikasi tidak bergantung pada satu layer komersial tunggal dan menyajikan kemudahan berganti tipe tampilan wilayah (Tampilan Standar, Jalan, Medan, Satelit, Topografi). Peta memanfaatkan integrasi terbuka via **React-Leaflet** dengan beberapa sumber pihak ketiga:

1. **Google Maps Tiles Server**
   - **Standar & Medan:** `https://mt1.google.com/vt/lyrs=m,traffic...` dan `lyrs=p`, `lyrs=t`
   - Digunakan untuk menampilkan data kartografi umum base layer dasar peta dengan resolusi tinggi.

2. **ArcGIS Online (Esri)**
   - **Satelit (World Imagery):** `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`
   - Digunakan untuk tampilan satelit realistis cakupan kawasan Desa Kertasari.

3. **CartoDB (Basemaps)**
   - **Jalan & Bersih (Light Nolabels / Voyager):** `https://{s}.basemaps.cartocdn.com/...`
   - Digunakan untuk menghasilkan base layer netral saat ekspor area atau ketika tampilan fokus hanya pada batas poligon.

4. **OpenTopoMap**
   - **Topografi:** `https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png`
   - Data elevasi, lereng, dan medan kontur pegunungan untuk area pedesaan.

5. **GeoJSON Internal**
   - Batas desa (*boundary* Kertasari PolyGon/MultiPolyGon) diload secara internal menggunakan file `.json`.

## Keamanan Data & Privasi
Mengingat ini adalah proyek lingkup lokal/internal kegiatan kemahasiswaan:
1. Tidak ada server eksternal perantara pihak ketiga yang mengoleksi form absensi atau program kerja (sepenuhnya disinkronisasi dalam memori lokal browser perangkat masing-masing pengguna / *Offline-first capability*).
2. Export atau unduh langsung dicetak pada tingkat *client-side* ke berkas lokal dengan format enkripsi standar PDF dan format data XLSX.

## Panduan Lokal Developer
1. Pastikan Anda mempunyai `Node.js` terbaru.
2. Lakukan `npm install` atau `yarn install`.
3. Jalankan server simulasi lokal dengan `npm run dev`.

---
*Didedikasikan untuk pengembangan masyarakat dan digitalisasi tata kelola administrasi wilayah yang komprehensif bagi pelaksana pengabdian desa.*
