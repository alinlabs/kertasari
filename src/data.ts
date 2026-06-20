import { Proker, Agenda } from './types';

export const PROKER_DATA: Proker[] = [
  {
    id: '1',
    judul: 'Pojok Literasi Desa',
    deskripsi: 'Membangun fasilitas membaca dan belajar untuk anak-anak desa guna meningkatkan minat baca sejak dini.',
    manfaat: [
      'Meningkatkan minat baca anak-anak usia sekolah tingkat dasar.',
      'Menyediakan ruang ramah anak yang dapat digunakan kegiatan edukatif.',
      'Mendorong tumbuhnya budaya literasi di lingkungan masyarakat desa.'
    ],
    targetSasaran: 'Anak-anak usia SD dan SMP di wilayah Desa'
  },
  {
    id: '2',
    judul: 'Digitalisasi UMKM',
    deskripsi: 'Memberikan pelatihan digital marketing dan pendaftaran e-commerce bagi pelaku Usaha Mikro Kecil dan Menengah di desa.',
    manfaat: [
      'Memperluas jangkauan pasar hingga keluar wilayah desa.',
      'Meningkatkan taraf pendapatan penggiat UMKM lokal.',
      'Memperkuat identitas digital produk-produk unggulan desa.'
    ],
    targetSasaran: 'Pelaku Usaha Mikro Kecil dan Menengah (UMKM)'
  },
  {
    id: '3',
    judul: 'Penyuluhan Stunting & Gizi',
    deskripsi: 'Bekerja sama dengan Puskesmas setempat untuk memberikan edukasi mengenai gizi seimbang untuk balita dan ibu hamil.',
    manfaat: [
      'Meningkatkan kesadaran ibu hamil tentang asupan gizi seimbang.',
      'Menekan angka potensi stunting pada balita.',
      'Memperbaiki pola asuh dan pola makan di lingkungan keluarga.'
    ],
    targetSasaran: 'Ibu hamil, ibu menyusui, dan ibu balita'
  },
  {
    id: '4',
    judul: 'Kerja Bakti Lingkungan',
    deskripsi: 'Program rutin mingguan untuk membersihkan fasilitas umum, saluran air, and penanaman pohon di area vital desa.',
    manfaat: [
      'Menciptakan lingkungan yang bersih, sehat, dan nyaman.',
      'Menghindari terjadinya banjir akibat penyumbatan saluran air.',
      'Menumbuhkan semangat gotong royong warga desa.'
    ],
    targetSasaran: 'Seluruh warga desa'
  }
];

export const AGENDA_DATA: Agenda[] = [
  {
    id: '1',
    tanggal: '2026-07-01',
    waktu: '08:00',
    judul: 'Penerimaan di Balai Desa',
    lokasi: 'Balai Desa Kertasari',
    deskripsi: 'Serah terima mahasiswa KPPM dari pihak kampus ke pemerintah desa.',
    pic: '1',
    anggota: ['2', '3', '4'],
    detailKegiatan: [
      'Kegiatan ini merupakan prosesi formal penyerahan mahasiswa oleh Dosen Pembimbing Lapangan kepada Kepala Desa.',
      'Dilanjutkan dengan perkenalan dengan perangkat desa.'
    ],
    output: [
      'Terjalinnya persetujuan dan izin pelaksanaan program kerja selama periode KPPM.',
      'Pemahaman perangkat desa tentang profil kelompok.'
    ],
    status: 'Selesai'
  },
  {
    id: '1b',
    tanggal: '2026-07-01',
    waktu: '13:00',
    judul: 'Rapat Perdana Kelompok',
    lokasi: 'Posko KPPM',
    deskripsi: 'Pembagian jobdesk awal dan penyusunan tata tertib posko.',
    pic: '2',
    anggota: ['1', '2', '3', '4', '5', '6', '7'],
    detailKegiatan: [
      'Membahas pembagian tugas harian seperti piket kebersihan, memasak, dan tugas publikasi.',
      'Menyepakati aturan jam malam dan tamu.'
    ],
    output: [
      'Tersusunnya jadwal piket harian.',
      'Terdapat kesepakatan tata tertib posko yang ditandatangani seluruh anggota.'
    ],
    status: 'Selesai'
  },
  {
    id: '2',
    tanggal: '2026-07-02',
    waktu: '09:00',
    judul: 'Observasi Dusun I & II',
    lokasi: 'Dusun I dan Dusun II',
    deskripsi: 'Pemetaan awal potensi dan masalah yang ada di kawasan dusun.',
    pic: '3',
    anggota: ['4', '5'],
    detailKegiatan: [
      'Melakukan wawancara dengan ketua RW dan RT setempat.',
      'Mengamati secara langsung kondisi infrastruktur and sumber daya alam.'
    ],
    output: [
      'Dokumen peta sosial dusun.',
      'Daftar masalah utama yang akan dicarikan solusi melalui program kerja.'
    ],
    status: 'Selesai'
  },
  {
    id: '3',
    tanggal: '2026-07-04',
    waktu: '07:00',
    judul: 'Kerja Bakti Desa',
    lokasi: 'Sepanjang Jalan Utama',
    deskripsi: 'Sabtu bersih bersama warga desa, pembersihan gorong-gorong.',
    pic: '4',
    terkaitProker: '4',
    status: 'Selesai'
  },
  {
    id: '4',
    tanggal: '2026-07-10',
    waktu: '09:00',
    judul: 'Penyuluhan Gizi Balita',
    lokasi: 'Posyandu Melati',
    deskripsi: 'Penyuluhan stunting ibu hamil dan balita bersama bidan desa.',
    pic: '7',
    terkaitProker: '3',
    status: 'Rencana'
  },
  {
    id: '5',
    tanggal: '2026-07-15',
    waktu: '10:00',
    judul: 'Pelatihan Digital UMKM',
    lokasi: 'Balai Desa',
    deskripsi: 'Praktik pembuatan akun e-commerce untuk pengusaha makanan ringan.',
    pic: '5',
    terkaitProker: '2',
    status: 'Rencana'
  },
  {
    id: '6',
    tanggal: '2026-07-25',
    waktu: '08:00',
    judul: 'Lomba Anak Sholeh',
    lokasi: 'Masjid Jami Kertasari',
    deskripsi: 'Lomba adzan, mewarnai, dan cerdas cermat tingkat SD.',
    pic: '6',
    terkaitProker: '1',
    status: 'Rencana'
  },
  {
    id: '7',
    tanggal: '2026-07-31',
    waktu: '19:30',
    judul: 'Malam Perpisahan (Penutupan)',
    lokasi: 'Lapangan Balai Desa',
    deskripsi: 'Acara pamitan dengan warga, pemutaran video dokumenter, dan makan bersama.',
    pic: '1',
    status: 'Rencana'
  }
];

