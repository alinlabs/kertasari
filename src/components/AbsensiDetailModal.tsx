import React, { useEffect, useState } from "react";
import { Keanggotaan, Kehadiran } from "../types";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  FileText,
} from "lucide-react";
import { createPortal } from "react-dom";
import { AutoResizeTextarea } from "./AutoResizeTextarea";

const statusConfig: Record<
  string,
  { color: string; bg: string; icon: React.ElementType }
> = {
  Hadir: { color: "text-green-700", bg: "bg-green-50", icon: CheckCircle2 },
  Izin: { color: "text-amber-700", bg: "bg-amber-50", icon: Clock },
  Sakit: { color: "text-rose-700", bg: "bg-rose-50", icon: AlertCircle },
  Pulang: { color: "text-slate-700", bg: "bg-slate-50", icon: XCircle },
  Alpa: { color: "text-slate-700", bg: "bg-slate-50", icon: XCircle },
};

interface Props {
  anggota: Keanggotaan | null;
  absen: Kehadiran | null;
  tanggal: string;
  onClose: () => void;
  onUpdate?: (updates: { status?: string; keterangan?: string }) => void;
  readOnly?: boolean;
}

export function AbsensiDetailModal({
  anggota,
  absen,
  tanggal,
  onClose,
  onUpdate,
  readOnly,
}: Props) {
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

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
            className="relative bg-white w-full md:w-full md:max-w-md md:mx-4 md:my-8 rounded-t-[2rem] md:rounded-2xl shadow-xl pointer-events-auto flex flex-col will-change-transform max-h-[75dvh] overflow-hidden"
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
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0"
                  aria-label="Tutup"
                >
                  <XCircle className="w-6 h-6" />
                </button>
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

                <div className="text-sm">
                  <span className="font-semibold text-slate-500 mr-2">
                    NIM:
                  </span>
                  <span className="text-slate-800 font-bold">
                    {anggota.nim || "-"}
                  </span>
                </div>
              </div>

              <div className="px-6 pb-6 w-full max-w-sm mx-auto text-center mt-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Status Kehadiran
                </p>
                <div className="border border-slate-100 rounded-xl overflow-hidden mx-auto">
                  <div className="bg-slate-50 p-3 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        {formatDate(tanggal)}
                      </span>
                    </div>
                    {absen ? (
                      (() => {
                        const config = statusConfig[absen.status];
                        const StatusIcon = config.icon;
                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 font-bold text-[10px] w-fit uppercase rounded-full ${config.bg} ${config.color}`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {absen.status}
                          </span>
                        );
                      })()
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 font-bold text-[10px] w-fit uppercase rounded-full bg-slate-100 text-slate-500">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Belum Absen
                      </span>
                    )}
                  </div>

                  <div className="mt-4 p-4 bg-white border-t border-slate-100">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Keterangan
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                        <FileText className="h-4 w-4 text-slate-400" />
                      </div>
                      <AutoResizeTextarea
                        className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-all resize-none"
                        placeholder="Tambahkan keterangan (opsional)..."
                        defaultValue={absen?.keterangan || ""}
                        readOnly={readOnly}
                        onBlur={(e) => {
                          if (readOnly) return;
                          const val = e.target.value.trim();
                          if (onUpdate && val !== (absen?.keterangan || "")) {
                            onUpdate({ keterangan: val });
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {!readOnly && (
              <div className="p-5 md:p-6 border-t border-slate-100 bg-slate-50 mt-auto">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      id: "Izin",
                      icon: Clock,
                      defaultBg:
                        "bg-white text-slate-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200",
                      activeBg:
                        "bg-amber-100 text-amber-700 border-amber-300 shadow-inner",
                    },
                    {
                      id: "Sakit",
                      icon: AlertCircle,
                      defaultBg:
                        "bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200",
                      activeBg:
                        "bg-rose-100 text-rose-700 border-rose-300 shadow-inner",
                    },
                    {
                      id: "Pulang",
                      icon: XCircle,
                      defaultBg:
                        "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-700 hover:border-slate-300",
                      activeBg:
                        "bg-slate-200 text-slate-800 border-slate-400 shadow-inner",
                    },
                  ].map((action) => {
                    const isActive = absen?.status === action.id;
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        onClick={() => {
                          if (onUpdate) {
                            onUpdate({
                              status: isActive ? "Hadir" : action.id,
                            });
                          }
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 shadow-sm transition-all ${isActive ? action.activeBg : action.defaultBg}`}
                      >
                        <Icon
                          className={`w-6 h-6 mb-2 ${isActive ? "animate-pulse" : ""}`}
                        />
                        <span className="text-xs font-bold uppercase tracking-wide">
                          {action.id}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
