import { ArrowRight, Users, MapPin, Target } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      <div className="h-64 relative rounded-xl overflow-hidden bg-gradient-to-r from-brand-700 to-brand-900 shadow-xl isolate flex flex-col justify-center text-white">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <img
            src="https://images.unsplash.com/photo-1596422846543-7ec40af60965?q=80&w=2000&auto=format&fit=crop"
            alt="Pemandangan Desa"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-700 via-brand-800/80 to-transparent"></div>
        <div className="relative z-10 p-8 md:p-12 max-w-3xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold mb-2"
          >
            Membangun Bersama Kertasari
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-brand-100 text-sm leading-relaxed max-w-xl mb-6"
          >
            Inisiatif Kuliah Praktik Pemberdayaan Masyarakat (KPPM) untuk
            meningkatkan kualitas lingkungan, ekonomi, dan literasi digital di
            Desa Kertasari.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link
              to="/proker"
              className="bg-white text-brand-700 px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-brand-50 transition-all active:scale-95 flex items-center gap-2 group shadow-sm w-fit inline-flex"
            >
              Lihat Program Kerja
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Quick Stats/Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex gap-4 items-start hover:shadow-md transition-shadow"
        >
          <div className="bg-slate-50 text-slate-600 p-2.5 rounded-lg border border-slate-100">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 mb-0.5">
              4 Program Utama
            </h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Fokus pada pendidikan, kesehatan, UMKM, dan lingkungan.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex gap-4 items-start hover:shadow-md transition-shadow"
        >
          <div className="bg-slate-50 text-slate-600 p-2.5 rounded-lg border border-slate-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 mb-0.5">
              15 Mahasiswa
            </h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Kolaborasi lintas jurusan untuk solusi yang komprehensif.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex gap-4 items-start hover:shadow-md transition-shadow"
        >
          <div className="bg-slate-50 text-slate-600 p-2.5 rounded-lg border border-slate-100">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 mb-0.5">
              Desa Kertasari
            </h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Mengabdi selama 30 hari penuh di lokasi penempatan.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
