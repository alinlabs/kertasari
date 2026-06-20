import React, { useState, useEffect, useMemo } from "react";
import {
  Target,
  CheckCircle2,
  Clock,
  CircleDashed,
  Search,
} from "lucide-react";
import { Proker } from "../types";
import { motion } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { ProkerDetailModal } from "../components/ProkerDetailModal";
import { api } from "../api";
import { DownloadMenu } from "../components/DownloadMenu";

export function ProkerList() {
  const { user } = useAuth();
  const canEditProker = (user?.jabatan === "Ketua" && user?.divisi === "Inti") || user?.jabatan === "Super Admin";
  const [selectedProker, setSelectedProker] = useState<Proker | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [prokers, setProkers] = useState<Proker[]>([]);

  useEffect(() => {
    api
      .get<Proker[]>("proker")
      .then((data) => setProkers(data))
      .catch((err) => console.error("Failed to load proker data", err));
  }, []);

  const filteredProkers = useMemo(() => {
    if (!searchQuery.trim()) return prokers;
    const query = searchQuery.toLowerCase();
    return prokers.filter(
      (p) =>
        p.judul.toLowerCase().includes(query) ||
        (p.deskripsi?.toLowerCase().includes(query) ?? false),
    );
  }, [prokers, searchQuery]);

  const exportData = filteredProkers.map((proker) => {
    let manfaatStr = "-";
    if (proker.manfaat && proker.manfaat.length > 0) {
      manfaatStr = proker.manfaat.map((m) => `\u2022 ${m}`).join("\n");
    }
    return {
      Judul: proker.judul,
      Deskripsi: proker.deskripsi || "-",
      Target: proker.targetSasaran || "-",
      Manfaat: manfaatStr,
    };
  });

  const exportColumns = [
    { header: "Judul", key: "Judul" },
    { header: "Deskripsi", key: "Deskripsi" },
    { header: "Target Sasaran", key: "Target" },
    { header: "Manfaat", key: "Manfaat" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Search Bar and Add Button */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-shadow shadow-sm"
            placeholder="Cari program kerja..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DownloadMenu
          data={exportData}
          filename="Data_Program_Kerja"
          columns={exportColumns}
        />
        {canEditProker && (
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white p-3 rounded-xl shadow-sm transition-colors flex items-center justify-center shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">
          {searchQuery.trim()
            ? `Hasil Pencarian: "${searchQuery}"`
            : "Seluruh Program Kerja"}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProkers.length === 0 ? (
          <div className="col-span-1 md:col-span-2 bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
            Tidak ada program kerja yang ditemukan.
          </div>
        ) : (
          filteredProkers.map((proker, index) => {
            return (
              <motion.div
                key={proker.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                onClick={() => setSelectedProker(proker)}
                className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-brand-200 transition-all cursor-pointer flex flex-col group"
              >
                <div className="flex items-start gap-4 mb-3">
                  <div className="bg-slate-50 text-slate-500 p-2.5 rounded-lg border border-slate-100 group-hover:text-brand-600 group-hover:bg-brand-50 group-hover:border-brand-100 transition-colors shrink-0">
                    <Target className="w-5 h-5" />
                  </div>
                  <h4 className="text-[15px] font-bold text-slate-900 group-hover:text-brand-600 transition-colors mt-0.5">
                    {proker.judul}
                  </h4>
                </div>
                <p className="text-xs text-slate-500 italic leading-relaxed line-clamp-2">
                  {proker.deskripsi}
                </p>
              </motion.div>
            );
          })
        )}
      </div>

      <ProkerDetailModal
        proker={selectedProker}
        onClose={() => setSelectedProker(null)}
        readOnly={!canEditProker}
        onUpdate={(updated) => {
          setProkers((prev) =>
            prev.map((p) => (p.id === updated.id ? updated : p)),
          );
          setSelectedProker(updated);
        }}
      />
      {isNewModalOpen && (
        <ProkerDetailModal
          proker={{} as Proker}
          onClose={() => setIsNewModalOpen(false)}
          isNew={true}
          readOnly={!canEditProker}
          onUpdate={(updated) => {
            setProkers((prev) => [...prev, updated]);
            setIsNewModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
