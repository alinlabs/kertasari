import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  CalendarCheck,
  CalendarDays,
  ExternalLink,
  Calendar as CalendarIcon,
  MapPin,
  Download,
} from "lucide-react";
import { createPortal } from "react-dom";
import { Agenda, AgendaStatus } from "../types";
import { usePWAInstall } from "../hooks/usePWAInstall";

interface WelcomePopupProps {
  agendas: Agenda[];
  isOpen: boolean;
  onClose: () => void;
}

const getDynamicStatus = (agenda: Agenda): AgendaStatus => {
  if (agenda.status === "Selesai") return "Selesai";

  const now = new Date();
  const nowWIB = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  
  const agendaDateParts = agenda.tanggal.split("-");
  const agendaTimeParts = agenda.waktu ? agenda.waktu.split(":") : ["00", "00"];
  
  const agendaDateTime = new Date(
    parseInt(agendaDateParts[0]), 
    parseInt(agendaDateParts[1]) - 1, 
    parseInt(agendaDateParts[2]),
    parseInt(agendaTimeParts[0]),
    parseInt(agendaTimeParts[1])
  );

  if (nowWIB > agendaDateTime) return "Terlewat";
  return "Rencana";
};

export function WelcomePopup({ agendas, isOpen, onClose }: WelcomePopupProps) {
  const { isInstalled, isInstallable, install } = usePWAInstall();

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

  const todayStr = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Jakarta",
  }); // YYYY-MM-DD
  const todaysAgendas = agendas.filter((a) => a.tanggal === todayStr);

  const hour = new Date().getHours();
  let timeGreeting = "Selamat Pagi";
  if (hour >= 11 && hour < 15) timeGreeting = "Selamat Siang";
  else if (hour >= 15 && hour < 18) timeGreeting = "Selamat Sore";
  else if (hour >= 18 || hour < 4) timeGreeting = "Selamat Malam";

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
            className="relative bg-white w-full md:w-[450px] md:mx-4 md:my-8 rounded-t-[2rem] md:rounded-3xl shadow-2xl pointer-events-auto flex flex-col will-change-transform max-h-[75dvh] overflow-hidden"
          >
            {/* Drag handle for mobile */}
            <div
              className="w-full flex justify-center py-4 md:hidden absolute top-0 z-20"
              onClick={onClose}
              style={{ cursor: "grab" }}
            >
              <div className="w-12 h-1.5 bg-white/50 shadow-sm backdrop-blur-md rounded-full"></div>
            </div>

            {todaysAgendas.length > 0 ? (
              <>
                <div className="relative bg-white p-6 pb-4 overflow-hidden shrink-0 pt-10 md:pt-6">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors z-10 hidden md:block"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <h2 className="text-2xl font-bold mb-2 text-brand-700">
                    Halo, {timeGreeting}! 👋
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Berikut adalah agenda kegiatan Anda untuk hari ini.
                  </p>
                </div>

                <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 mb-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
                      <CalendarCheck className="w-4 h-4 text-brand-500" />
                      Agenda Hari Ini
                    </div>
                    {todaysAgendas.map((agenda, index) => {
                      const status = getDynamicStatus(agenda);
                      const isDone = status === "Selesai";
                      return (
                        <div
                          key={index}
                          className="bg-white border text-left border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-brand-300 transition-colors"
                        >
                          {isDone && (
                            <div className="absolute top-0 right-0 w-12 h-12 bg-green-50 rounded-bl-full flex items-start justify-end p-2 border-b border-l border-green-100">
                              <CalendarCheck className="w-4 h-4 text-green-600" />
                            </div>
                          )}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold bg-brand-50 text-brand-700 px-2.5 py-1 rounded-lg">
                              {agenda.waktu}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${isDone ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}
                            >
                              {status}
                            </span>
                          </div>
                          <h4
                            className={`text-base font-bold mb-1 ${isDone ? "text-slate-500 line-through" : "text-slate-900 group-hover:text-brand-700"}`}
                          >
                            {agenda.judul}
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {agenda.lokasi}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {(!isInstalled && isInstallable) && (
                  <div className="p-4 bg-white border-t border-slate-200 shrink-0 mt-auto sticky bottom-0 z-10 w-full">
                    <button
                      onClick={install}
                      className="w-full flex items-center justify-center gap-3 py-3 rounded-xl shadow-sm transition-all active:scale-[0.98] bg-brand-50 text-brand-700 hover:bg-brand-100"
                    >
                      <svg
                        className="w-6 h-6 z-10"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill="#4184F3"
                          d="M3.2 2.6c-.1.2-.2.6-.2 1v16.7c0 .5.1.8.2 1.1L12.5 12 3.2 2.6z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12.5 12l3.4 3.4 4.5-2.6c1.3-.7 1.3-1.9 0-2.6L16 7.6 12.5 12z"
                        />
                        <path
                          fill="#34A853"
                          d="M3.2 2.6l9.3 9.4 3.4-4.5L5.7.8c-.9-.6-1.9-.1-2.5.8z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M3.2 21.4c.6.9 1.6 1.4 2.5.8l10.2-5.9-3.4-4.3-9.3 9.4z"
                        />
                      </svg>
                      <span className="text-lg font-bold tracking-tight">
                        Install Aplikasi
                      </span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="relative w-full flex flex-col justify-end aspect-[4/5] overflow-hidden rounded-t-[2rem] md:rounded-3xl">
                <img
                  src="/gambar/welcoming.webp"
                  alt="Welcome"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 backdrop-blur-md text-white rounded-full transition-colors z-20 hidden md:block"
                >
                  <X className="w-5 h-5" />
                </button>
                {(!isInstalled && isInstallable) && (
                  <div className="relative p-6 pt-16 mt-auto bg-gradient-to-t from-black/80 via-black/40 to-transparent w-full z-10">
                    <button
                      onClick={install}
                      className="w-full flex items-center justify-center gap-3 py-3 rounded-xl shadow-sm transition-all active:scale-[0.98] bg-brand-500 text-white hover:bg-brand-600"
                    >
                      <svg
                        className="w-6 h-6 z-10"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill="#ffffff"
                          d="M3.2 2.6c-.1.2-.2.6-.2 1v16.7c0 .5.1.8.2 1.1L12.5 12 3.2 2.6z"
                        />
                        <path
                          fill="#f1f5f9"
                          d="M12.5 12l3.4 3.4 4.5-2.6c1.3-.7 1.3-1.9 0-2.6L16 7.6 12.5 12z"
                        />
                        <path
                          fill="#e2e8f0"
                          d="M3.2 2.6l9.3 9.4 3.4-4.5L5.7.8c-.9-.6-1.9-.1-2.5.8z"
                        />
                        <path
                          fill="#cbd5e1"
                          d="M3.2 21.4c.6.9 1.6 1.4 2.5.8l10.2-5.9-3.4-4.3-9.3 9.4z"
                        />
                      </svg>
                      <span className="text-lg font-bold tracking-tight">
                        Install Aplikasi
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
