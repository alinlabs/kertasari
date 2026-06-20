import React, { useState, useEffect } from "react";
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  Search,
  UserCircle,
  Plus,
} from "lucide-react";
import { motion } from "motion/react";
import { Kehadiran as KehadiranType, Keanggotaan } from "../types";
import { KehadiranDetailModal } from "../components/KehadiranDetailModal";
import { AbsensiDetailModal } from "../components/AbsensiDetailModal";
import { CalendarModal } from "../components/CalendarModal";
import { TambahAnggotaModal } from "../components/TambahAnggotaModal";
import { DownloadMenu } from "../components/DownloadMenu";
import { api } from "../api";
import { useAuth } from "../contexts/AuthContext";

const statusConfig: Record<string, { color: string; icon: React.ElementType }> =
  {
    Hadir: {
      color: "text-green-700 bg-green-100 border-green-200",
      icon: CheckCircle2,
    },
    Izin: {
      color: "text-amber-700 bg-amber-100 border-amber-200",
      icon: Clock,
    },
    Sakit: {
      color: "text-rose-700 bg-rose-100 border-rose-200",
      icon: AlertCircle,
    },
    Pulang: {
      color: "text-slate-700 bg-slate-100 border-slate-200",
      icon: XCircle,
    },
    Alpa: {
      color: "text-slate-700 bg-slate-100 border-slate-200",
      icon: XCircle,
    },
  };

