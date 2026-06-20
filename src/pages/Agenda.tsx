import React, { useState, useMemo, useEffect } from "react";
import {
  MapPin,
  CalendarDays,
  User,
  CheckCircle2,
  CircleDashed,
  XCircle,
  Target,
  Search,
  CalendarX,
} from "lucide-react";
import { motion } from "motion/react";
import { AgendaDetailModal } from "../components/AgendaDetailModal";
import { Agenda, AgendaStatus } from "../types";
import { api } from "../api";
import { DownloadMenu } from "../components/DownloadMenu";
import { ActivityChart } from "../components/ActivityChart";

import { useAuth } from "../contexts/AuthContext";

const statusConfig: Record<
  AgendaStatus,
  { color: string; bg: string; icon: React.ElementType }
> = {
  Selesai: {
    color: "text-green-700",
    bg: "bg-green-50",
    icon: CheckCircle2,
  },
  Rencana: { color: "text-brand-700", bg: "bg-brand-50", icon: CircleDashed },
  Terlewat: { color: "text-slate-700", bg: "bg-slate-100", icon: CalendarX },
  "": { color: "text-slate-500", bg: "bg-slate-50", icon: CircleDashed },
};

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

export function AgendaTimeline() {
  const { user } = useAuth();
  const isKetua = (user?.jabatan === "Ketua" && user?.divisi === "Inti") || user?.jabatan === "Super Admin";
  const canEditAcara = user?.divisi === "Acara" || isKetua;
  const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [anggotaList, setAnggotaList] = useState<any[]>([]);
  const [prokerList, setProkerList] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get<Agenda[]>("agenda"),
      api.get<any[]>("keanggotaan"),
      api.get<any[]>("proker"),
    ])
      .then(([agendasData, anggotaData, prokerData]) => {
        const processedAgendas = agendasData.map((a: Agenda) => ({
          ...a,
          status: getDynamicStatus(a),
        }));
        setAgendas(processedAgendas);
        setAnggotaList(anggotaData);
        setProkerList(prokerData);
      })
      .catch((err) => console.error("Failed to load data for agenda", err));
  }, []);

  const getAnggotaName = (id: string) => {
    const found = anggotaList.find((a) => a.id === id);
    return found ? found.nama : id;
  };

  const getProkerJudul = (id: string) => {
    const found = prokerList.find((p) => p.id === id);
    return found ? found.judul : id;
  };

  const sortedAgendas = useMemo(() => {
    let filtered = [...agendas];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (agenda) =>
          agenda.judul.toLowerCase().includes(query) ||
          (agenda.deskripsi?.toLowerCase().includes(query) ?? false) ||
          agenda.lokasi.toLowerCase().includes(query) ||
          (agenda.pic &&
            getAnggotaName(agenda.pic).toLowerCase().includes(query)) ||
          (agenda.terkaitProker &&
            getProkerJudul(agenda.terkaitProker).toLowerCase().includes(query)),
      );
    }
    return filtered.sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  }, [searchQuery, agendas, anggotaList, prokerList]);

  const formatDate = (dateStr: string) => {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parseInt(parts[2], 10)} Juli 2026`;
    }
    return dateStr;
  };

  const exportData = sortedAgendas.map((agenda) => ({
    ...agenda,
    pic: agenda.pic ? getAnggotaName(agenda.pic) : "-",
    terkaitProker: agenda.terkaitProker
      ? getProkerJudul(agenda.terkaitProker)
      : "-",
  }));

  const exportColumns = [
    { header: "Tanggal", key: "tanggal" },
    { header: "Waktu", key: "waktu" },
    { header: "Judul", key: "judul" },
    { header: "Lokasi", key: "lokasi" },
    { header: "Deskripsi", key: "deskripsi" },
    { header: "PJ", key: "pic" },
    { header: "Terkait Proker", key: "terkaitProker" },
    { header: "Status", key: "status" },
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
            placeholder="Cari agenda, lokasi, atau PJ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DownloadMenu
          data={exportData}
          filename="Data_Agenda"
          columns={exportColumns}
        />
        {canEditAcara && (
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
          Statistik Agenda
        </h3>
      </div>

      <ActivityChart agendas={agendas} />

      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">
          {searchQuery.trim()
            ? `Hasil Pencarian: "${searchQuery}"`
            : "Seluruh Agenda"}
        </h3>
      </div>

      <div className="flex flex-col gap-4">
        {sortedAgendas.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
            Tidak ada agenda yang ditemukan.
          </div>
        ) : (
          sortedAgendas.map((agenda, index) => {
            const config = statusConfig[agenda.status];
            const StatusIcon = config.icon;

            return (
              <motion.div
                key={agenda.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedAgenda(agenda)}
                className={`bg-white p-5 rounded-xl shadow-sm flex flex-col gap-3 cursor-pointer hover:shadow-md transition-all group relative overflow-hidden`}
              >
                <div className="flex-1 w-full flex flex-col items-start">
                  <div className="text-xs font-bold text-brand-600 mb-1.5 flex items-center gap-1.5">
                    {formatDate(agenda.tanggal)} - {agenda.waktu}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 w-full mb-1.5">
                    <h4 className="text-[15px] font-bold text-slate-900 group-hover:text-brand-700 transition-colors flex items-center gap-1.5">
                      {agenda.judul}
                      {agenda.status === "Selesai" && (
                        <CheckCircle2 className="w-4 h-4 text-white fill-emerald-600 rounded-full" />
                      )}
                    </h4>
                  </div>

                  {agenda.deskripsi && (
                    <p className="hidden md:block text-sm text-slate-600 leading-relaxed mb-2.5 line-clamp-2">
                      {agenda.deskripsi}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-500" />
                      <span>{agenda.lokasi}</span>
                    </div>
                    {agenda.pic && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-brand-500" />
                        <span>{getAnggotaName(agenda.pic)}</span>
                      </div>
                    )}
                    {agenda.terkaitProker && (
                      <div className="flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-brand-500" />
                        <span>{getProkerJudul(agenda.terkaitProker)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <AgendaDetailModal
        agenda={selectedAgenda}
        onClose={() => setSelectedAgenda(null)}
        readOnly={!canEditAcara}
        onUpdate={(updated) => {
          setAgendas((prev) =>
            prev.map((a) => (a.id === updated.id ? updated : a)),
          );
          setSelectedAgenda(updated);
        }}
      />
      {isNewModalOpen && (
        <AgendaDetailModal
          agenda={{} as Agenda}
          onClose={() => setIsNewModalOpen(false)}
          isNew={true}
          readOnly={!canEditAcara}
          onUpdate={(updated) => {
            setAgendas((prev) => [...prev, updated]);
            setIsNewModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
