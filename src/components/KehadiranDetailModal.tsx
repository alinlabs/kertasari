import React, { useEffect, useState } from "react";
import { Keanggotaan, Kehadiran } from "../types";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Info,
  Calendar,
  Pencil,
  Trash2,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useAuth } from "../contexts/AuthContext";

interface Props {
  anggota: Keanggotaan | null;
  kehadiranStats: {
    Hadir: number;
    Izin: number;
    Sakit: number;
    Pulang: number;
  } | null;
  onClose: () => void;
  onEdit?: () => void;
  readOnly?: boolean;
}

export function KehadiranDetailModal({
  anggota,
  kehadiranStats,
  onClose,
  onEdit,
  readOnly,
}: Props) {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (anggota) {
      document.body.style.overflow = "hidden";
      setIsScrolled(false);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [anggota]);

  if (typeof document === "undefined") return null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 80);
  };

  return createPortal(
    <AnimatePresence>
      {anggota && (
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
            className="relative bg-white w-full md:w-full md:max-w-2xl md:mx-4 md:my-8 rounded-t-[2rem] md:rounded-2xl shadow-xl pointer-events-auto flex flex-col will-change-transform max-h-[75dvh] overflow-hidden"
          >
            {/* Sticky Header */}
            <div
              className={`absolute top-0 left-0 right-0 z-20 transition-all duration-300 ${isScrolled ? "bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm" : "bg-transparent"}`}
            >
              <div className="flex items-center justify-between px-6 py-4">
                <div
                  className={`flex flex-col transition-opacity duration-300 ${isScrolled ? "opacity-100" : "opacity-0"}`}
                >
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {anggota.nama}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {anggota.jabatan} • {anggota.divisi}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!readOnly && (
                    <>
                      <button
                        onClick={() => {
                          onClose();
                        }}
                        className={`p-2 rounded-full transition-colors ${isScrolled ? "hover:bg-rose-50 text-slate-400 hover:text-rose-600" : "bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-600"}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          onClose();
                          onEdit?.();
                        }}
                        className={`p-2 rounded-full transition-colors ${isScrolled ? "hover:bg-slate-100 text-slate-400 hover:text-brand-600" : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-brand-600"}`}
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div
              className="overflow-y-auto flex-1 pb-6"
              onScroll={handleScroll}
            >
              <div
                className="w-full flex justify-center py-4 md:hidden"
                onClick={onClose}
                style={{ cursor: "grab" }}
              >
                <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
              </div>

              <div className="pt-8 pb-6 px-6 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm">
                  <User className="w-12 h-12" />
                </div>
                <span className="text-sm font-medium text-brand-600 mb-1">
                  {anggota.jabatan} - {anggota.divisi}
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">
                  {anggota.nama}
                </h3>

                <div className="text-sm mb-6">
                  <span className="font-semibold text-slate-500 mr-2">
                    NIM:
                  </span>
                  <span className="text-slate-800 font-bold">
                    {anggota.nim || "-"}
                  </span>
                </div>

                <div className="flex flex-col gap-2 w-full max-w-sm mx-auto items-center text-center border-t border-slate-100 pt-6">
                  <div className="flex items-center gap-4 justify-center w-full">
                    {anggota.email && (
                      <a
                        href={`mailto:${anggota.email}`}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition-colors flex-1 border border-slate-100"
                      >
                        <Mail className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Email
                        </span>
                      </a>
                    )}
                    {anggota.telepon && (
                      <>
                        <a
                          href={`tel:${anggota.telepon}`}
                          className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors flex-1 border border-slate-100"
                        >
                          <Phone className="w-5 h-5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            Telpon
                          </span>
                        </a>
                        <a
                          href={`https://wa.me/${anggota.telepon.replace(/^0/, "62")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 text-slate-600 hover:bg-green-50 hover:text-green-600 transition-colors flex-1 border border-slate-100"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            WhatsApp
                          </span>
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6">
                {kehadiranStats && (
                  <div className="mt-8 text-center w-full max-w-sm mx-auto">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                      Status Kehadiran
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border border-slate-200">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mb-1" />
                        <span className="text-xl font-bold text-slate-800">
                          {kehadiranStats.Hadir}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          Hadir
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border border-slate-200">
                        <Clock className="w-5 h-5 text-amber-600 mb-1" />
                        <span className="text-xl font-bold text-slate-800">
                          {kehadiranStats.Izin}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          Izin
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border border-slate-200">
                        <AlertCircle className="w-5 h-5 text-rose-600 mb-1" />
                        <span className="text-xl font-bold text-slate-800">
                          {kehadiranStats.Sakit}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          Sakit
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border border-slate-200">
                        <XCircle className="w-5 h-5 text-slate-600 mb-1" />
                        <span className="text-xl font-bold text-slate-800">
                          {kehadiranStats.Pulang}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          Pulang/Alpa
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 md:p-6 border-t border-slate-100 bg-slate-50 mt-auto">
              <button
                onClick={onClose}
                className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
