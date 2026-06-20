import React, { useState, useRef, useEffect } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { downloadExcel, downloadPDF } from "../libs/exportUtils";

interface DownloadMenuProps {
  data: any[];
  filename: string;
  columns: { header: string; key: string }[];
}

export function DownloadMenu({ data, filename, columns }: DownloadMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDownloadExcel = () => {
    downloadExcel(data, filename, columns);
    setIsOpen(false);
  };

  const handleDownloadPDF = async () => {
    await downloadPDF(data, filename, columns);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-3 rounded-xl shadow-sm transition-colors flex items-center justify-center shrink-0"
        title="Download"
      >
        <Download className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden"
          >
            <div className="py-1">
              <button
                onClick={handleDownloadExcel}
                className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 flex items-center gap-3 transition-colors"
              >
                <div className="p-1.5 bg-emerald-50 rounded-lg">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                </div>
                Download Excel
              </button>
              <div className="h-px bg-slate-100 mx-4"></div>
              <button
                onClick={handleDownloadPDF}
                className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 flex items-center gap-3 transition-colors"
              >
                <div className="p-1.5 bg-rose-50 rounded-lg">
                  <FileText className="w-4 h-4 text-rose-600" />
                </div>
                Download PDF
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
