import React, { useState, useEffect, useMemo } from "react";
import { FileText, Plus, Search, Calendar, Inbox } from "lucide-react";
import { motion } from "motion/react";
import { Administrasi as AdministrasiType } from "../types";
import { AdministrasiDetailModal } from "../components/AdministrasiDetailModal";
import { DownloadMenu } from "../components/DownloadMenu";
import { api } from "../api";
import { useAuth } from "../contexts/AuthContext";

export function Administrasi() {
  const { user } = useAuth();
  const isKetua = (user?.jabatan === "Ketua" && user?.divisi === "Inti") || user?.jabatan === "Super Admin";
  const canEditSekretaris =
    isKetua || (user?.jabatan === "Sekretaris" && user?.divisi === "Inti");
  const [data, setData] = useState<AdministrasiType[]>([]);
  const [selectedItem, setSelectedItem] = useState<AdministrasiType | null>(
    null,
  );
  const [isNew, setIsNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    api
      .get<AdministrasiType[]>("administrasi")
      .then((d) => setData(d))
      .catch((err) => console.error("Error fetching adminsitrasi:", err));
  }, []);

  // Filter based on search query
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const query = searchQuery.toLowerCase();
      return (
        item.perihal.toLowerCase().includes(query) ||
        item.tujuan.toLowerCase().includes(query) ||
        item.jenis.toLowerCase().includes(query) ||
        (item.deskripsi && item.deskripsi.toLowerCase().includes(query)) ||
        item.tanggal.toLowerCase().includes(query)
      );
    });
  }, [data, searchQuery]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  // Create empty object for fresh record
  const handleAddNew = () => {
    const freshRecord: AdministrasiType = {
      id: `admin-${Date.now()}`,
      tanggal: new Date().toISOString().split("T")[0],
      jenis: "Surat Keluar",
      perihal: "",
      tujuan: "",
      deskripsi: "",
      dokumen: "",
    };
    setIsNew(true);
    setSelectedItem(freshRecord);
  };

  // Save (Create or Update)
  const handleSave = async (savedItem: AdministrasiType) => {
    try {
      if (isNew) {
        await api.post("administrasi", savedItem);
        setData((prev) => [savedItem, ...prev]);
      } else {
        await api.put("administrasi", savedItem.id, savedItem);
        setData((prev) =>
          prev.map((item) => (item.id === savedItem.id ? savedItem : item)),
        );
      }
      setSelectedItem(null);
      setIsNew(false);
    } catch (error) {
      console.error("Failed to save administrasi", error);
      alert("Gagal menyimpa data administrasi");
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    try {
      await api.delete("administrasi", id);
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to delete administrasi", error);
      alert("Gagal menghapus data administrasi");
    }
  };

  const downloadAdminData = filteredData.map((item) => ({
    tanggal: formatDate(item.tanggal),
    jenis: item.jenis,
    perihal: item.perihal,
    tujuan: item.tujuan,
    deskripsi: item.deskripsi || "",
  }));

  const adminColumns = [
    { header: "Tanggal", key: "tanggal" },
    { header: "Jenis Dokumen", key: "jenis" },
    { header: "Perihal", key: "perihal" },
    { header: "Tujuan/Asal", key: "tujuan" },
    { header: "Deskripsi", key: "deskripsi" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Control row with Searchbar and Add button */}
      <div className="flex items-center gap-3 w-full">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari perihal, asal/tujuan, jenis..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl shadow-sm text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 placeholder:text-slate-400 transition-all font-medium"
          />
        </div>

        {/* Add Button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <DownloadMenu
            data={downloadAdminData}
            filename="Laporan_Administrasi"
            columns={adminColumns}
          />
          {canEditSekretaris && (
            <button
              onClick={handleAddNew}
              title="Tambah Arsip"
              className="flex-shrink-0 p-2.5 bg-brand-600 text-white rounded-xl shadow-sm hover:bg-brand-700 transition-all active:scale-[0.98] flex items-center justify-center"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Table container card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-600">
              <tr>
                <th className="px-4 py-3.5 font-semibold">Tanggal</th>
                <th className="px-4 py-3.5 font-semibold">Jenis Dokumen</th>
                <th className="px-4 py-3.5 font-semibold">Perihal</th>
                <th className="px-4 py-3.5 font-semibold">Tujuan / Asal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item, index) => {
                return (
                  <motion.tr
                    key={item.id}
                    onClick={() => {
                      setIsNew(false);
                      setSelectedItem(item);
                    }}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-brand-50/70 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3.5 text-slate-500 font-medium">
                      {formatDate(item.tanggal)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-bold uppercase tracking-wide text-xs">
                      {item.jenis}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 max-w-xs truncate">
                      {item.perihal}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">
                      {item.tujuan}
                    </td>
                  </motion.tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Inbox className="w-8 h-8 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-500">
                        Tidak ada data administrasi ditemukan.
                      </p>
                      <p className="text-xs text-slate-400">
                        Gunakan kata kunci pencarian murni atau tambahkan arsip
                        baru.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Detail / edit Modal */}
      <AdministrasiDetailModal
        administrasi={selectedItem}
        onClose={() => {
          setSelectedItem(null);
          setIsNew(false);
        }}
        onSave={handleSave}
        onDelete={handleDelete}
        isNew={isNew}
        readOnly={!canEditSekretaris}
      />
    </div>
  );
}
