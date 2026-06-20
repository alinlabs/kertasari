export interface Proker {
  id: string;
  judul: string;
  deskripsi: string;
  manfaat?: string[];
  targetSasaran?: string;
}

export type AgendaStatus = 'Selesai' | 'Rencana' | 'Terlewat' | '';

export interface KebutuhanItem {
  barang: string;
  jenis: 'Beli' | 'Sewa' | 'Pinjam';
  nominal?: number;
}

export interface Agenda {
  id: string;
  tanggal: string;
  waktu: string;
  judul: string;
  lokasi: string;
  deskripsi?: string;
  pic?: string;
  anggota?: string[];
  detailKegiatan?: string[];
  output?: string[];
  terkaitProker?: string;
  status: AgendaStatus;
  kebutuhan?: KebutuhanItem[];
}

export interface Keanggotaan {
  id: string;
  nama: string;
  jabatan: string;
  divisi: string;
  telepon: string;
  email: string;
  nim: string;
}

export interface Kehadiran {
  id: string;
  tanggal: string;
  anggotaId: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa' | 'Pulang';
  keterangan: string;
}

export interface Keuangan {
  id: string;
  tanggal: string;
  jenis: 'Pemasukan' | 'Pengeluaran';
  kategori: string;
  sumber: string;
  jumlah: number;
  keterangan: string;
}

export interface Administrasi {
  id: string;
  tanggal: string;
  jenis: 'Surat Masuk' | 'Surat Keluar' | 'Proposal' | 'Laporan';
  perihal: string;
  tujuan: string;
  deskripsi?: string;
  dokumen?: string;
}

export interface Seputar {
  id: string;
  deskripsiDesa: string;
  visiDesa: string;
  misiDesa: string[];
  sejarahDesa: string;
  deskripsiKelompok: string;
  visiKelompok: string;
  misiKelompok: string[];
}

