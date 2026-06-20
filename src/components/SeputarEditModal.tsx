import React, { useState, useEffect, useRef } from "react";
import { X, Plus, Trash2, Save } from "lucide-react";
import { Seputar } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";
import { AutoResizeTextarea } from "./AutoResizeTextarea";

interface SeputarEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Seputar;
  onSave: (data: Seputar) => void;
}

export const SeputarEditModal: React.FC<SeputarEditModalProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<"desa" | "kelompok">("desa");
  const [formData, setFormData] = useState<Seputar>({
    ...data,
  });

  useEffect(() => {
    setFormData({
      ...data,
    });
  }, [data, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (
    field: "misiDesa" | "misiKelompok",
    index: number,
    value: string,
  ) => {
    setFormData((prev) => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field: "misiDesa" | "misiKelompok") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayItem = (
    field: "misiDesa" | "misiKelompok",
    index: number,
  ) => {
    setFormData((prev) => {
      const newArray = [...prev[field]];
      newArray.splice(index, 1);
      return { ...prev, [field]: newArray };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
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
            className="relative bg-white w-full md:w-full md:max-w-4xl md:mx-4 md:my-8 rounded-t-[2rem] md:rounded-2xl shadow-xl pointer-events-auto flex flex-col will-change-transform max-h-[75dvh] overflow-hidden"
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
            <div className="px-6 pb-4 md:py-4 border-b border-slate-100 flex-shrink-0 flex flex-col gap-4">
              <div className="flex items-center justify-between w-full">
                <h2 className="text-lg font-bold text-slate-800">
                  Edit Profil & Seputar Kami
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors hidden md:block"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab("desa")}
                  className={`py-2 px-4 text-sm font-medium rounded-lg transition-all ${
                    activeTab === "desa"
                      ? "bg-white text-brand-600 shadow-[0_2px_8px_rgb(0,0,0,0.04)]"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  }`}
                >
                  Desa Kertasari
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("kelompok")}
                  className={`py-2 px-4 text-sm font-medium rounded-lg transition-all ${
                    activeTab === "kelompok"
                      ? "bg-white text-brand-600 shadow-[0_2px_8px_rgb(0,0,0,0.04)]"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  }`}
                >
                  Kelompok
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto overflow-x-hidden flex-1 custom-scrollbar">
              <form
                id="seputar-form"
                onSubmit={handleSubmit}
                className="space-y-8"
              >
                {/* Bagian Desa */}
                {activeTab === "desa" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Deskripsi Desa
                      </label>
                      <AutoResizeTextarea
                        name="deskripsiDesa"
                        value={formData.deskripsiDesa}
                        onChange={handleChange}
                        className="w-full text-sm rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Visi Desa
                      </label>
                      <AutoResizeTextarea
                        name="visiDesa"
                        value={formData.visiDesa}
                        onChange={handleChange}
                        className="w-full text-sm rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Misi Desa
                        </label>
                        <button
                          type="button"
                          onClick={() => addArrayItem("misiDesa")}
                          className="text-xs font-semibold text-brand-600 flex items-center gap-1 hover:text-brand-700"
                        >
                          <Plus className="w-3 h-3" /> Tambah Misi
                        </button>
                      </div>
                      <div className="space-y-2">
                        {formData.misiDesa.map((misi, index) => (
                          <div key={index} className="flex gap-2">
                            <AutoResizeTextarea
                              value={misi}
                              onChange={(e) =>
                                handleArrayChange(
                                  "misiDesa",
                                  index,
                                  e.target.value,
                                )
                              }
                              className="flex-1 text-sm rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => removeArrayItem("misiDesa", index)}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg self-start"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Sejarah Desa
                      </label>
                      <AutoResizeTextarea
                        name="sejarahDesa"
                        value={formData.sejarahDesa}
                        onChange={handleChange}
                        className="w-full text-sm rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Bagian Kelompok */}
                {activeTab === "kelompok" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Deskripsi Kelompok
                      </label>
                      <AutoResizeTextarea
                        name="deskripsiKelompok"
                        value={formData.deskripsiKelompok}
                        onChange={handleChange}
                        className="w-full text-sm rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Visi Kelompok
                      </label>
                      <AutoResizeTextarea
                        name="visiKelompok"
                        value={formData.visiKelompok}
                        onChange={handleChange}
                        className="w-full text-sm rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Misi Kelompok
                        </label>
                        <button
                          type="button"
                          onClick={() => addArrayItem("misiKelompok")}
                          className="text-xs font-semibold text-brand-600 flex items-center gap-1 hover:text-brand-700"
                        >
                          <Plus className="w-3 h-3" /> Tambah Misi
                        </button>
                      </div>
                      <div className="space-y-2">
                        {formData.misiKelompok.map((misi, index) => (
                          <div key={index} className="flex gap-2">
                            <AutoResizeTextarea
                              value={misi}
                              onChange={(e) =>
                                handleArrayChange(
                                  "misiKelompok",
                                  index,
                                  e.target.value,
                                )
                              }
                              className="flex-1 text-sm rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                              required
                            />
                            <button
                              type="button"
                              onClick={() =>
                                removeArrayItem("misiKelompok", index)
                              }
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg self-start"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex-shrink-0">
              <div className="grid grid-cols-2 gap-4 w-full">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-center w-full"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="seputar-form"
                  className="py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 w-full"
                >
                  Simpan
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
