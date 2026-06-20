import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Briefcase, Info, Phone, Mail, FileText } from "lucide-react";
import { createPortal } from "react-dom";
import { Combobox } from "./Combobox";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: any;
  optionsJabatan?: string[];
  optionsDivisi?: string[];
}

export function TambahAnggotaModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  optionsJabatan = [
    "Ketua",
    "Wakil Ketua",
    "Sekretaris",
    "Bendahara",
    "Koordinator",
    "Anggota",
  ],
  optionsDivisi = [
    "Inti",
    "Acara",
    "Humas",
    "Konsumsi",
    "Publikasi",
    "Dokumentasi",
    "Logistik",
    "Peralatan",
  ],
}: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    jabatan: "",
    divisi: "",
    nim: "",
    telepon: "",
    email: "",
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (initialData) {
        let initialTelp = initialData.telepon || "";
        let cleaned = initialTelp.replace(/\D/g, "");
        if (cleaned.startsWith("62")) cleaned = cleaned.substring(2);
        else if (cleaned.startsWith("0")) cleaned = cleaned.substring(1);
        const match = cleaned.match(/^(\d{0,3})(\d{0,4})(\d{0,4})(\d{0,4})/);
        const formattedTelp = match
          ? match.slice(1).filter(Boolean).join("-")
          : cleaned;

        setFormData({
          nama: initialData.nama || "",
          jabatan: initialData.jabatan || "",
          divisi: initialData.divisi || "",
          nim: initialData.nim || "",
          telepon: formattedTelp,
          email: initialData.email || "",
        });
      } else {
        setFormData({
          nama: "",
          jabatan: "",
          divisi: "",
          nim: "",
          telepon: "",
          email: "",
        });
      }
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        telepon: formData.telepon
          ? "+62" + formData.telepon.replace(/\D/g, "")
          : "",
      };
      await onSave(payload);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
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

            <div className="px-6 py-4 md:pt-6 border-b border-slate-100 flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1 pr-4">
                <h3 className="text-xl font-bold text-slate-900 leading-tight">
                  {initialData ? "Edit Anggota" : "Tambah Anggota Baru"}
                </h3>
                <p className="text-sm text-slate-500">
                  Masukkan informasi lengkap anggota kelompok.
                </p>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              <form
                id="add-member-form"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-all"
                      placeholder="Contoh: Budi Santoso"
                      value={formData.nama}
                      onChange={(e) =>
                        setFormData({ ...formData, nama: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Combobox
                      label="Jabatan"
                      items={optionsJabatan}
                      value={formData.jabatan}
                      onChange={(val) =>
                        setFormData({ ...formData, jabatan: val })
                      }
                      placeholder="Contoh: Ketua"
                      getItemLabel={(item) => item}
                      allowCustomValue={true}
                    />
                  </div>
                  <div>
                    <Combobox
                      label="Divisi"
                      items={optionsDivisi}
                      value={formData.divisi}
                      onChange={(val) =>
                        setFormData({ ...formData, divisi: val })
                      }
                      placeholder="Contoh: Acara"
                      getItemLabel={(item) => item}
                      allowCustomValue={true}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      NIM
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <FileText className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="tel"
                        required
                        className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-all"
                        placeholder="Masukkan NIM"
                        value={formData.nim}
                        onChange={(e) =>
                          setFormData({ ...formData, nim: e.target.value.replace(/\D/g, "") })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      No. Telepon
                    </label>
                    <div className="relative flex rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 transition-all">
                      <div className="flex items-center justify-center pl-3 pr-2 bg-slate-100 border-r border-slate-200">
                        <Phone className="h-4 w-4 text-slate-400 mr-1.5" />
                        <span className="text-sm font-medium text-slate-600">
                          +62
                        </span>
                      </div>
                      <input
                        type="tel"
                        required
                        className="block w-full px-3 py-2.5 bg-transparent focus:outline-none sm:text-sm"
                        placeholder="812-3456-7890"
                        value={formData.telepon}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          if (val.startsWith("62")) val = val.substring(2);
                          else if (val.startsWith("0")) val = val.substring(1);
                          const match = val.match(
                            /^(\d{0,3})(\d{0,4})(\d{0,4})(\d{0,4})/,
                          );
                          const formatted = match
                            ? match.slice(1).filter(Boolean).join("-")
                            : val;
                          setFormData({ ...formData, telepon: formatted });
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="email"
                        required
                        className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-all"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-5 md:p-6 border-t border-slate-100 bg-white flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                form="add-member-form"
                disabled={isSaving}
                className="flex-1 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isSaving ? "Menyimpan..." : "Simpan Anggota"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
