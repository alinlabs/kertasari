-- Seed Keuangan
INSERT OR REPLACE INTO keuangan (id, tanggal, jenis, kategori, sumber, jumlah, keterangan) VALUES
('1', '2026-07-01', 'Pemasukan', 'Iuran Kelompok', 'Pendapatan', 1500000, 'Iuran minggu pertama dari seluruh anggota'),
('2', '2026-07-03', 'Pengeluaran', 'Konsumsi', 'Bendahara', 350000, 'Belanja bahan makanan posko minggu I'),
('3', '2026-07-05', 'Pengeluaran', 'Transportasi', 'Bendahara', 50000, 'Bensin untuk observasi dusun'),
('4', '2026-07-10', 'Pemasukan', 'Sponsor', 'Hibah Desa', 500000, 'Bantuan dari desa untuk program kerja');
