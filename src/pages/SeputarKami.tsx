import { useState, useEffect } from "react";
import {
  Building,
  Target,
  History,
  Users,
  HeartHandshake,
  MapPin,
  Edit3,
  Download
} from "lucide-react";
import { MapComponent } from "../components/MapComponent";
import { api } from "../api";
import { Seputar } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { SeputarEditModal } from "../components/SeputarEditModal";
import { downloadSeputarKamiPDF } from "../libs/export-seputar";

const defaultIconMapping = {
  Users: Users,
  Building: Building,
  HeartHandshake: HeartHandshake,
  Target: Target,
  History: History,
  MapPin: MapPin,
};

export function SeputarKami() {
  const { user } = useAuth();
  const canEditSeputarKami =
    (user?.jabatan === "Ketua" && user?.divisi === "Inti") || user?.jabatan === "Super Admin";
  const [activeTab, setActiveTab] = useState<"Peta" | "Visi Misi" | "Sejarah">(
    "Peta",
  );
  const [activeKppmTab, setActiveKppmTab] = useState<
    "Deskripsi" | "Visi Misi" | "Nilai Dasar"
  >("Deskripsi");

  const [seputarData, setSeputarData] = useState<Seputar | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenModal = () => setIsEditModalOpen(true);
    window.addEventListener("openSeputarEditModal", handleOpenModal);
    return () =>
      window.removeEventListener("openSeputarEditModal", handleOpenModal);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get<Seputar[]>("seputar");
        if (data && data.length > 0) {
          setSeputarData(data[0]);
        }
      } catch (error) {
        console.error("Error fetching seputar data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveSeputar = async (updatedData: Seputar) => {
    try {
      if (updatedData.id) {
        const result = await api.put<Seputar>(
          "seputar",
          updatedData.id,
          updatedData,
        );
        setSeputarData(result);
      } else {
        const result = await api.post<Seputar>("seputar", updatedData);
        setSeputarData(result);
      }
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Gagal menyimpan data seputar kami:", error);
      alert("Gagal menyimpan data seputar kami. Silakan coba lagi.");
    }
  };

  // Data desa dan kelompok kini berada dalam satu objek seputarData

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-brand-600">
        Memuat data...
      </div>
    );
  }

  return (
    <div className="py-2 md:py-4 space-y-12 md:space-y-20 relative">
      {/* Header Section */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 md:w-24 md:h-24">
          <img
            src="/gambar/logo.png"
            alt="Logo KPPM Kertasari"
            className="w-full h-full object-contain drop-shadow-sm"
          />
        </div>
        <div className="space-y-4">
          <h1 className="text-xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
            Kuliah Praktik Pengabdian Masyarakat
            <br />
            <span className="text-brand-600 block mt-1">Desa Kertasari</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium tracking-normal mt-2">
            Mengabdi, Berkarya, Berdampak Bersama Membangun Desa
          </p>
          <div className="flex justify-center pt-2">
            <button
              onClick={() => {
                if (seputarData) {
                  downloadSeputarKamiPDF(seputarData);
                }
              }}
              disabled={!seputarData}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white font-medium rounded-full hover:bg-brand-700 hover:shadow-md hover:shadow-brand-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Download className="w-4 h-4" />
              Download Resume
            </button>
          </div>
        </div>
      </div>

      {/* Konten Desa & Tabs */}
      {seputarData && (
        <div className="w-full">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-4 md:gap-6">
              <div className="flex items-center gap-3">
                <img
                  src="/gambar/purwakarta-logo.png"
                  alt="Logo Purwakarta"
                  className="w-6 h-6 md:w-8 md:h-8 object-contain"
                />
                <h2 className="text-lg md:text-2xl font-bold text-slate-900 tracking-tight">
                  Desa Kertasari
                </h2>
              </div>

              {/* Tabs Container */}
              <div className="flex flex-row items-center p-1.5 bg-slate-50 border border-slate-200/60 shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)] rounded-xl md:rounded-full w-full md:w-fit gap-1 md:gap-0 font-medium overflow-hidden">
                {(["Peta", "Visi Misi", "Sejarah"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 md:flex-none px-2 md:px-7 py-2 md:py-2.5 text-[12px] md:text-sm rounded-lg md:rounded-full whitespace-nowrap transition-all duration-300 flex items-center justify-center text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2 ${
                      activeTab === tab
                        ? "bg-white text-brand-600 shadow-[0_2px_8px_-2px_rgba(22,163,74,0.15)] border border-slate-200/50 scale-[1.02] transform !font-bold"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 border border-transparent"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-8 pt-2">
              {/* Tab Content */}
              <div className="space-y-6">
                {activeTab === "Peta" && (
                  <div className="w-full">
                    <MapComponent />
                  </div>
                )}

                {activeTab === "Visi Misi" && (
                  <div className="space-y-8 max-w-4xl">
                    <div className="prose prose-slate prose-p:leading-relaxed text-slate-600 text-sm md:text-base max-w-none pb-6 border-b border-slate-100 whitespace-pre-wrap text-justify">
                      {seputarData.deskripsiDesa}
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
                        <Target className="w-4 h-4 text-brand-500" />
                        Visi
                      </h4>
                      <p className="text-slate-600 text-xs md:text-sm leading-relaxed pl-6 border-l-2 border-brand-100/50 text-justify">
                        {seputarData.visiDesa}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
                        <Target className="w-4 h-4 text-brand-500" />
                        Misi
                      </h4>
                      <ul className="space-y-3 text-xs md:text-sm text-slate-600 pl-6 border-l-2 border-brand-100/50 text-justify">
                        {seputarData.misiDesa &&
                          seputarData.misiDesa.map((m, index) => (
                            <li key={index} className="flex gap-3">
                              <span className="font-bold text-brand-400">
                                {index + 1}.
                              </span>
                              <span className="leading-relaxed">{m}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === "Sejarah" && (
                  <div className="prose prose-slate prose-p:leading-relaxed text-slate-600 text-sm md:text-base max-w-none whitespace-pre-wrap text-justify">
                    {seputarData.sejarahDesa}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Konten Kelompok KPPM & Tabs */}
      {seputarData && (
        <div className="w-full">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-4 md:gap-6">
              <div className="flex items-center gap-3">
                <img
                  src="/gambar/logo.png"
                  alt="Logo KPPM"
                  className="w-6 h-6 md:w-8 md:h-8 object-contain"
                />
                <h2 className="text-lg md:text-2xl font-bold text-slate-900 tracking-tight">
                  Kelompok KPPM
                </h2>
              </div>

              {/* Tabs Container */}
              <div className="flex flex-row items-center p-1.5 bg-slate-50 border border-slate-200/60 shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)] rounded-xl md:rounded-full w-full md:w-fit gap-1 md:gap-0 font-medium overflow-hidden">
                {(["Deskripsi", "Visi Misi", "Nilai Dasar"] as const).map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveKppmTab(tab)}
                      className={`flex-1 md:flex-none px-2 md:px-7 py-2 md:py-2.5 text-[12px] md:text-sm rounded-lg md:rounded-full whitespace-nowrap transition-all duration-300 flex items-center justify-center text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2 ${
                        activeKppmTab === tab
                          ? "bg-white text-brand-600 shadow-[0_2px_8px_-2px_rgba(22,163,74,0.15)] border border-slate-200/50 scale-[1.02] transform !font-bold"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 border border-transparent"
                      }`}
                    >
                      {tab}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="space-y-8 pt-2">
              {/* Tab Content */}
              <div className="space-y-6">
                {activeKppmTab === "Deskripsi" && (
                  <div className="prose prose-slate prose-p:leading-relaxed text-slate-600 text-sm md:text-base max-w-none whitespace-pre-wrap text-justify">
                    {seputarData.deskripsiKelompok}
                  </div>
                )}

                {activeKppmTab === "Visi Misi" && (
                  <div className="space-y-8 max-w-4xl">
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
                        <Target className="w-5 h-5 text-brand-500" />
                        Visi
                      </h4>
                      <p className="text-slate-600 text-sm md:text-base leading-relaxed pl-7 border-l-2 border-brand-100/70 text-justify">
                        {seputarData.visiKelompok}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
                        <Target className="w-5 h-5 text-brand-500" />
                        Misi
                      </h4>
                      <ul className="space-y-4 text-sm md:text-base text-slate-600 pl-7 border-l-2 border-brand-100/70 text-justify">
                        {seputarData.misiKelompok &&
                          seputarData.misiKelompok.map((m, index) => (
                            <li key={index} className="flex gap-3">
                              <span className="font-bold text-brand-400">
                                {index + 1}.
                              </span>
                              <span className="leading-relaxed">{m}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeKppmTab === "Nilai Dasar" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {[
                      {
                        nama: "Mengabdi",
                        deskripsi:
                          "Melayani dan mendampingi masyarakat sepenuh hati sebagai wujud kontribusi nyata.",
                        icon: "HeartHandshake",
                      },
                      {
                        nama: "Berkarya",
                        deskripsi:
                          "Mengimplementasikan keilmuan akademis menjadi karya dan inovasi yang solutif.",
                        icon: "Edit3",
                      },
                      {
                        nama: "Berdampak",
                        deskripsi:
                          "Memberikan perubahan dan manfaat positif yang langsung dirasakan oleh masyarakat.",
                        icon: "Target",
                      },
                      {
                        nama: "Membangun Bersama",
                        deskripsi:
                          "Menjalin kolaborasi dan kerja sama yang erat dengan seluruh elemen desa.",
                        icon: "Users",
                      },
                    ].map((nilai, index) => {
                      const Icon =
                        defaultIconMapping[
                          nilai.icon as keyof typeof defaultIconMapping
                        ] || Target;
                      return (
                        <div
                          key={index}
                          className="flex flex-col space-y-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-slate-200 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-brand-50 rounded-full flex-shrink-0">
                              <Icon className="w-6 h-6 md:w-7 md:h-7 text-brand-600" />
                            </div>
                            <h4 className="font-bold text-slate-900 text-base leading-tight">
                              {nilai.nama}
                            </h4>
                          </div>
                          <p className="text-sm md:text-[15px] text-slate-500 leading-relaxed text-justify">
                            {nilai.deskripsi}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {seputarData && canEditSeputarKami && (
        <SeputarEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          data={seputarData}
          onSave={handleSaveSeputar}
        />
      )}
    </div>
  );
}
