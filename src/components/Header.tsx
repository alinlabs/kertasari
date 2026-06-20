import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Target,
  Calendar,
  Menu,
  Users,
  Wallet,
  FileText,
  Settings,
  Info,
  Edit3,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Trans } from "./Trans";

interface HeaderProps {
  activeTab: string;
}

export function Header({ activeTab }: HeaderProps) {
  const { user } = useAuth();
  const canEditSeputarKami =
    (user?.jabatan === "Ketua" && user?.divisi === "Inti") || user?.jabatan === "Super Admin";
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      setIsMenuOpen(false);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const desktopNavItems = [
    { id: "beranda", label: "Beranda", icon: LayoutDashboard },
    { id: "proker", label: "Proker", icon: Target },
    { id: "agenda", label: "Agenda", icon: Calendar },
  ];

  const menuItems = [
    { id: "seputarkami", label: "Seputar Kami", icon: Info },
    { id: "kehadiran", label: "Keanggotaan", icon: Users },
    { id: "keuangan", label: "Keuangan", icon: Wallet },
    { id: "administrasi", label: "Administrasi", icon: FileText },
    { id: "pengaturan", label: "Pengaturan", icon: Settings },
  ];

  const allItems = [...desktopNavItems, ...menuItems];
  const activeLabel =
    allItems.find((i) => i.id === activeTab)?.label || "Portal Pemberdayaan";
  const subTitle =
    activeTab === "beranda" ? "Portal Pemberdayaan" : activeLabel;

  return (
    <header className="w-full sticky top-0 z-50 bg-white rounded-b-2xl shadow-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link
            to="/beranda"
            className="flex items-center gap-3 cursor-pointer"
          >
            <img
              src="/gambar/logo.png"
              alt="Logo KPPM"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="font-bold text-lg leading-tight text-slate-900">
                <Trans>KPPM Kertasari</Trans>
              </h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">
                <Trans>{subTitle}</Trans>
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            {activeTab === "seputarkami" && canEditSeputarKami && (
              <button
                onClick={() =>
                  window.dispatchEvent(new Event("openSeputarEditModal"))
                }
                className="p-2 text-slate-400 hover:text-brand-600 hover:bg-slate-50 border border-slate-200 hover:border-brand-200 rounded-xl transition-colors md:hidden"
                title="Edit Seputar Kami"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            )}

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6 mr-2">
              {desktopNavItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <Link
                    key={item.id}
                    to={`/${item.id}`}
                    className={`text-sm transition-colors block ${
                      isActive
                        ? "font-semibold text-brand-600"
                        : "font-medium text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Trans>{item.label}</Trans>
                  </Link>
                );
              })}
              {activeTab === "seputarkami" && canEditSeputarKami && (
                <button
                  onClick={() =>
                    window.dispatchEvent(new Event("openSeputarEditModal"))
                  }
                  className="p-2 text-slate-400 hover:text-brand-600 hover:bg-slate-50 border border-slate-200 hover:border-brand-200 rounded-xl transition-colors ml-2"
                  title="Edit Seputar Kami"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              )}
            </nav>

            {/* Application Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
                aria-label="Menu Aplikasi"
              >
                <Menu className="w-6 h-6" />
              </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden py-2 z-50 origin-top-right mix-blend-normal"
                  >
                    <div className="px-4 py-2 border-b border-slate-50 mb-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <Trans>Modul App</Trans>
                      </p>
                    </div>
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.id}
                          to={`/${item.id}`}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-brand-600 transition-colors text-left"
                          onClick={() => {
                            setIsMenuOpen(false);
                          }}
                        >
                          <Icon className="w-4 h-4" />
                          <Trans>{item.label}</Trans>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
