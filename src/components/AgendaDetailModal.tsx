import React, { useEffect, useState } from "react";
import { Agenda, AgendaStatus, Keanggotaan, Proker } from "../types";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  Clock,
  CalendarDays,
  User,
  CheckCircle2,
  CircleDashed,
  XCircle,
  FileText,
  Target,
  Users,
  Pencil,
  Trash2,
  Plus,
  X,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../api";
import { Combobox } from "./Combobox";
import { Select } from "./Select";
import { CalendarModal } from "./CalendarModal";
import { AutoResizeTextarea } from "./AutoResizeTextarea";

interface Props {
  agenda: Agenda | null;
  onClose: () => void;
  isNew?: boolean;
  onUpdate?: (updated: Agenda) => void;
  readOnly?: boolean;
}

const statusConfig: Record<
  AgendaStatus,
  { color: string; bg: string; icon: React.ElementType }
> = {
  Selesai: {
    color: "text-green-700",
    bg: "bg-green-50",
    icon: CheckCircle2,
  },
  Rencana: { color: "text-brand-700", bg: "bg-brand-50", icon: CircleDashed },
  Terlewat: { color: "text-slate-700", bg: "bg-slate-100", icon: CalendarDays },
  "": { color: "text-slate-500", bg: "bg-slate-50", icon: CircleDashed },
};

