import React, { useEffect, useState } from "react";
import { Keuangan } from "../types";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Tag,
  Info,
  Trash2,
  Pencil,
  Plus,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../api";
import { Select } from "./Select";
import { CalendarModal } from "./CalendarModal";
import { Combobox } from "./Combobox";
import { AutoResizeTextarea } from "./AutoResizeTextarea";

interface Props {
  keuangan: Keuangan | null;
  isOpen: boolean;
  onClose: () => void;
  isAdding?: boolean;
  onUpdate?: (updated: Keuangan) => void;
  optionsKategori?: string[];
  optionsSumber?: string[];
  readOnly?: boolean;
}

export function KeuanganDetailModal({
  keuangan,
  isOpen,
  onClose,
  isAdding = false,
  onUpdate,
  optionsKategori = [],
  optionsSumber = [],
  readOnly,
}: Props) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Keuangan>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsEditing(isAdding);
      setFormData(
        keuangan || {
          jenis: "Pemasukan",
          jumlah: 0,
          tanggal: new Date().toISOString().split("T")[0],
          kategori: "",
          sumber: "",
          keterangan: "",
        },
      );
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, keuangan, isAdding]);

  const getDayFromTanggal = (t?: string) => {
    if (!t) return 0;
    const d = new Date(t);
    // Juli 2026
    if (d.getFullYear() === 2026 && d.getMonth() === 6) {
      return d.getDate();
    }
    return 0;
  };

  const currentSelectedDate = getDayFromTanggal(formData.tanggal);

  const handleSelectDate = (d: number) => {
    const newDate = `2026-07-${d.toString().padStart(2, "0")}`;
    setFormData({ ...formData, tanggal: newDate });
    setIsCalendarOpen(false);
  };

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let savedKeuangan: Keuangan;
      if (isAdding) {
        const newId = `keu-${Date.now()}`;
        const dataToSave = { ...formData, id: newId } as Keuangan;
        await api.post("keuangan", dataToSave);
        savedKeuangan = dataToSave;
      } else {
        const dataToSave = { ...formData } as Keuangan;
        await api.put("keuangan", keuangan!.id, dataToSave);
        savedKeuangan = dataToSave;
      }
      if (onUpdate) onUpdate(savedKeuangan);
      setIsEditing(false);
      if (isAdding) onClose();
    } catch (error) {
      console.error("Failed to save keuangan", error);
      alert("Gagal menyimpan transaksi keuangan.");
    } finally {
      setIsSaving(false);
    }
  };

  if (typeof document === "undefined") return null;

  const currentJenis = formData.jenis || keuangan?.jenis || "Pemasukan";

  return createPortal(
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] pointer-events-none flex flex-col justify-end md:justify-center items-center p-0 md:p-6 text-left">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto transition-opacity"
            />
            <motion.div
              initial={{ y: "100%", opacity: 1 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 1 }}
              transition={{ type: "tween", ease: "easeOut", duration: 0.25 }}
              className="relative bg-white w-full md:w-full md:max-w-xl md:mx-4 md:my-8 rounded-t-[2rem] md:rounded-2xl shadow-xl pointer-events-auto flex flex-col will-change-transform max-h-[75dvh] overflow-hidden"
            >
              <div
                className="w-full flex justify-center py-4 md:hidden"
                onClick={onClose}
                style={{ cursor: "grab" }}
              >
                <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
              </div>

              <div className="px-6 py-4 md:pt-6 border-b border-slate-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${currentJenis === "Pemasukan" ? "text-green-700 bg-green-50" : "text-rose-700 bg-rose-50"}`}
                  >
                    {isAdding ? (
                      <Plus className="w-5 h-5" />
                    ) : currentJenis === "Pemasukan" ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">
                    {isAdding
                      ? "Tambah Transaksi"
                      : isEditing
                        ? "Edit Transaksi"
                        : "Detail Transaksi"}
                  </h3>
                </div>

                {!isEditing && !readOnly && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={onClose}
                      className="p-2 bg-slate-50 text-slate-500 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 bg-slate-50 text-slate-500 rounded-full hover:bg-slate-100 hover:text-brand-600 transition-colors"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 overflow-y-auto">
                {!isEditing && keuangan ? (
                  <>
                    <div className="flex justify-center mb-6">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Nominal
                        </p>
                        <p
                          className={`text-3xl font-bold ${keuangan.jenis === "Pemasukan" ? "text-green-600" : "text-rose-600"}`}
                        >
                          {keuangan.jenis === "Pemasukan" ? "+" : "-"}
                          {formatRupiah(keuangan.jumlah)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                            Tanggal
                          </p>
                          <p className="text-sm font-semibold text-slate-800">
                            {formatDate(keuangan.tanggal)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
                          <Tag className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                            Kategori
                          </p>
                          <p className="text-sm font-semibold text-slate-800">
                            {keuangan.kategori}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 col-span-1 md:col-span-2">
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                          <Info className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                            Sumber
                          </p>
                          <p className="text-sm font-semibold text-slate-800">
                            {keuangan.sumber}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Keterangan
                      </p>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {keuangan.keterangan || "-"}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Select
                        label="Jenis Transaksi"
                        value={formData.jenis || "Pemasukan"}
                        onChange={(val) =>
                          setFormData({
                            ...formData,
                            jenis: val as "Pemasukan" | "Pengeluaran",
                          })
                        }
                        options={[
                          { label: "Pemasukan", value: "Pemasukan" },
                          { label: "Pengeluaran", value: "Pengeluaran" },
                        ]}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-slate-700">
                        Nominal
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                          Rp
                        </span>
                        <input
                          type="text"
                          value={
                            formData.jumlah
                              ? formData.jumlah
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                              : ""
                          }
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/\./g, "");
                            const numValue = parseInt(rawValue, 10);
                            setFormData({
                              ...formData,
                              jumlah: isNaN(numValue) ? 0 : numValue,
                            });
                          }}
                          className="w-full p-3 pl-10 rounded-xl border border-slate-200 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 relative z-10">
                      <label className="text-sm font-bold text-slate-700">
                        Tanggal
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCalendarOpen(true)}
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-500 bg-white text-left flex justify-between items-center"
                      >
                        <span
                          className={
                            formData.tanggal
                              ? "text-slate-900 font-medium"
                              : "text-slate-400"
                          }
                        >
                          {formData.tanggal
                            ? new Date(formData.tanggal).toLocaleDateString(
                                "id-ID",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )
                            : "Pilih Tanggal"}
                        </span>
                        <Calendar className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Combobox
                        label="Kategori"
                        placeholder="Contoh: Iuran Anggota"
                        items={optionsKategori}
                        value={formData.kategori || ""}
                        onChange={(val) =>
                          setFormData({ ...formData, kategori: val })
                        }
                        getItemLabel={(item) => item}
                        allowCustomValue={true}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Combobox
                        label="Sumber"
                        placeholder="Contoh: Kas Umum"
                        items={optionsSumber}
                        value={formData.sumber || ""}
                        onChange={(val) =>
                          setFormData({ ...formData, sumber: val })
                        }
                        getItemLabel={(item) => item}
                        allowCustomValue={true}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-slate-700">
                        Keterangan
                      </label>
                      <AutoResizeTextarea
                        value={formData.keterangan || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            keterangan: e.target.value,
                          })
                        }
                        placeholder="Tambahkan catatan jika perlu..."
                        className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 md:p-6 border-t border-slate-100 bg-white mt-auto">
                {isEditing ? (
                  <div className="flex items-center gap-3 w-full">
                    <button
                      onClick={() => {
                        if (isAdding) onClose();
                        else setIsEditing(false);
                      }}
                      type="button"
                      className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSave}
                      type="button"
                      disabled={isSaving}
                      className="flex-1 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSaving
                        ? "Menyimpan..."
                        : isAdding
                          ? "Tambah Transaksi"
                          : "Simpan Perubahan"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors"
                  >
                    Tutup
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={currentSelectedDate}
        onSelectDate={handleSelectDate}
      />
    </>,
    document.body,
  );
}
