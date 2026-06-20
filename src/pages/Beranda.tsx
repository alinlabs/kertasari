import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Target,
  Users,
  MapPin,
  Search,
  User,
  CheckCircle2,
  CircleDashed,
  XCircle,
  Briefcase,
  CalendarCheck,
  CalendarDays,
  CalendarX,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { KPPMCalendar } from "../components/KPPMCalendar";
import { AgendaDetailModal } from "../components/AgendaDetailModal";
import { WelcomePopup } from "../components/WelcomePopup";
import { ActivityChart } from "../components/ActivityChart";
import { Agenda, AgendaStatus, Proker } from "../types";
import { api } from "../api";
import { useAuth } from "../contexts/AuthContext";
import { Trans } from "../components/Trans";

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

let hasShownWelcome = false;

export function Dashboard() {
  const { user } = useAuth();
  const isKetua = (user?.jabatan === "Ketua" && user?.divisi === "Inti") || user?.jabatan === "Super Admin";
  const canEditAcara = user?.divisi === "Acara" || isKetua;
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<number>(1);
  const [activeView, setActiveView] = useState<"kalender" | "analisa">(
    "kalender",
  );
  const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<string>(
    "Dusun I dan Dusun II, Desa Kertasari",
  );

  const [isWelcomeOpen, setIsWelcomeOpen] = useState(() => {
    if (!hasShownWelcome) {
      hasShownWelcome = true;
      return true;
    }
    return false;
  });

  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [prokers, setProkers] = useState<Proker[]>([]);

  useEffect(() => {
    // Check if Geolocation is supported
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            );
            const data = await res.json();
            if (data && data.address) {
              const locality =
                data.address.village ||
                data.address.suburb ||
                data.address.town ||
                data.address.city;
              const region = data.address.county || data.address.state;
              const locationString = [locality, region]
                .filter(Boolean)
                .join(", ");
              if (locationString) {
                setUserLocation(locationString);
              }
            }
          } catch (error) {
            console.error("Geocoding failed", error);
          }
        },
        (error) => {
          console.error("Geolocation error", error);
        },
      );
    }

    Promise.all([api.get<Agenda[]>("agenda"), api.get<Proker[]>("proker")])
      .then(([agendaData, prokerData]) => {
        const processedAgendas = agendaData.map((a: Agenda) => ({
          ...a,
          status: getDynamicStatus(a),
        }));
        setAgendas(processedAgendas);
        setProkers(prokerData);
      })
      .catch((err) => console.error("Failed to load data", err));
  }, []);

  // Calculate which days have agendas
  const agendasByDate = useMemo(() => {
    return agendas.reduce(
      (acc, agenda) => {
        if (agenda.tanggal.startsWith("2026-07-")) {
          const day = parseInt(agenda.tanggal.split("-")[2], 10);
          if (!acc[day]) {
            acc[day] = { total: 0, terlaksana: 0, terjadwal: 0, terlewat: 0 };
          }
          acc[day].total += 1;
          const dynStatus = agenda.status;
          if (dynStatus === "Selesai") acc[day].terlaksana += 1;
          else if (dynStatus === "Rencana") acc[day].terjadwal += 1;
          else if (dynStatus === "Terlewat") acc[day].terlewat += 1;
        }
        return acc;
      },
      {} as Record<
        number,
        {
          total: number;
          terlaksana: number;
          terjadwal: number;
          terlewat: number;
        }
      >,
    );
  }, [agendas]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return agendas.filter(
      (agenda) =>
        agenda.judul.toLowerCase().includes(query) ||
        (agenda.deskripsi?.toLowerCase().includes(query) ?? false) ||
        agenda.lokasi.toLowerCase().includes(query) ||
        (agenda.pic?.toLowerCase().includes(query) ?? false) ||
        (agenda.terkaitProker?.toLowerCase().includes(query) ?? false),
    );
  }, [searchQuery, agendas]);

  const isSearching = searchQuery.trim().length > 0;

  const currentDateStr = `2026-07-${selectedDate.toString().padStart(2, "0")}`;
  const dailyAgendas = agendas.filter((a) => a.tanggal === currentDateStr);

  const agendasToShow = isSearching ? searchResults : dailyAgendas;
  const displayedAgendas = isSearching
    ? agendasToShow
    : agendasToShow.slice(0, 3);
  const hasMoreAgendas = !isSearching && agendasToShow.length > 3;

  return (
    <div className="flex flex-col gap-6">
      {/* Dashboard Greeting & Statistics */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
              <Trans>Hai, Selamat Datang! 👋</Trans>
            </h2>
            <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-3">
              <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                <MapPin className="w-4 h-4 text-brand-600" />
                <span>{userLocation}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-2 md:gap-4">
          <div className="bg-white p-2 md:p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-1.5 md:gap-2 relative overflow-hidden group text-center">
            <div className="text-slate-500 font-bold uppercase text-[8px] md:text-[10px] tracking-wider relative z-10 w-full overflow-hidden whitespace-nowrap text-ellipsis">
              <span className="truncate"><Trans>Total</Trans></span>
            </div>
            <div className="text-lg md:text-2xl font-bold text-slate-800 relative z-10">
              {agendas.length}
            </div>
          </div>

          <div className="bg-white p-2 md:p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-1.5 md:gap-2 relative overflow-hidden group text-center">
            <div className="text-emerald-600 font-bold uppercase text-[8px] md:text-[10px] tracking-wider relative z-10 w-full overflow-hidden whitespace-nowrap text-ellipsis">
              <span className="truncate"><Trans>Selesai</Trans></span>
            </div>
            <div className="text-lg md:text-2xl font-bold text-slate-800 relative z-10">
              {agendas.filter((a) => a.status === "Selesai").length}
            </div>
          </div>

          <div className="bg-white p-2 md:p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-1.5 md:gap-2 relative overflow-hidden group text-center">
            <div className="text-brand-600 font-bold uppercase text-[8px] md:text-[10px] tracking-wider relative z-10 w-full overflow-hidden whitespace-nowrap text-ellipsis">
              <span className="truncate"><Trans>Rencana</Trans></span>
            </div>
            <div className="text-lg md:text-2xl font-bold text-slate-800 relative z-10">
              {agendas.filter((a) => a.status === "Rencana").length}
            </div>
          </div>

          <div className="bg-white p-2 md:p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-1.5 md:gap-2 relative overflow-hidden group text-center">
            <div className="text-rose-600 font-bold uppercase text-[8px] md:text-[10px] tracking-wider relative z-10 w-full overflow-hidden whitespace-nowrap text-ellipsis">
              <span className="truncate"><Trans>Terlewat</Trans></span>
            </div>
            <div className="text-lg md:text-2xl font-bold text-slate-800 relative z-10">
              {agendas.filter((a) => a.status === "Terlewat").length}
            </div>
          </div>
        </div>

        {/* Search & Toggle View Tabs Row */}
        <div className="flex flex-col md:flex-row gap-4 w-full">
          {/* Search Bar */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-shadow shadow-sm"
              placeholder="Cari agenda, proker, lokasi, atau PIC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Toggle View Tabs */}
          {!isSearching && (
            <div className="flex bg-slate-100 p-1.5 rounded-xl w-full md:w-[300px] shrink-0">
              <button
                onClick={() => setActiveView("kalender")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  activeView === "kalender"
                    ? "bg-white text-brand-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                }`}
              >
                Kalender
              </button>
              <button
                onClick={() => setActiveView("analisa")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  activeView === "analisa"
                    ? "bg-white text-brand-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                }`}
              >
                Analisa
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Calendar & Agenda List */}
      <div className="flex flex-col gap-6 items-start w-full">
        {/* View Section */}
        {!isSearching && (
          <div className="w-full">
            {activeView === "kalender" ? (
              <KPPMCalendar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                agendasByDate={agendasByDate}
              />
            ) : (
              <ActivityChart agendas={agendas} />
            )}
          </div>
        )}

        {/* Agenda Overview Section */}
        <div className="flex flex-col w-full">
          <div className="flex items-center justify-between mb-4 pb-2">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">
              {isSearching
                ? `Hasil Pencarian: "${searchQuery}"`
                : `Agenda: ${selectedDate} Juli 2026`}
            </h3>
            <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-md text-slate-600 font-bold uppercase">
              {agendasToShow.length} Kegiatan
            </span>
          </div>

          <div className="w-full relative">
            <AnimatePresence mode="wait">
              {displayedAgendas.length > 0 ? (
                <motion.div
                  key={selectedDate}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4"
                >
                  {displayedAgendas.map((agenda, index) => {
                    const config = statusConfig[agenda.status];
                    const StatusIcon = config.icon;

                    return (
                      <div
                        key={agenda.id}
                        onClick={() => setSelectedAgenda(agenda)}
                        className={`bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all group flex flex-col md:flex-row md:gap-4 gap-3 cursor-pointer`}
                      >
                        <div className="hidden md:flex flex-col justify-center items-center px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg h-fit">
                          <span className="text-sm font-bold text-brand-600">
                            {agenda.waktu}
                          </span>
                        </div>

                        <div className="flex-1">
                          {/* Mobile Time */}
                          <div className="md:hidden text-xs font-bold text-brand-600 mb-1.5 flex items-center gap-1.5">
                            {agenda.waktu}
                          </div>

                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h4 className="text-[15px] font-bold text-slate-900 group-hover:text-brand-700 transition-colors flex items-center gap-1.5">
                              {agenda.judul}
                              {agenda.status === "Selesai" && (
                                <CheckCircle2 className="w-4 h-4 text-white fill-green-600 rounded-full" />
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
                                <span>{agenda.pic}</span>
                              </div>
                            )}
                            {agenda.terkaitProker && (
                              <div className="flex items-center gap-1.5">
                                <Target className="w-3.5 h-3.5 text-brand-500" />
                                <span>{agenda.terkaitProker}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {hasMoreAgendas && (
                    <button
                      onClick={() => navigate("/agenda")}
                      className="w-full mt-2 py-3 bg-white text-brand-700 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-colors border border-slate-200 shadow-sm"
                    >
                      Lihat {dailyAgendas.length - 3} Kegiatan Selanjutnya
                    </button>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-slate-400 py-12 bg-white rounded-xl border border-slate-100 shadow-sm"
                >
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 border-dashed">
                    <Search className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-600 mb-1">
                    Masa Kosong / Fokus Bebas
                  </p>
                  <p className="text-xs max-w-[200px] text-center leading-relaxed">
                    Tidak ada acara resmi yang dijadwalkan pada hari ini.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
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

      <WelcomePopup
        agendas={agendas}
        isOpen={isWelcomeOpen}
        onClose={() => setIsWelcomeOpen(false)}
      />
    </div>
  );
}
