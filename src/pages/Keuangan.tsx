import React, { useState, useEffect, useMemo } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Search,
  Calendar,
  Plus,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Keuangan as KeuanganType, Agenda } from "../types";
import { KeuanganDetailModal } from "../components/KeuanganDetailModal";
import { CalendarModal } from "../components/CalendarModal";
import { DownloadMenu } from "../components/DownloadMenu";
import { FinanceChart } from "../components/FinanceChart";
import { api } from "../api";
import { useAuth } from "../contexts/AuthContext";

export function Keuangan() {
  const { user } = useAuth();
  const isKetua = (user?.jabatan === "Ketua" && user?.divisi === "Inti") || user?.jabatan === "Super Admin";
  const canEditBendahara =
    isKetua || (user?.jabatan === "Bendahara" && user?.divisi === "Inti");

  const [data, setData] = useState<KeuanganType[]>([]);
  const [agendaData, setAgendaData] = useState<Agenda[]>([]);
  const [selectedItem, setSelectedItem] = useState<KeuanganType | null>(null);

  const [activeTab, setActiveTab] = useState<"umum" | "rab">("umum");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDateNum, setSelectedDateNum] = useState<number>(0);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [expandedRabIds, setExpandedRabIds] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      api.get<KeuanganType[]>("keuangan"),
      api.get<Agenda[]>("agenda"),
    ])
      .then(([keuanganRes, agendaRes]) => {
        setData(keuanganRes);
        setAgendaData(agendaRes);
      })
      .catch((err) => console.error(err));
  }, []);

  const { pemasukan, pengeluaran, saldo } = useMemo(() => {
    let pemasukan = 0;
    let pengeluaran = 0;
    data.forEach((item) => {
      if (item.jenis === "Pemasukan") pemasukan += item.jumlah;
      if (item.jenis === "Pengeluaran") pengeluaran += item.jumlah;
    });
    return { pemasukan, pengeluaran, saldo: pemasukan - pengeluaran };
  }, [data]);

  const uniqueKategoris = useMemo(() => {
    const set = new Set<string>();
    data.forEach((item) => {
      if (item.kategori) set.add(item.kategori);
    });
    return Array.from(set);
  }, [data]);

  const uniqueSumbers = useMemo(() => {
    const set = new Set<string>();
    data.forEach((item) => {
      if (item.sumber) set.add(item.sumber);
    });
    return Array.from(set);
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        item.kategori.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.keterangan || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      let matchDate = true;
      if (selectedDateNum > 0) {
        const dateStr = `2026-07-${selectedDateNum < 10 ? "0" + selectedDateNum : selectedDateNum}`;
        matchDate = item.tanggal === dateStr;
      }

      return matchSearch && matchDate;
    });
  }, [data, searchQuery, selectedDateNum]);

  const toggleRab = (id: string) => {
    setExpandedRabIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id],
    );
  };

  const rabGroups = useMemo(() => {
    return agendaData
      .filter((agenda) => {
        if (!agenda.kebutuhan || agenda.kebutuhan.length === 0) return false;
        const validKebutuhan = agenda.kebutuhan.filter(
          (k) => k.nominal && k.nominal > 0,
        );
        return validKebutuhan.length > 0;
      })
      .map((agenda) => {
        const items = agenda.kebutuhan!.filter(
          (k) => k.nominal && k.nominal > 0,
        );
        const total = items.reduce((sum, k) => sum + (k.nominal || 0), 0);
        return {
          id: agenda.id,
          tanggal: agenda.tanggal,
          judul: agenda.judul,
          total,
          items,
        };
      })
      .sort(
        (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime(),
      );
  }, [agendaData]);

  const filteredRabGroups = useMemo(() => {
    return rabGroups.filter((g) => {
      const matchSearch =
        g.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.items.some((item) =>
          item.barang.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      let matchDate = true;
      if (selectedDateNum > 0) {
        const dateStr = `2026-07-${selectedDateNum < 10 ? "0" + selectedDateNum : selectedDateNum}`;
        matchDate = g.tanggal === dateStr;
      }
      return matchSearch && matchDate;
    });
  }, [rabGroups, searchQuery, selectedDateNum]);

  const totalRab = useMemo(
    () => rabGroups.reduce((acc, curr) => acc + curr.total, 0),
    [rabGroups],
  );

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(num);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const downloadUmumData = useMemo(() => {
    // Calculate running balance from oldest to newest first
    const sortedData = [...data].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
    let currentSaldo = 0;
    const withSaldo = sortedData.map(item => {
      const isPemasukan = item.jenis === "Pemasukan";
      currentSaldo += isPemasukan ? item.jumlah : -item.jumlah;
      return {
        ...item,
        saldo: currentSaldo
      };
    });

    // Then reverse to get newest to oldest
    withSaldo.reverse();

    // Now filter according to searchQuery and selectedDateNum
    return withSaldo.filter(item => {
      const matchSearch =
        item.kategori.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.keterangan || "").toLowerCase().includes(searchQuery.toLowerCase());

      let matchDate = true;
      if (selectedDateNum > 0) {
        const dateStr = `2026-07-${selectedDateNum < 10 ? "0" + selectedDateNum : selectedDateNum}`;
        matchDate = item.tanggal === dateStr;
      }
      return matchSearch && matchDate;
    }).map((item) => ({
      tanggal: item.tanggal,
      jenis: item.jenis,
      sumber: item.sumber || "",
      kategori: item.kategori,
      keterangan: item.keterangan || "-",
      jumlah: item.jumlah,
      saldo: item.saldo,
    }));
  }, [data, searchQuery, selectedDateNum]);

  const umumColumns = [
    { header: "Tanggal", key: "tanggal" },
    { header: "Kategori", key: "kategori" },
    { header: "Keterangan", key: "keterangan" },
    { header: "Nominal", key: "jumlah" },
    { header: "Saldo", key: "saldo" },
  ];

  const downloadRabData = filteredRabGroups.flatMap((group) =>
    group.items.map((item) => ({
      tanggal: group.tanggal,
      judul: group.judul,
      jenis_kebutuhan: item.jenis,
      barang: item.barang,
      nominal: item.nominal,
    })),
  );

  const rabColumns = [
    { header: "Tanggal", key: "tanggal" },
    { header: "Agenda", key: "judul" },
    { header: "Jenis Kebutuhan", key: "jenis_kebutuhan" },
    { header: "Barang/Kebutuhan", key: "barang" },
    { header: "Nominal Estimasi (Rp)", key: "nominal" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 hidden md:block">
          Ringkasan Keuangan
        </h3>
        <div className="flex w-full md:w-fit bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("umum")}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "umum"
                ? "bg-white text-brand-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Umum
          </button>
          <button
            onClick={() => setActiveTab("rab")}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "rab"
                ? "bg-white text-brand-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            RAB
          </button>
        </div>
      </div>

      {activeTab === "umum" ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <div className="col-span-2 md:col-span-1 bg-white p-4 md:p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1 md:gap-2">
              <span className="text-slate-500 text-xs md:text-sm font-semibold">
                Total Saldo Kas
              </span>
              <span className="text-xl md:text-2xl font-bold text-slate-900">
                {formatRupiah(saldo)}
              </span>
            </div>
            <div className="col-span-1 bg-green-50 p-3 md:p-5 rounded-xl border border-green-100 shadow-sm flex flex-col gap-1.5 md:gap-2 justify-center">
              <span className="text-green-700 text-[10px] md:text-sm font-semibold flex items-center gap-1 md:gap-2 leading-tight">
                <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />{" "}
                <span className="truncate">Pemasukan</span>
              </span>
              <span className="text-sm md:text-2xl font-bold text-green-700 truncate">
                {formatRupiah(pemasukan)}
              </span>
            </div>
            <div className="col-span-1 bg-rose-50 p-3 md:p-5 rounded-xl border border-rose-100 shadow-sm flex flex-col gap-1.5 md:gap-2 justify-center">
              <span className="text-rose-700 text-[10px] md:text-sm font-semibold flex items-center gap-1 md:gap-2 leading-tight">
                <TrendingDown className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />{" "}
                <span className="truncate">Pengeluaran</span>
              </span>
              <span className="text-sm md:text-2xl font-bold text-rose-700 truncate">
                {formatRupiah(pengeluaran)}
              </span>
            </div>
          </div>
          <FinanceChart data={data} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-rose-50 p-5 rounded-xl border border-rose-100 shadow-sm flex flex-col gap-2">
            <span className="text-rose-700 text-sm font-semibold flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Estimasi RAB Keseluruhan
            </span>
            <span className="text-2xl font-bold text-rose-700">
              {formatRupiah(totalRab)}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 w-full">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-shadow shadow-sm"
              placeholder={
                activeTab === "umum"
                  ? "Cari transaksi..."
                  : "Cari kebutuhan RAB..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {activeTab === "umum" && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <DownloadMenu
                data={downloadUmumData}
                filename="Laporan_Keuangan_Umum"
                columns={umumColumns}
              />
              <button
                onClick={() => setIsCalendarOpen(true)}
                className="relative bg-white text-brand-600 hover:bg-brand-50 border border-slate-200 transition-colors p-3 rounded-xl cursor-pointer shadow-sm flex-shrink-0"
              >
                <Calendar className="w-5 h-5" />
                {selectedDateNum > 0 && (
                  <div className="absolute -top-1.5 -right-1.5 bg-brand-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-[1.5px] border-white shadow-sm">
                    {selectedDateNum}
                  </div>
                )}
              </button>
              {canEditBendahara && (
                <button
                  onClick={() => setIsAddingTransaction(true)}
                  className="p-3 bg-brand-600 text-white hover:bg-brand-700 transition-colors rounded-xl shadow-sm flex-shrink-0"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
          {activeTab === "rab" && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <DownloadMenu
                data={downloadRabData}
                filename="Laporan_Keuangan_RAB"
                columns={rabColumns}
              />
            </div>
          )}
        </div>

        {activeTab === "umum" ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-center w-12 md:w-24">
                      <span className="hidden md:inline">Jenis</span>
                    </th>
                    <th className="px-4 py-3 font-semibold w-auto max-w-[140px] md:max-w-none">
                      Kategori
                    </th>
                    <th className="px-4 py-3 font-semibold hidden md:table-cell">
                      Keterangan
                    </th>
                    <th className="px-4 py-3 font-semibold text-right">
                      Nominal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((item, index) => {
                    const isPemasukan = item.jenis === "Pemasukan";
                    return (
                      <motion.tr
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-brand-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 text-center align-middle">
                          {/* Mobile: Icon */}
                          <div
                            className={`md:hidden mx-auto inline-flex items-center justify-center w-8 h-8 rounded-full ${isPemasukan ? "text-green-700 bg-green-50" : "text-rose-700 bg-rose-50"}`}
                          >
                            {isPemasukan ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                          </div>
                          {/* Desktop: In / Out text + Icon */}
                          <div className="hidden md:block">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full ${
                                isPemasukan
                                  ? "bg-green-50 text-green-700 border border-green-100"
                                  : "bg-rose-50 text-rose-700 border border-rose-100"
                              }`}
                            >
                              {isPemasukan ? (
                                <TrendingUp className="w-3.5 h-3.5" />
                              ) : (
                                <TrendingDown className="w-3.5 h-3.5" />
                              )}
                              {isPemasukan ? "In" : "Out"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700 align-middle max-w-[140px] md:max-w-none">
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                              {item.sumber}
                            </span>
                            <span className="font-semibold text-slate-800 text-sm truncate">
                              {item.kategori}
                            </span>
                            {/* Keterangan in mobile only */}
                            {item.keterangan && (
                              <span className="md:hidden text-[11px] text-slate-500 font-medium mt-0.5 truncate block w-full whitespace-nowrap">
                                {item.keterangan}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-sm hidden md:table-cell align-middle whitespace-normal max-w-[200px] lg:max-w-[300px]">
                          {item.keterangan ? (
                            <span className="line-clamp-2">
                              {item.keterangan}
                            </span>
                          ) : (
                            <span className="text-slate-300 italic text-xs">
                              Tidak ada keterangan
                            </span>
                          )}
                        </td>
                        <td
                          className={`px-4 py-3 font-bold text-right align-middle ${isPemasukan ? "text-green-700" : "text-rose-700"}`}
                        >
                          {isPemasukan ? "+" : "-"}
                          {formatRupiah(item.jumlah)}
                        </td>
                      </motion.tr>
                    );
                  })}
                  {filteredData.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-slate-500"
                      >
                        Tidak ada data transaksi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredRabGroups.map((group, index) => {
              const isExpanded = expandedRabIds.includes(group.id);
              return (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
                >
                  <div
                    onClick={() => toggleRab(group.id)}
                    className="group relative p-4 md:p-5 flex flex-col gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex flex-col gap-1 pr-12">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {formatDate(group.tanggal)}
                      </span>
                      <h4 className="text-lg font-bold text-slate-900 leading-tight">
                        {group.judul}
                      </h4>
                    </div>
                    <div>
                      <span className="text-lg font-bold text-rose-600">
                        {formatRupiah(group.total)}
                      </span>
                    </div>
                    <div
                      className={`absolute top-4 right-4 md:top-5 md:right-5 p-2 rounded-full transition-all text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600 ${isExpanded ? "rotate-180 bg-slate-200 text-slate-600" : "bg-transparent"}`}
                    >
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-slate-100 bg-slate-50/50 p-4 md:p-5 flex flex-col gap-3">
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Detail Kebutuhan
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {group.items.map((item, i) => (
                              <div
                                key={i}
                                className="bg-white p-3.5 md:p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-0.5 items-start"
                              >
                                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                                  {item.jenis}
                                </span>
                                <span className="font-semibold text-slate-800 text-sm leading-tight">
                                  {item.barang}
                                </span>
                                <span className="font-bold text-slate-700 text-sm mt-1">
                                  {formatRupiah(item.nominal!)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
            {filteredRabGroups.length === 0 && (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center text-slate-500">
                Tidak ada data estimasi RAB.
              </div>
            )}
          </div>
        )}
      </div>

      <KeuanganDetailModal
        keuangan={selectedItem}
        isOpen={!!selectedItem || isAddingTransaction}
        isAdding={isAddingTransaction}
        optionsKategori={uniqueKategoris}
        optionsSumber={uniqueSumbers}
        readOnly={!canEditBendahara}
        onClose={() => {
          setSelectedItem(null);
          setIsAddingTransaction(false);
        }}
        onUpdate={(updated) => {
          setData((prev) => {
            const exists = prev.find((item) => item.id === updated.id);
            if (exists) {
              return prev.map((item) =>
                item.id === updated.id ? updated : item,
              );
            }
            return [...prev, updated];
          });
          setSelectedItem(updated);
        }}
      />

      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={selectedDateNum}
        onSelectDate={(d) => setSelectedDateNum(d === selectedDateNum ? 0 : d)}
      />
    </div>
  );
}
