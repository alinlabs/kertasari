import React, { useEffect, useState } from "react";
import { Proker } from "../types";
import { motion, AnimatePresence } from "motion/react";
import {
  Target,
  Clock,
  CheckCircle2,
  Pencil,
  Trash2,
  Plus,
  X,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../api";
import { AutoResizeTextarea } from "./AutoResizeTextarea";

interface Props {
  proker: Proker | null;
  onClose: () => void;
  isNew?: boolean;
  onUpdate?: (updated: Proker) => void;
  readOnly?: boolean;
}

export function ProkerDetailModal({
  proker,
  onClose,
  isNew = false,
  onUpdate,
  readOnly,
}: Props) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(isNew);
  const [editForm, setEditForm] = useState<Partial<Proker>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (proker) {
      document.body.style.overflow = "hidden";
      setIsEditing(isNew);
      setEditForm(proker);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [proker, isNew]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let savedProker: Proker;
      if (isNew) {
        const newId = `proker-${Date.now()}`;
        const dataToSave = { ...editForm, id: newId } as Proker;
        await api.post("proker", dataToSave);
        savedProker = dataToSave;
      } else {
        const dataToSave = { ...editForm } as Proker;
        await api.put("proker", proker!.id, dataToSave);
        savedProker = dataToSave;
      }
      if (onUpdate) onUpdate(savedProker);
      setIsEditing(false);
      if (isNew) onClose();
    } catch (error) {
      console.error("Failed to save proker", error);
      alert("Gagal menyimpan program kerja.");
    } finally {
      setIsSaving(false);
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {proker && (
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
            <div className="px-6 py-4 md:pt-6 border-b border-slate-100 flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2 pr-4">
                <h3 className="text-xl font-bold text-slate-900 leading-tight">
                  {isEditing ? (
                    isNew ? (
                      "Tambah Program Kerja"
                    ) : (
                      "Edit Program Kerja"
                    )
                  ) : (
                    <span className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-brand-600 shrink-0" />
                      {proker.judul}
                    </span>
                  )}
                </h3>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!isEditing && !readOnly && (
                  <>
                    <button
                      onClick={() => {
                        onClose();
                      }}
                      className="p-2 bg-slate-50 text-slate-500 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                      }}
                      className="p-2 bg-slate-50 text-slate-500 rounded-full hover:bg-slate-100 hover:text-brand-600 transition-colors"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {isEditing ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">
                      Judul Program Kerja
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
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">
                      Deskripsi
                    </label>
                    <AutoResizeTextarea
                      value={editForm.deskripsi || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, deskripsi: e.target.value })
                      }
                      className="border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-brand-500 min-h-[80px]"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-700">
                        Target Sasaran
                      </label>
                      <input
                        type="text"
                        value={editForm.targetSasaran || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            targetSasaran: e.target.value,
                          })
                        }
                        className="border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  {/* Manfaat Program */}
                  <div className="flex flex-col gap-1.5 mt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-700">
                        Manfaat Program
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setEditForm((prev) => ({
                            ...prev,
                            manfaat: [...(prev.manfaat || []), ""],
                          }))
                        }
                        className="text-xs font-bold text-brand-600 flex items-center gap-1 hover:text-brand-700"
                      >
                        <Plus className="w-3.5 h-3.5" /> Tambah
                      </button>
                    </div>
                    {!editForm.manfaat || editForm.manfaat.length === 0 ? (
                      <div className="flex items-start gap-2">
                        <input
                          type="text"
                          value={""}
                          onChange={(e) => {
                            setEditForm({
                              ...editForm,
                              manfaat: [e.target.value],
                            });
                          }}
                          placeholder="Masukkan manfaat program..."
                          className="flex-1 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    ) : (
                      editForm.manfaat.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const newArr = [...editForm.manfaat!];
                              newArr[idx] = e.target.value;
                              setEditForm({ ...editForm, manfaat: newArr });
                            }}
                            placeholder="Masukkan manfaat program..."
                            className="flex-1 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-brand-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newArr = [...editForm.manfaat!];
                              newArr.splice(idx, 1);
                              setEditForm({ ...editForm, manfaat: newArr });
                            }}
                            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {proker.deskripsi && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Deskripsi Program Kerja
                      </p>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {proker.deskripsi}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-5 mb-6">
                    {proker.targetSasaran && (
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl shrink-0">
                          <Target className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                            Target Sasaran
                          </p>
                          <p className="text-sm font-semibold text-slate-800">
                            {proker.targetSasaran}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {proker.manfaat && proker.manfaat.length > 0 && (
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 mb-6">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">
                        Manfaat Program
                      </p>
                      <ul className="text-sm text-emerald-800 leading-relaxed flex flex-col gap-2">
                        {proker.manfaat.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-white fill-green-600 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>

            <div
              className={`p-5 md:p-6 border-t border-slate-100 mt-auto ${isEditing ? "bg-white" : "bg-slate-50"}`}
            >
              {isEditing ? (
                <div className="flex items-center gap-3 w-full">
                  <button
                    onClick={() => {
                      if (isNew) onClose();
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
                    {isSaving ? "Menyimpan..." : "Simpan"}
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
    </AnimatePresence>,
    document.body,
  );
}