export function Kehadiran() {
  const { user } = useAuth();
  const isKetua = (user?.jabatan === "Ketua" && user?.divisi === "Inti") || user?.jabatan === "Super Admin";
  const canEditSekretaris =
    isKetua || (user?.jabatan === "Sekretaris" && user?.divisi === "Inti");

  const [activeTab, setActiveTab] = useState<"keanggotaan" | "absensi">(
    "keanggotaan",
  );
  const [kehadiran, setKehadiran] = useState<KehadiranType[]>([]);
  const [anggotaMap, setAnggotaMap] = useState<Record<string, Keanggotaan>>({});
  const [anggotaList, setAnggotaList] = useState<Keanggotaan[]>([]);
  const [selectedDateNum, setSelectedDateNum] = useState<number>(19);
  const selectedDate = `2026-07-${selectedDateNum < 10 ? "0" + selectedDateNum : selectedDateNum}`;
  const [selectedAnggota, setSelectedAnggota] = useState<Keanggotaan | null>(
    null,
  );
  const [selectedAbsensi, setSelectedAbsensi] = useState<{
    member: Keanggotaan;
    absen: KehadiranType | null;
  } | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryAnggota, setSearchQueryAnggota] = useState("");
  const [isAddAnggotaOpen, setIsAddAnggotaOpen] = useState(false);
  const [editAnggotaData, setEditAnggotaData] = useState<Keanggotaan | null>(
    null,
  );

  const filteredAbsensiList = anggotaList.filter(
    (member) =>
      member.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.jabatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.divisi.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredAnggotaList = anggotaList.filter(
    (member) =>
      member.nama.toLowerCase().includes(searchQueryAnggota.toLowerCase()) ||
      member.jabatan.toLowerCase().includes(searchQueryAnggota.toLowerCase()) ||
      member.divisi.toLowerCase().includes(searchQueryAnggota.toLowerCase()),
  );

  useEffect(() => {
    Promise.all([
      api.get<Keanggotaan[]>("keanggotaan"),
      api.get<KehadiranType[]>("kehadiran"),
    ])
      .then(([anggotaData, kehadiranData]) => {
        setAnggotaList(anggotaData);
        const map = anggotaData.reduce(
          (acc: Record<string, Keanggotaan>, curr: Keanggotaan) => {
            acc[curr.id] = curr;
            return acc;
          },
          {},
        );
        setAnggotaMap(map);
        setKehadiran(kehadiranData);
      })
      .catch((err) => console.error(err));
  }, []);

  // Calculate stats per member
  const getStats = (memberId: string) => {
    const stats = { Hadir: 0, Izin: 0, Sakit: 0, Pulang: 0 };
    kehadiran.forEach((k) => {
      if (k.anggotaId === memberId) {
        if (k.status === "Hadir") stats.Hadir++;
        if (k.status === "Izin") stats.Izin++;
        if (k.status === "Sakit") stats.Sakit++;
        if (k.status === "Pulang" || k.status === "Alpa") stats.Pulang++;
      }
    });
    return stats;
  };

  const getAbsensiForDate = (memberId: string) => {
    return kehadiran.find(
      (k) => k.anggotaId === memberId && k.tanggal === selectedDate,
    );
  };

  const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    if (words.length === 1 && words[0].length > 0) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return "??";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const downloadAnggotaData = filteredAnggotaList.map((member) => {
    const stats = getStats(member.id);
    return {
      nama: member.nama,
      nim: member.nim,
      jabatan: member.jabatan,
      divisi: member.divisi,
      hadir: stats.Hadir,
      izin: stats.Izin,
      sakit: stats.Sakit,
      pulang: stats.Pulang,
    };
  });

  const anggotaColumns = [
    { header: "Nama", key: "nama" },
    { header: "Jabatan", key: "jabatan" },
    { header: "Divisi", key: "divisi" },
    { header: "Hadir", key: "hadir" },
    { header: "Izin", key: "izin" },
    { header: "Sakit", key: "sakit" },
    { header: "Pulang", key: "pulang" },
  ];

  const downloadAbsensiData = filteredAbsensiList.map((member) => {
    const absen = getAbsensiForDate(member.id);
    return {
      nama: member.nama,
      nim: member.nim,
      jabatan: member.jabatan,
      divisi: member.divisi,
      status: absen ? absen.status : "Belum Absen",
      keterangan: (absen && absen.keterangan) ? absen.keterangan : "-",
    };
  });

  const absensiColumns = [
    { header: "Nama", key: "nama" },
    { header: "Jabatan", key: "jabatan" },
    { header: "Divisi", key: "divisi" },
    { header: "Status", key: "status" },
    { header: "Keterangan", key: "keterangan" },
  ];

  const uniqueJabatans = Array.from(
    new Set(anggotaList.map((a) => a.jabatan).filter(Boolean)),
  );
  const uniqueDivisis = Array.from(
    new Set(anggotaList.map((a) => a.divisi).filter(Boolean)),
  );

  const allJabatans: string[] = Array.from(
    new Set([
      "Ketua",
      "Wakil Ketua",
      "Sekretaris",
      "Bendahara",
      "Koordinator",
      "Anggota",
      ...(uniqueJabatans as string[]),
    ]),
  );

  const allDivisis: string[] = Array.from(
    new Set([
      "Inti",
      "Acara",
      "Humas",
      "Konsumsi",
      "Publikasi",
      "Dokumentasi",
      "Logistik",
      "Peralatan",
      ...(uniqueDivisis as string[]),
    ]),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
        <div className="flex w-full sm:w-fit bg-slate-100 p-1 rounded-xl flex-shrink-0">
          <button
            onClick={() => setActiveTab("keanggotaan")}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "keanggotaan"
                ? "bg-white text-brand-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Keanggotaan
          </button>
          <button
            onClick={() => setActiveTab("absensi")}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "absensi"
                ? "bg-white text-brand-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Absensi
          </button>
        </div>

        {activeTab === "keanggotaan" && (
          <div className="flex items-center gap-3 w-full sm:flex-1">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-shadow shadow-sm"
                placeholder="Cari anggota..."
                value={searchQueryAnggota}
                onChange={(e) => setSearchQueryAnggota(e.target.value)}
              />
            </div>
            <DownloadMenu
              data={downloadAnggotaData}
              filename="Laporan_Keanggotaan"
              columns={anggotaColumns}
            />
            {canEditSekretaris && (
              <button
                onClick={() => {
                  setEditAnggotaData(null);
                  setIsAddAnggotaOpen(true);
                }}
                className="p-2.5 bg-brand-600 text-white hover:bg-brand-700 transition-colors rounded-xl shadow-sm flex-shrink-0"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {activeTab === "absensi" && (
          <div className="flex items-center gap-3 w-full sm:flex-1">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-shadow shadow-sm"
                placeholder="Cari anggota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DownloadMenu
              data={downloadAbsensiData}
              filename={`Laporan_Absensi_${selectedDateNum}`}
              columns={absensiColumns}
            />
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="relative bg-white text-brand-600 hover:bg-brand-50 border border-slate-200 transition-colors p-2.5 rounded-xl cursor-pointer shadow-sm flex-shrink-0"
            >
              <Calendar className="w-5 h-5" />
              <div className="absolute -top-1.5 -right-1.5 bg-brand-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-[1.5px] border-white shadow-sm">
                {selectedDateNum}
              </div>
            </button>
          </div>
        )}
      </div>

      {activeTab === "keanggotaan" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Nama</th>
                  <th className="px-4 py-3.5 font-semibold text-center">
                    Hadir
                  </th>
                  <th className="px-4 py-3.5 font-semibold text-center">
                    Izin
                  </th>
                  <th className="px-4 py-3.5 font-semibold text-center">
                    Sakit
                  </th>
                  <th className="px-4 py-3.5 font-semibold text-center">
                    Pulang
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAnggotaList.map((member, index) => {
                  const stats = getStats(member.id);
                  return (
                    <motion.tr
                      key={member.id}
                      onClick={() => setSelectedAnggota(member)}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-brand-50 cursor-pointer transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-600 border border-brand-500 shadow-sm flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {getInitials(member.nama)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-brand-600 leading-none mb-0.5">
                              {member.jabatan}
                            </span>
                            <span className="text-base font-bold text-slate-900 leading-tight">
                              {member.nama}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                              {member.divisi}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center text-slate-705 font-semibold text-slate-700 align-middle">
                        {stats.Hadir}
                      </td>
                      <td className="px-4 py-3.5 text-center text-slate-705 font-semibold text-slate-700 align-middle">
                        {stats.Izin}
                      </td>
                      <td className="px-4 py-3.5 text-center text-slate-705 font-semibold text-slate-700 align-middle">
                        {stats.Sakit}
                      </td>
                      <td className="px-4 py-3.5 text-center text-slate-705 font-semibold text-slate-700 align-middle">
                        {stats.Pulang}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "absensi" && (
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-600">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Nama</th>
                    <th className="px-4 py-3.5 font-semibold text-right">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAbsensiList.map((member, index) => {
                    const absen = getAbsensiForDate(member.id);
                    const StatusIcon = absen
                      ? statusConfig[absen.status]?.icon || CheckCircle2
                      : null;
                    return (
                      <motion.tr
                        key={member.id}
                        onClick={() =>
                          setSelectedAbsensi({ member, absen: absen || null })
                        }
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-brand-50 cursor-pointer transition-colors group"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-600 border border-brand-500 shadow-sm flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {getInitials(member.nama)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-brand-600 leading-none mb-0.5">
                                {member.jabatan}
                              </span>
                              <span className="text-base font-bold text-slate-900 leading-tight">
                                {member.nama}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                                {member.divisi}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right align-middle">
                          {absen ? (
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border ${statusConfig[absen.status]?.color || "bg-slate-100 text-slate-600"}`}
                            >
                              <StatusIcon className="w-3.5 h-3.5" />
                              {absen.status}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-xs font-medium">
                              Belum Absen
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedAnggota && (
        <KehadiranDetailModal
          anggota={selectedAnggota}
          kehadiranStats={getStats(selectedAnggota.id)}
          onClose={() => setSelectedAnggota(null)}
          onEdit={() => {
            setEditAnggotaData(selectedAnggota);
            setIsAddAnggotaOpen(true);
            setSelectedAnggota(null);
          }}
          readOnly={!canEditSekretaris}
        />
      )}

      {selectedAbsensi && (
        <AbsensiDetailModal
          anggota={selectedAbsensi.member}
          absen={selectedAbsensi.absen}
          tanggal={selectedDate}
          onClose={() => setSelectedAbsensi(null)}
          readOnly={!canEditSekretaris}
          onUpdate={async (updates) => {
            const memberId = selectedAbsensi.member.id;
            const existingAbsen = selectedAbsensi.absen;
            try {
              if (existingAbsen) {
                const updated = {
                  ...existingAbsen,
                  ...updates,
                } as KehadiranType;
                await api.put("kehadiran", existingAbsen.id, updated);
                setKehadiran((prev) =>
                  prev.map((k) => (k.id === existingAbsen.id ? updated : k)),
                );
                setSelectedAbsensi({ ...selectedAbsensi, absen: updated });
              } else {
                const newAbsen = {
                  id: `hadir-${Date.now()}`,
                  tanggal: selectedDate,
                  anggotaId: memberId,
                  status: updates.status || "Hadir",
                  keterangan: updates.keterangan || "",
                } as KehadiranType;
                await api.post("kehadiran", newAbsen);
                setKehadiran((prev) => [...prev, newAbsen]);
                setSelectedAbsensi({ ...selectedAbsensi, absen: newAbsen });
              }
            } catch (err) {
              console.error("Failed to update absen", err);
              alert("Gagal memperbarui status kehadiran");
            }
          }}
        />
      )}

      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={selectedDateNum}
        onSelectDate={setSelectedDateNum}
      />

      <TambahAnggotaModal
        isOpen={isAddAnggotaOpen}
        initialData={editAnggotaData}
        optionsJabatan={allJabatans}
        optionsDivisi={allDivisis}
        onClose={() => setIsAddAnggotaOpen(false)}
        onSave={async (newAnggota) => {
          try {
            if (editAnggotaData) {
              const updatedData = { ...editAnggotaData, ...newAnggota };
              await api.put("keanggotaan", editAnggotaData.id, updatedData);
              setAnggotaList((prev) =>
                prev.map((a) =>
                  a.id === editAnggotaData.id ? updatedData : a,
                ),
              );
            } else {
              const freshData = {
                ...newAnggota,
                id: `anggota-${Date.now()}`,
              } as Keanggotaan;
              await api.post("keanggotaan", freshData);
              setAnggotaList((prev) => [...prev, freshData]);
            }
          } catch (e) {
            console.error("Failed to save angotta", e);
            alert("Gagal menyimpan anggota.");
          } finally {
            setEditAnggotaData(null);
          }
        }}
      />
    </div>
  );
}
