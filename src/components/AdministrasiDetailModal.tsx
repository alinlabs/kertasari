import React, { useEffect, useState } from "react";
import { Administrasi } from "../types";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  Calendar,
  ArrowRight,
  ExternalLink,
  Pencil,
  Trash2,
} from "lucide-react";
import { createPortal } from "react-dom";
import { Select } from "./Select";
import { CalendarModal } from "./CalendarModal";
import { AutoResizeTextarea } from "./AutoResizeTextarea";

interface Props {
  administrasi: Administrasi | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onSave: (admin: Administrasi) => Promise<void>;
  isNew?: boolean;
  readOnly?: boolean;
}

export function AdministrasiDetailModal({
  administrasi,
  onClose,
  onDelete,
  onSave,
  isNew = false,
  readOnly,
}: Props) {
  const [isEditing, setIsEditing] = useState(isNew);
  const [editForm, setEditForm] = useState<Partial<Administrasi>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    if (administrasi) {
      document.body.style.overflow = "hidden";
      setIsEditing(isNew);
      setEditForm(administrasi);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [administrasi, isNew]);

  if (!administrasi) return null;

  const getDayFromTanggal = (t?: string) => {
    if (!t) return 0;
    const d = new Date(t);
    // Juli 2026
    if (d.getFullYear() === 2026 && d.getMonth() === 6) {
      return d.getDate();
    }
    return 0;
  };

  const currentSelectedDate = getDayFromTanggal(editForm.tanggal);

  const handleSelectDate = (d: number) => {
    const newDate = `2026-07-${d.toString().padStart(2, "0")}`;
    setEditForm({ ...editForm, tanggal: newDate });
    setIsCalendarOpen(false);
  };

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

  const handleSave = async () => {
    if (
      !editForm.tanggal ||
      !editForm.jenis ||
      !editForm.perihal ||
      !editForm.tujuan
    ) {
      alert("Harap isi minimal Tanggal, Jenis, Perihal, dan Tujuan.");
      return;
    }
    setIsSaving(true);
    try {
      await onSave({
        ...administrasi,
        ...editForm,
      } as Administrasi);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (confirm("Apakah Anda yakin ingin menghapus arsip administrasi ini?")) {
      onDelete(administrasi.id);
      onClose();
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-[9999] pointer-events-none flex flex-col justify-end md:justify-center items-center p-0 md:p-6 text-left">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto transition-opacity"
          />

          {/* Modal body */}
          <motion.div
            initial={{ y: "100%", opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 1 }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.25 }}
            className="relative bg-white w-full md:w-full md:max-w-xl md:mx-4 md:my-8 rounded-t-[2rem] md:rounded-2xl shadow-xl pointer-events-auto flex flex-col will-change-transform max-h-[75dvh] overflow-hidden"
          >
            {/* Mobile Handle */}
            <div
              className="w-full flex justify-center py-4 md:hidden"
              onClick={onClose}
              style={{ cursor: "grab" }}
            >
              <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
            </div>

            {/* Header */}
            <div className="px-6 py-4 md:pt-6 border-b border-slate-100 flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1 pr-4">
                <h3 className="text-xl font-bold text-slate-900 leading-tight">
                  {isEditing
                    ? isNew
                      ? "Tambah Administrasi Baru"
                      : "Edit Administrasi"
                    : "Detail Administrasi"}
                </h3>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!isEditing && !readOnly && (
                  <>
                    <button
                      onClick={handleDelete}
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

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto">
              {isEditing ? (
                /* 编辑/新增表单 (Edit/New Form) */
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 relative z-10">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Tanggal
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCalendarOpen(true)}
                        className="border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-500 font-medium bg-slate-50 text-left flex justify-between items-center"
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
                        <Calendar className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>
                    <div className="flex flex-col gap-1.5 z-10">
                      <Select
                        label="Jenis Dokumen"
                        value={editForm.jenis || "Surat Keluar"}
                        onChange={(val) =>
                          setEditForm({ ...editForm, jenis: val as any })
                        }
                        options={[
                          { label: "Surat Masuk", value: "Surat Masuk" },
                          { label: "Surat Keluar", value: "Surat Keluar" },
                          { label: "Proposal", value: "Proposal" },
                          { label: "Laporan", value: "Laporan" },
                        ]}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Tujuan / Asal
                    </label>
                    <input
                      type="text"
                      value={editForm.tujuan || ""}
                      placeholder="Contoh: Kepala Desa Kertasari"
                      onChange={(e) =>
                        setEditForm({ ...editForm, tujuan: e.target.value })
                      }
                      className="border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-500 font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Perihal
                    </label>
                    <input
                      type="text"
                      value={editForm.perihal || ""}
                      placeholder="Perihal / Judul Surat / Proposal..."
                      onChange={(e) =>
                        setEditForm({ ...editForm, perihal: e.target.value })
                      }
                      className="border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-500 font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Deskripsi
                    </label>
                    <AutoResizeTextarea
                      value={editForm.deskripsi || ""}
                      placeholder="Jelaskan secara ringkas perihal atau isi administrasi ini..."
                      onChange={(e) =>
                        setEditForm({ ...editForm, deskripsi: e.target.value })
                      }
                      className="border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-500 font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Link Dokumen (Drive, Docs, Sheets, PDF)
                    </label>
                    <input
                      type="url"
                      value={editForm.dokumen || ""}
                      placeholder="https://docs.google.com/... atau https://drive.google.com/..."
                      onChange={(e) =>
                        setEditForm({ ...editForm, dokumen: e.target.value })
                      }
                      className="border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-500 font-medium"
                    />
                  </div>
                </div>
              ) : (
                /* 普通展示模式 (Normal View Mode) */
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-1">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                          Jenis
                        </p>
                        <p className="text-sm font-semibold text-slate-800">
                          {administrasi.jenis}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                          Tanggal
                        </p>
                        <p className="text-sm font-semibold text-slate-800">
                          {formatDate(administrasi.tanggal)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                          Tujuan / Asal
                        </p>
                        <p className="text-sm font-semibold text-slate-800">
                          {administrasi.tujuan}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Perihal
                    </p>
                    <p className="text-sm font-semibold leading-relaxed text-slate-800">
                      {administrasi.perihal || "-"}
                    </p>
                  </div>

                  {administrasi.deskripsi && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Deskripsi
                      </p>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {administrasi.deskripsi}
                      </p>
                    </div>
                  )}

                  {administrasi.dokumen && (
                    <div className="mt-4 bg-slate-50 border border-slate-100 rounded-xl p-3 inline-block">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Dokumen Lampiran
                      </p>
                      <a
                        href={administrasi.dokumen}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2 text-slate-700 hover:text-brand-600 transition-colors max-w-full"
                      >
                        <svg
                          viewBox="0 0 87.3 78"
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 flex-shrink-0"
                        >
                          <path
                            d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z"
                            fill="#0066da"
                          />
                          <path
                            d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z"
                            fill="#00ac47"
                          />
                          <path
                            d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z"
                            fill="#ea4335"
                          />
                          <path
                            d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z"
                            fill="#00832d"
                          />
                          <path
                            d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z"
                            fill="#2684fc"
                          />
                          <path
                            d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z"
                            fill="#ffba00"
                          />
                        </svg>
                        <span className="text-sm font-semibold truncate hover:underline flex-1">
                          {administrasi.dokumen}
                        </span>
                        <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer controls */}
            <div
              className={`p-5 md:p-6 border-t border-slate-100 ${isEditing ? "bg-white" : "bg-slate-50"} flex items-center gap-3 mt-auto`}
            >
              {isEditing ? (
                <div className="flex items-center gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      if (isNew) {
                        onClose();
                      } else {
                        setIsEditing(false);
                      }
                    }}
                    className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors"
                >
                  Tutup
                </button>
              )}
            </div>
          </motion.div>
        </div>
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