export function AgendaDetailModal({
  agenda,
  onClose,
  isNew = false,
  onUpdate,
  readOnly,
}: Props) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"jadwal" | "detail" | "kebutuhan">(
    "jadwal",
  );
  const [isEditing, setIsEditing] = useState(isNew);
  const [editForm, setEditForm] = useState<Partial<Agenda>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [keanggotaanList, setKeanggotaanList] = useState<Keanggotaan[]>([]);
  const [prokerList, setProkerList] = useState<Proker[]>([]);

  useEffect(() => {
    // Fetch data for combobox
    api
      .get<Keanggotaan[]>("keanggotaan")
      .then(setKeanggotaanList)
      .catch(console.error);
    api.get<Proker[]>("proker").then(setProkerList).catch(console.error);
  }, []);

  useEffect(() => {
    if (agenda) {
      document.body.style.overflow = "hidden";
      setActiveTab("jadwal");
      setIsEditing(isNew);
      setEditForm({
        ...agenda,
        kebutuhan: agenda.kebutuhan ? [...agenda.kebutuhan] : [],
        detailKegiatan: agenda.detailKegiatan ? [...agenda.detailKegiatan] : [],
        output: agenda.output ? [...agenda.output] : [],
        anggota: agenda.anggota ? [...agenda.anggota] : [],
      });
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [agenda, isNew]);

  const getDayFromTanggal = (t?: string) => {
    if (!t) return 0;
    const d = new Date(t);
    // Juli 2026
    if (d.getFullYear() === 2026 && d.getMonth() === 6) {
      return d.getDate();
    }
    return 0;
  };

  const getAnggotaName = (id: string) => {
    const found = keanggotaanList.find((a) => a.id === id);
    return found ? found.nama : id;
  };

  const getProkerJudul = (id: string) => {
    const found = prokerList.find((p) => p.id === id);
    return found ? found.judul : id;
  };

  const currentSelectedDate = getDayFromTanggal(editForm.tanggal);

  const handleSelectDate = (d: number) => {
    const newDate = `2026-07-${d.toString().padStart(2, "0")}`;
    setEditForm({ ...editForm, tanggal: newDate });
    setIsCalendarOpen(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let savedAgenda: Agenda;
      if (isNew) {
        const newId = `ag-${Date.now()}`;
        const dataToSave = {
          ...editForm,
          id: newId,
          status: "",
        } as Agenda;
        await api.post("agenda", dataToSave);
        savedAgenda = dataToSave;
      } else {
        const dataToSave = { 
          ...editForm,
          status: editForm.status === "Selesai" ? "Selesai" : ""
        } as Agenda;
        await api.put("agenda", agenda!.id, dataToSave);
        savedAgenda = dataToSave;
      }
      if (onUpdate) onUpdate(savedAgenda);
      setIsEditing(false);
      if (isNew) onClose();
    } catch (error) {
      console.error("Failed to save agenda", error);
      alert("Gagal menyimpan agenda.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parseInt(parts[2], 10)} Juli 2026`;
    }
    return dateStr;
  };

  if (typeof document === "undefined") return null;

  const totalKebutuhan =
    agenda?.kebutuhan?.reduce((sum, item) => sum + (item.nominal || 0), 0) || 0;

  return createPortal(
    <>
      <AnimatePresence>
        {agenda && (
          <div className="fixed inset-0 z-[9999] pointer-events-none flex flex-col justify-end md:justify-center items-center p-0 md:p-6 text-left">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto transition-opacity"
            />

            {/* Modal / Bottom Sheet */}
            <motion.div
              initial={{ y: "100%", opacity: 1 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 1 }}
              transition={{ type: "tween", ease: "easeOut", duration: 0.25 }}
              className="relative bg-white w-full md:w-full md:max-w-2xl md:mx-4 md:my-8 rounded-t-[2rem] md:rounded-2xl shadow-xl pointer-events-auto flex flex-col will-change-transform max-h-[75dvh] overflow-hidden"
            >
              {/* Drag handle for mobile */}
              <div
                className="w-full flex justify-center py-4 md:hidden"
                onClick={onClose}
                style={{ cursor: "grab" }}
              >
                <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
              </div>

              {/* Header */}
              <div className="px-6 py-4 md:pt-6 flex items-start justify-between gap-4">
                <div className="flex flex-col gap-2 pr-4">
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">
                    {isEditing ? (
                      isNew ? (
                        "Tambah Agenda Baru"
                      ) : (
                        "Edit Agenda"
                      )
                    ) : (
                      <>
                        {agenda.judul.includes(" ")
                          ? `${agenda.judul.split(" ").slice(0, -1).join(" ")} `
                          : ""}
                        <span className="whitespace-nowrap">
                          {agenda.judul.includes(" ")
                            ? agenda.judul.split(" ").slice(-1)[0]
                            : agenda.judul}
                          {agenda.status === "Selesai" && (
                            <CheckCircle2 className="w-5 h-5 text-white fill-emerald-600 rounded-full inline-block ml-2 mb-0.5 align-middle" />
                          )}
                        </span>
                      </>
                    )}
                  </h3>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!isEditing && !readOnly && (
                    <>
                      <button
                        onClick={() => {
                          /* Handle delete context */ onClose();
                        }}
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
                    </>
                  )}
                </div>
              </div>

              {/* Tabs Navigation */}
              {!isEditing && (
                <div className="flex border-b border-slate-100 px-6 w-full">
                  <button
                    onClick={() => setActiveTab("jadwal")}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "jadwal" ? "border-brand-600 text-brand-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                  >
                    Jadwal
                  </button>
                  <button
                    onClick={() => setActiveTab("detail")}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "detail" ? "border-brand-600 text-brand-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                  >
                    Detail
                  </button>
                  <button
                    onClick={() => setActiveTab("kebutuhan")}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "kebutuhan" ? "border-brand-600 text-brand-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                  >
                    Kebutuhan
                  </button>
                </div>
              )}

              {/* Content */}
              <div className="p-6 overflow-y-auto">
                {isEditing ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-700">
                        Judul Agenda
                      </label>
                      <input
                        type="text"
                        value={editForm.judul || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, judul: e.target.value })
                        }
                        className="border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5 relative z-10">
                        <label className="text-sm font-semibold text-slate-700">
                          Tanggal
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsCalendarOpen(true)}
                          className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-brand-500 bg-white text-left flex justify-between items-center"
                        >
                          <span
                            className={
                              editForm.tanggal
                                ? "text-slate-900"
                                : "text-slate-400"
                            }
                          >
                            {editForm.tanggal
                              ? new Date(editForm.tanggal).toLocaleDateString(
                                  "id-ID",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  },
                                )
                              : "Pilih Tanggal"}
                          </span>
                          <CalendarDays className="w-5 h-5 text-slate-400" />
                        </button>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">
                          Waktu
                        </label>
                        <input
                          type="text"
                          value={editForm.waktu || ""}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, "");
                            if (val.length > 4) val = val.substring(0, 4);
                            if (val.length >= 3) {
                              val =
                                val.substring(0, 2) + ":" + val.substring(2);
                            }
                            setEditForm({ ...editForm, waktu: val });
                          }}
                          placeholder="Contoh: 08:00"
                          className="border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">
                          Lokasi
                        </label>
                        <input
                          type="text"
                          value={editForm.lokasi || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, lokasi: e.target.value })
                          }
                          className="border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-brand-500"
                        />
                      </div>

                      <Combobox
                        label="Penanggung Jawab (PJ)"
                        placeholder="Pilih Penanggung Jawab..."
                        items={keanggotaanList}
                        value={editForm.pic || ""}
                        onChange={(val) =>
                          setEditForm({ ...editForm, pic: val })
                        }
                        getItemLabel={(item) => item.nama}
                        getItemValue={(item) => item.id}
                      />
                    </div>

                    {/* Anggota Bertugas Poin-Poin */}
                    <div className="flex flex-col gap-1.5 mt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-slate-700">
                          Anggota Bertugas
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setEditForm((prev) => ({
                              ...prev,
                              anggota: [...(prev.anggota || []), ""],
                            }))
                          }
                          className="text-xs font-bold text-brand-600 flex items-center gap-1 hover:text-brand-700"
                        >
                          <Plus className="w-3.5 h-3.5" /> Tambah
                        </button>
                      </div>
                      {(!editForm.anggota || editForm.anggota.length === 0) && (
                        <div className="text-xs text-slate-400 italic">
                          Belum ada anggota bertugas.
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                        {editForm.anggota?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 relative"
                          >
                            <div className="flex-1">
                              <Combobox
                                label=""
                                placeholder="Pilih Anggota..."
                                items={keanggotaanList}
                                value={item || ""}
                                onChange={(val) => {
                                  const newArr = [...editForm.anggota!];
                                  newArr[idx] = val;
                                  setEditForm({ ...editForm, anggota: newArr });
                                }}
                                getItemLabel={(it) => it.nama}
                                getItemValue={(it) => it.id}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newArr = [...editForm.anggota!];
                                newArr.splice(idx, 1);
                                setEditForm({ ...editForm, anggota: newArr });
                              }}
                              className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Combobox
                      label="Program Kerja Terkait"
                      placeholder="Pilih Program Kerja..."
                      items={prokerList}
                      value={editForm.terkaitProker || ""}
                      onChange={(val) =>
                        setEditForm({ ...editForm, terkaitProker: val })
                      }
                      getItemLabel={(item) => item.judul}
                      getItemValue={(item) => item.id}
                    />

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-700">
                        Deskripsi
                      </label>
                      <AutoResizeTextarea
                        value={editForm.deskripsi || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            deskripsi: e.target.value,
                          })
                        }
                        className="border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-brand-500 min-h-[80px]"
                      />
                    </div>

                    {/* Detail Kegiatan Poin-Poin */}
                    <div className="flex flex-col gap-1.5 mt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-slate-700">
                          Detail Kegiatan
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setEditForm((prev) => ({
                              ...prev,
                              detailKegiatan: [
                                ...(prev.detailKegiatan || []),
                                "",
                              ],
                            }))
                          }
                          className="text-xs font-bold text-brand-600 flex items-center gap-1 hover:text-brand-700"
                        >
                          <Plus className="w-3.5 h-3.5" /> Tambah
                        </button>
                      </div>
                      {(!editForm.detailKegiatan ||
                        editForm.detailKegiatan.length === 0) && (
                        <div className="text-xs text-slate-400 italic">
                          Belum ada poin detail kegiatan.
                        </div>
                      )}
                      {editForm.detailKegiatan?.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const newArr = [...editForm.detailKegiatan!];
                              newArr[idx] = e.target.value;
                              setEditForm({
                                ...editForm,
                                detailKegiatan: newArr,
                              });
                            }}
                            placeholder="Masukkan detail kegiatan..."
                            className="border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-brand-500 flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newArr = [...editForm.detailKegiatan!];
                              newArr.splice(idx, 1);
                              setEditForm({
                                ...editForm,
                                detailKegiatan: newArr,
                              });
                            }}
                            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Output Kegiatan Poin-Poin */}
                    <div className="flex flex-col gap-1.5 mt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-slate-700">
                          Output Kegiatan
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setEditForm((prev) => ({
                              ...prev,
                              output: [...(prev.output || []), ""],
                            }))
                          }
                          className="text-xs font-bold text-brand-600 flex items-center gap-1 hover:text-brand-700"
                        >
                          <Plus className="w-3.5 h-3.5" /> Tambah
                        </button>
                      </div>
                      {(!editForm.output || editForm.output.length === 0) && (
                        <div className="text-xs text-slate-400 italic">
                          Belum ada output kegiatan.
                        </div>
                      )}
                      {editForm.output?.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const newArr = [...editForm.output!];
                              newArr[idx] = e.target.value;
                              setEditForm({ ...editForm, output: newArr });
                            }}
                            placeholder="Masukkan output kegiatan..."
                            className="border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-brand-500 flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newArr = [...editForm.output!];
                              newArr.splice(idx, 1);
                              setEditForm({ ...editForm, output: newArr });
                            }}
                            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Kebutuhan */}
                    <div className="flex flex-col gap-1.5 mt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-slate-700">
                          Kebutuhan Logistik/Alat
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setEditForm((prev) => ({
                              ...prev,
                              kebutuhan: [
                                ...(prev.kebutuhan || []),
                                { barang: "", jenis: "Beli", nominal: 0 },
                              ],
                            }))
                          }
                          className="text-xs font-bold text-brand-600 flex items-center gap-1 hover:text-brand-700"
                        >
                          <Plus className="w-3.5 h-3.5" /> Tambah
                        </button>
                      </div>
                      {(!editForm.kebutuhan ||
                        editForm.kebutuhan.length === 0) && (
                        <div className="text-xs text-slate-400 italic">
                          Belum ada data kebutuhan.
                        </div>
                      )}
                      {editForm.kebutuhan?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 relative pr-10 sm:pr-2"
                        >
                          <input
                            type="text"
                            value={item.barang}
                            onChange={(e) => {
                              const newArr = [...editForm.kebutuhan!];
                              newArr[idx] = { ...item, barang: e.target.value };
                              setEditForm({ ...editForm, kebutuhan: newArr });
                            }}
                            placeholder="Nama barang..."
                            className="w-full sm:flex-1 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-brand-500 bg-white"
                          />
                          <div className="flex gap-2 w-full sm:w-auto">
                            <Select
                              value={item.jenis}
                              onChange={(val) => {
                                const newArr = [...editForm.kebutuhan!];
                                newArr[idx] = { ...item, jenis: val as any };
                                setEditForm({ ...editForm, kebutuhan: newArr });
                              }}
                              options={[
                                { label: "Beli", value: "Beli" },
                                { label: "Sewa", value: "Sewa" },
                                { label: "Pinjam", value: "Pinjam" },
                              ]}
                              className="w-[120px]"
                            />
                            {item.jenis === "Beli" || item.jenis === "Sewa" ? (
                              <input
                                type="text"
                                value={
                                  item.nominal
                                    ? item.nominal
                                        .toString()
                                        .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                                    : ""
                                }
                                onChange={(e) => {
                                  const rawValue = e.target.value.replace(
                                    /\./g,
                                    "",
                                  );
                                  const numValue = parseInt(rawValue, 10);
                                  const newArr = [...editForm.kebutuhan!];
                                  newArr[idx] = {
                                    ...item,
                                    nominal: isNaN(numValue) ? 0 : numValue,
                                  };
                                  setEditForm({
                                    ...editForm,
                                    kebutuhan: newArr,
                                  });
                                }}
                                placeholder="Nominal (Rp)"
                                className="w-[120px] flex-1 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-brand-500 bg-white"
                              />
                            ) : (
                              <div className="w-[120px] flex-1"></div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newArr = [...editForm.kebutuhan!];
                              newArr.splice(idx, 1);
                              setEditForm({ ...editForm, kebutuhan: newArr });
                            }}
                            className="absolute top-2.5 right-2.5 sm:static p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {activeTab === "jadwal" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex items-start gap-4">
                          <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
                            <CalendarDays className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                              Tanggal
                            </p>
                            <p className="text-sm font-semibold text-slate-800">
                              {formatDate(agenda.tanggal)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                              Waktu
                            </p>
                            <p className="text-sm font-semibold text-slate-800">
                              {agenda.waktu}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                              Lokasi
                            </p>
                            <p className="text-sm font-semibold text-slate-800">
                              {agenda.lokasi}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                              Penanggung Jawab (PJ)
                            </p>
                            <p className="text-sm font-semibold text-slate-800">
                              {agenda.pic
                                ? getAnggotaName(agenda.pic)
                                : "Belum ditentukan"}
                            </p>
                          </div>
                        </div>

                        {agenda.terkaitProker && (
                          <div className="flex items-start gap-4">
                            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                              <Target className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                Terkait Program Kerja
                              </p>
                              <p className="text-sm font-semibold text-slate-800">
                                {getProkerJudul(agenda.terkaitProker)}
                              </p>
                            </div>
                          </div>
                        )}

                        {agenda.anggota && agenda.anggota.length > 0 && (
                          <div className="flex flex-col col-span-1 md:col-span-2 mt-2 md:mt-0">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                              Anggota Bertugas
                            </p>
                            <ul className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {agenda.anggota.map((member, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-center gap-2 text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2"
                                >
                                  <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                  <span className="truncate">
                                    {getAnggotaName(member)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "detail" && (
                      <div className="flex flex-col gap-6">
                        {agenda.deskripsi && (
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                              Deskripsi
                            </p>
                            <p className="text-sm text-slate-700 leading-relaxed">
                              {agenda.deskripsi}
                            </p>
                          </div>
                        )}

                        {agenda.detailKegiatan &&
                          agenda.detailKegiatan.length > 0 && (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Detail Kegiatan
                              </p>
                              <ul className="text-sm text-slate-700 leading-relaxed list-disc pl-5 flex flex-col gap-1.5">
                                {agenda.detailKegiatan.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                        {agenda.output && agenda.output.length > 0 && (
                          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">
                              Output Kegiatan
                            </p>
                            <ul className="text-sm text-emerald-800 leading-relaxed flex flex-col gap-2">
                              {agenda.output.map((item, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-white fill-green-600 shrink-0 mt-0.5" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {!agenda.deskripsi &&
                          (!agenda.detailKegiatan ||
                            agenda.detailKegiatan.length === 0) &&
                          (!agenda.output || agenda.output.length === 0) && (
                            <div className="py-8 text-center text-slate-500 text-sm">
                              Tidak ada detail tercatat.
                            </div>
                          )}
                      </div>
                    )}

                    {activeTab === "kebutuhan" && (
                      <div>
                        {agenda.kebutuhan && agenda.kebutuhan.length > 0 ? (
                          <div className="bg-[#F7FAFD] p-4 rounded-xl border border-slate-200">
                            <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-3">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Daftar Kebutuhan
                              </p>
                              <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Total Nominal
                                </p>
                                <p className="text-sm font-bold text-brand-600 mt-0.5">
                                  {new Intl.NumberFormat("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                    maximumFractionDigits: 0,
                                  }).format(totalKebutuhan)}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-3">
                              {agenda.kebutuhan.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex flex-col bg-white p-3.5 rounded-lg border border-slate-100 shadow-sm gap-1"
                                >
                                  <span
                                    className={`text-[10px] uppercase font-bold tracking-wide w-fit ${item.jenis === "Beli" ? "text-brand-600" : item.jenis === "Sewa" ? "text-rose-600" : "text-slate-500"}`}
                                  >
                                    {item.jenis}
                                  </span>
                                  <span className="text-[15px] font-bold text-slate-800 leading-tight">
                                    {item.barang}
                                  </span>
                                  {(item.jenis === "Beli" ||
                                    item.jenis === "Sewa") &&
                                    item.nominal !== undefined && (
                                      <div className="text-[15px] font-bold text-slate-600 mt-1">
                                        {new Intl.NumberFormat("id-ID", {
                                          style: "currency",
                                          currency: "IDR",
                                          maximumFractionDigits: 0,
                                        }).format(item.nominal)}
                                      </div>
                                    )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="py-8 text-center text-slate-500 text-sm">
                            Tidak ada kebutuhan logistik/alat tercatat.
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {isEditing && (
                <div className="p-5 md:p-6 border-t border-slate-100 bg-white flex items-center gap-3 mt-auto">
                  <button
                    onClick={() => setIsEditing(false)}
                    type="button"
                    className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSave}
                    type="button"
                    disabled={isSaving}
                    className="flex-1 bg-brand-600 text-white rounded-xl py-3 font-bold hover:bg-brand-700 transition flex justify-center items-center gap-2"
                  >
                    {isSaving ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              )}

              {!isEditing && !readOnly && (
                <div className="p-5 md:p-6 border-t border-slate-100 bg-slate-50">
                  {agenda.status === "Selesai" ? (
                    <button
                      onClick={async () => {
                        setIsSaving(true);
                        try {
                          await api.put("agenda", agenda.id, { ...agenda, status: "" });
                          if (onUpdate) onUpdate({ ...agenda, status: "" });
                          onClose();
                        } catch (e) {
                          console.error(e);
                        }
                        setIsSaving(false);
                      }}
                      disabled={isSaving}
                      className="w-full py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors"
                    >
                      Batal Selesai
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        setIsSaving(true);
                        try {
                          await api.put("agenda", agenda.id, { ...agenda, status: "Selesai" });
                          if (onUpdate) onUpdate({ ...agenda, status: "Selesai" });
                          onClose();
                        } catch (e) {
                          console.error(e);
                        }
                        setIsSaving(false);
                      }}
                      disabled={isSaving}
                      className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                    >
                      Tandai Selesai
                    </button>
                  )}
                </div>
              )}
              {!isEditing && readOnly && (
                <div className="p-5 md:p-6 border-t border-slate-100 bg-slate-50">
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              )}
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
