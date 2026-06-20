DROP TABLE IF EXISTS administrasi;
CREATE TABLE administrasi (
    id TEXT PRIMARY KEY,
    tanggal TEXT,
    jenis TEXT,
    perihal TEXT,
    tujuan TEXT,
    deskripsi TEXT,
    dokumen TEXT
);

DROP TABLE IF EXISTS agenda;
CREATE TABLE agenda (
    id TEXT PRIMARY KEY,
    tanggal TEXT,
    waktu TEXT,
    judul TEXT,
    lokasi TEXT,
    deskripsi TEXT,
    pic TEXT, -- Disimpan sebagai ID keanggotaan
    anggota TEXT, -- Disimpan sebagai JSON string array of ID keanggotaan
    detail_kegiatan TEXT, -- Disimpan sebagai JSON string
    output TEXT, -- Disimpan sebagai JSON string
    kebutuhan TEXT, -- Disimpan sebagai JSON string
    terkait_proker TEXT, -- Disimpan sebagai ID proker
    status TEXT
);

DROP TABLE IF EXISTS keanggotaan;
CREATE TABLE keanggotaan (
    id TEXT PRIMARY KEY,
    nama TEXT,
    jabatan TEXT,
    divisi TEXT,
    telepon TEXT,
    email TEXT,
    nim TEXT
);

DROP TABLE IF EXISTS kehadiran;
CREATE TABLE kehadiran (
    id TEXT PRIMARY KEY,
    tanggal TEXT,
    anggota_id TEXT,
    status TEXT,
    keterangan TEXT
);

DROP TABLE IF EXISTS keuangan;
CREATE TABLE keuangan (
    id TEXT PRIMARY KEY,
    tanggal TEXT,
    jenis TEXT,
    kategori TEXT,
    sumber TEXT,
    jumlah INTEGER,
    keterangan TEXT
);

DROP TABLE IF EXISTS proker;
CREATE TABLE proker (
    id TEXT PRIMARY KEY,
    judul TEXT,
    deskripsi TEXT,
    manfaat TEXT, -- Disimpan sebagai JSON string
    target_sasaran TEXT
);

DROP TABLE IF EXISTS seputar;
CREATE TABLE seputar (
    id TEXT PRIMARY KEY,
    deskripsi_desa TEXT,
    visi_desa TEXT,
    misi_desa TEXT,
    sejarah_desa TEXT,
    deskripsi_kelompok TEXT,
    visi_kelompok TEXT,
    misi_kelompok TEXT
);
