import React, { useState } from "react";
import { motion } from "motion/react";
import { LogIn, ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../api";
import { Keanggotaan } from "../types";
import { useNavigate } from "react-router-dom";

export function Login() {
  const [nim, setNim] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nim.trim()) return;

    setError("");
    setIsLoggingIn(true);

    try {
      if (nim.trim() === "1404") {
        const superAdmin: Keanggotaan = {
          id: "super-admin",
          nama: "Super Admin",
          jabatan: "Super Admin",
          divisi: "Inti",
          telepon: "-",
          email: "superadmin@kppm.com",
          nim: "1404",
        };
        login(superAdmin);
        navigate("/pengaturan");
        return;
      }

      const data = await api.get<Keanggotaan[]>("keanggotaan");
      const found = data.find((m) => m.nim === nim.trim());
      if (found) {
        login(found);
        navigate("/pengaturan");
      } else {
        setError("Akun tidak di temukan silahkan periksa kembali");
      }
    } catch (err) {
      setError("Sistem sedang sibuk. Silakan coba beberapa saat lagi.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 lg:bg-white flex flex-col lg:flex-row">
      {/* Desktop Branding (hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 relative p-12 flex-col justify-between overflow-hidden">
        {/* Background Effects / Glow */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-brand-600 blur-[120px] opacity-30 mix-blend-screen"></div>
          <div className="absolute bottom-[10%] -right-[20%] w-[60%] h-[60%] rounded-full bg-brand-800 blur-[120px] opacity-20 mix-blend-screen"></div>
        </div>

        <div className="relative z-10 w-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center p-1.5">
              <img
                src="/gambar/logo.png"
                alt="Logo KPPM"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              KPPM Kertasari
            </span>
          </div>
        </div>

        <div className="relative z-10 max-w-md mt-16 mb-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white/80 text-xs font-semibold mb-6 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Sistem Aktif
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-[1.15] font-sans tracking-tight">
              Sistem Administrasi <br />
              <span className="text-white">KPPM Desa Kertasari</span>
            </h1>
          </motion.div>
        </div>

        <div className="relative z-10 text-slate-500 text-sm mt-auto flex items-center gap-4">
          <p>&copy; {new Date().getFullYear()} KPPM Desa Kertasari</p>
          <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
          <p>Ver. 2.0.1</p>
        </div>
      </div>

      {/* Mobile Branding (hidden on desktop) */}
      <div className="lg:hidden flex flex-col justify-center items-center pt-24 pb-20 px-6 relative overflow-hidden bg-slate-950">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[80%] h-[80%] rounded-full bg-brand-600 blur-[100px] opacity-40 mix-blend-screen"></div>
          <div className="absolute bottom-[0%] -right-[10%] w-[70%] h-[70%] rounded-full bg-brand-800 blur-[100px] opacity-30 mix-blend-screen"></div>
        </div>

        <div className="w-full relative z-10 flex justify-start mb-8 hidden"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-lg shadow-brand-600/30 flex items-center justify-center p-2 mb-5">
            <img
              src="/gambar/logo.png"
              alt="Logo KPPM"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-extrabold text-white text-center leading-tight tracking-tight">
            Sistem Administrasi <br />
            <span className="text-white">KPPM Desa Kertasari</span>
          </h1>
        </div>
      </div>

      {/* Kolom Kanan: Form Login */}
      <div className="w-full flex-1 lg:w-1/2 flex flex-col justify-start lg:justify-center px-6 pb-12 sm:px-12 md:px-24 bg-white relative rounded-t-[2rem] lg:rounded-none -mt-8 lg:mt-0 z-20 pt-6 lg:pt-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] lg:shadow-none">
        {/* Handle for bottom sheet look (mobile only) */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8 lg:hidden"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-sm mx-auto"
        >
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">
              Selamat Datang!
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="nim"
                className="block text-sm font-semibold text-slate-700"
              >
                User ID
              </label>
              <div className="relative group">
                <input
                  type="text"
                  id="nim"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                  placeholder="Contoh: 12345678"
                  required
                />
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 flex-shrink-0"></div>
                <p className="text-sm text-rose-700 font-medium leading-relaxed">
                  {error}
                </p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-4 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 hover:shadow-brand-700/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-brand-600 disabled:hover:shadow-none relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoggingIn ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    Masuk ke Dashboard
                    <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="mt-8 text-center flex justify-center">
            <button
              type="button"
              onClick={() => navigate("/beranda")}
              className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Beranda
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
