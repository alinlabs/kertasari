import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";
import { KPPMCalendar } from "./KPPMCalendar";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: number;
  onSelectDate: (d: number) => void;
  agendasByDate?: Record<number, number>;
}

export function CalendarModal({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  agendasByDate = {},
}: Props) {
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
            className="relative bg-white w-full md:w-full md:max-w-md md:mx-4 md:my-8 rounded-t-[2rem] md:rounded-2xl shadow-xl pointer-events-auto flex flex-col will-change-transform max-h-[75dvh] overflow-hidden"
          >
            <div
              className="w-full flex justify-center py-4 md:hidden"
              onClick={onClose}
              style={{ cursor: "grab" }}
            >
              <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
            </div>

            <div className="px-6 py-4 md:pt-6 border-b border-slate-100 flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2 pr-4">
                <h3 className="text-xl font-bold text-slate-900 leading-tight">
                  Pilih Tanggal
                </h3>
              </div>
            </div>

            <div className="p-4 md:p-6 overflow-y-auto">
              <KPPMCalendar
                selectedDate={selectedDate}
                onSelectDate={(d) => {
                  onSelectDate(d);
                  onClose();
                }}
                agendasByDate={agendasByDate}
              />
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
