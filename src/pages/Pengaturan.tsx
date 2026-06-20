import React, { useState, useEffect } from "react";
import {
  User,
  Moon,
  Sun,
  Bell,
  LogIn,
  LogOut,
  Download,
  Edit3,
  Check,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Trans } from "../components/Trans";
import { useNavigate } from "react-router-dom";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { api } from "../api";

export function Pengaturan() {
  const { user, logout, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const { isInstalled, isInstallable, install } = usePWAInstall();

  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editUserForm, setEditUserForm] = useState({
    nama: "",
    nim: "",
    email: "",
    telepon: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      let initialTelp = user.telepon || "";
      let cleaned = initialTelp.replace(/\D/g, "");
      if (cleaned.startsWith("62")) cleaned = cleaned.substring(2);
      else if (cleaned.startsWith("0")) cleaned = cleaned.substring(1);
      const match = cleaned.match(/^(\d{0,3})(\d{0,4})(\d{0,4})(\d{0,4})/);
      const formattedTelp = match
        ? match.slice(1).filter(Boolean).join("-")
        : cleaned;

      setEditUserForm({
        nama: user.nama || "",
        nim: user.nim || "",
        email: user.email || "",
        telepon: formattedTelp,
      });
    }
  }, [user]);

  const handleSaveUser = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const payloadTelepon = editUserForm.telepon
        ? "+62" + editUserForm.telepon.replace(/\D/g, "")
        : "";
      const updatedUser = {
        ...user,
        ...editUserForm,
        telepon: payloadTelepon,
      };

      if (user.id !== "super-admin") {
        await api.put("keanggotaan", user.id, updatedUser);
      }

      updateUser(updatedUser);
      setIsEditingMode(false);
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan perubahan. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  // Notification states
  const [notifAgenda, setNotifAgenda] = useState(() => localStorage.getItem("notif_agenda") === "true");
  const [notifStatus, setNotifStatus] = useState(() => localStorage.getItem("notif_status") === "true");
  const [notifKeuangan, setNotifKeuangan] = useState(() => localStorage.getItem("notif_keuangan") === "true");

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("notif_agenda", String(notifAgenda));
  }, [notifAgenda]);

  useEffect(() => {
    localStorage.setItem("notif_status", String(notifStatus));
  }, [notifStatus]);

  useEffect(() => {
    localStorage.setItem("notif_keuangan", String(notifKeuangan));
  }, [notifKeuangan]);

  const handleNotificationToggle = async (
    type: string,
    currentValue: boolean,
    setter: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    if (!currentValue) {
      setter(true); // Save to state immediately

      let title = "";
      let body = "";

      if (type === "agenda") {
        title = "Pengingat Agenda Aktif";
        body = "Test: Anda akan menerima notifikasi pengingat agenda.";
      } else if (type === "status") {
        title = "Notifikasi Status Aktif";
        body =
          "Test: Anda akan menerima notifikasi ketika status agenda berubah.";
      } else if (type === "keuangan") {
        title = "Notifikasi Keuangan Aktif";
        body =
          "Test: Anda akan menerima notifikasi ketika ada perubahan keuangan umum.";
      }

      try {
        if ("Notification" in window && "serviceWorker" in navigator) {
          let permission = Notification.permission;
          if (permission !== "granted" && permission !== "denied") {
            permission = await Notification.requestPermission();
          }

          if (permission === "granted") {
            try {
              // Mainkan notifikasi custom test
              const audio = new Audio('/audio/notifikasi.mp3');
              audio.play().catch(e => console.error("Audio test play failed:", e));

              let registration = await navigator.serviceWorker.getRegistration();
              if (!registration) {
                registration = await navigator.serviceWorker.register('/sw.js');
                await navigator.serviceWorker.ready;
              }
              if (registration && registration.showNotification) {
                registration.showNotification(title, { 
                  body: body,
                  icon: '/gambar/logo.png',
                  badge: '/gambar/logo.png',
                  vibrate: [200, 100, 200, 100, 200, 100, 200]
                });
              } else {
                new Notification(title, { body, icon: '/gambar/logo.png', badge: '/gambar/logo.png', vibrate: [200, 100, 200] });
              }
            } catch (err) {
              const audio = new Audio('/audio/notifikasi.mp3');
              audio.play().catch(e => console.error(e));
              new Notification(title, { body, icon: '/gambar/logo.png' });
            }
          } else {
            alert(title + "\n" + body + "\n\n(Izin notifikasi desktop diblokir browser, Anda tetap akan menerima pesan peringatan dalam aplikasi)");
          }
        } else if ("Notification" in window) {
           let permission = Notification.permission;
           if (permission === 'granted') {
             new Notification(title, { body, icon: '/gambar/logo.png' });
           } else {
             alert(title + "\n\n" + body);
           }
        } else {
          alert(title + "\n\n" + body);
        }
      } catch (error) {
         // Fallback if inside restricted iframe
         alert(title + "\n\n" + body);
      }
    } else {
      setter(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Aligned Header: Title and Seekbar toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="hidden sm:block">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            <Trans>Pengaturan</Trans>
          </h1>
          <p className="text-sm text-slate-500">
            <Trans>Kelola akun dan preferensi aplikasi Anda.</Trans>
          </p>
        </div>
        <div className="flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto">
          {/* Theme Seekbar Indicator */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/50 flex-shrink-0">
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                theme === "light"
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              title="Terang"
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden sm:inline"><Trans>Terang</Trans></span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                theme === "dark"
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              title="Gelap"
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline"><Trans>Gelap</Trans></span>
            </button>
          </div>

          {/* Language Seekbar Indicator */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/50 flex-shrink-0">
            <button
              onClick={() => setLanguage("id")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                language === "id"
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <span>Indonesia</span>
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                language === "en"
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <span>English</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full-width Stack of Cards (Informasi Akun) */}
      <div className="space-y-6">
        {/* Informasi Akun */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-600" />
              <Trans>Akun</Trans>
            </h2>
            {user && (
              <div className="flex items-center gap-2">
                {!isEditingMode ? (
                  <button
                    onClick={() => setIsEditingMode(true)}
                    className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors border border-transparent hover:border-brand-100"
                    title="Edit Profil"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditingMode(false)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                      title="Batal"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleSaveUser}
                      disabled={isSaving}
                      className="p-2 text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm"
                      title="Simpan"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {!user ? (
            <div className="p-8 flex flex-col items-center justify-center border-t border-slate-100">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Belum Login
              </h2>
              <p className="text-slate-500 text-sm mb-6 max-w-sm text-center">
                Anda belum masuk ke akun. Silakan login untuk mengelola profil
                dan preferensi.
              </p>

              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors shadow-sm flex items-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Masuk ke Akun
              </button>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Bagian 1: Gambar / Avatar */}
                <div className="md:col-span-2 flex justify-center md:justify-start">
                  <div className="w-24 h-24 bg-brand-50 border-2 border-brand-100 text-brand-600 rounded-full flex items-center justify-center flex-shrink-0 text-4xl font-extrabold shadow-inner select-none pointer-events-none">
                    {user.nama
                      ? user.nama
                          .split(" ")
                          .map((n: string) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : "US"}
                  </div>
                </div>

                {/* Bagian 2: Nama, Jabatan, NIM */}
                <div className="md:col-span-5 space-y-2 text-center md:text-left">
                  <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
                    {user.jabatan} - {user.divisi}
                  </span>

                  {isEditingMode ? (
                    <div className="space-y-3 mt-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 text-left">
                          Nama Lengkap
                        </label>
                        <input
                          type="text"
                          value={editUserForm.nama}
                          onChange={(e) =>
                            setEditUserForm({
                              ...editUserForm,
                              nama: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 text-left">
                          NIM
                        </label>
                        <input
                          type="tel"
                          value={editUserForm.nim}
                          onChange={(e) =>
                            setEditUserForm({
                              ...editUserForm,
                              nim: e.target.value.replace(/\D/g, ""),
                            })
                          }
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 text-left">
                          Jabatan
                        </label>
                        <input
                          type="text"
                          value={user.jabatan}
                          readOnly
                          className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 text-left">
                          Divisi
                        </label>
                        <input
                          type="text"
                          value={user.divisi}
                          readOnly
                          className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight mt-0.5">
                        {user.nama}
                      </h3>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 flex items-center justify-center md:justify-start gap-1">
                        <span>NIM:</span>
                        <span className="text-slate-700 select-all font-mono font-bold">
                          {user.nim || "-"}
                        </span>
                      </div>
                    </>
                  )}
                  {!isEditingMode && (
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 flex items-center justify-center md:justify-start gap-1">
                      <span>ID:</span>
                      <span className="text-slate-700 select-all font-mono font-bold">
                        {user.id}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bagian 3: Kontak (List Vertikal) */}
                <div className="md:col-span-5 space-y-3 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-8 flex flex-col justify-center">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg flex-shrink-0">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0 w-full">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                        Email
                      </p>
                      {isEditingMode ? (
                        <input
                          type="email"
                          value={editUserForm.email}
                          onChange={(e) =>
                            setEditUserForm({
                              ...editUserForm,
                              email: e.target.value,
                            })
                          }
                          className="w-full mt-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        />
                      ) : (
                        <p className="text-xs font-semibold text-slate-700 truncate mt-1 select-all">
                          {user.email || "-"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg flex-shrink-0">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0 w-full">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider leading-none">
                        Telepon / WA
                      </p>
                      {isEditingMode ? (
                        <div className="relative mt-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-emerald-700/70 text-sm font-bold">
                              +62
                            </span>
                          </div>
                          <input
                            type="tel"
                            value={editUserForm.telepon}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, "");
                              if (val.startsWith("62")) val = val.substring(2);
                              else if (val.startsWith("0"))
                                val = val.substring(1);
                              const match = val.match(
                                /^(\d{0,3})(\d{0,4})(\d{0,4})(\d{0,4})/,
                              );
                              const formatted = match
                                ? match.slice(1).filter(Boolean).join("-")
                                : val;
                              setEditUserForm({
                                ...editUserForm,
                                telepon: formatted,
                              });
                            }}
                            className="w-full pl-11 pr-3 py-1.5 bg-emerald-50/50 border border-emerald-200/50 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                      ) : (
                        <p className="text-xs font-semibold text-slate-700 truncate mt-1 select-all">
                          {user.telepon || "-"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 flex justify-center bg-slate-50">
                <button
                  onClick={logout}
                  className="w-full sm:w-auto px-6 py-2 text-rose-600 font-bold hover:bg-rose-100 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Notifikasi */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-brand-600" />
              Notifikasi
            </h2>
          </div>
          <div className="p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Pengingat Agenda
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dapatkan pemberitahuan untuk agenda yang akan datang.
                </p>
              </div>
              <div
                onClick={() =>
                  handleNotificationToggle(
                    "agenda",
                    notifAgenda,
                    setNotifAgenda,
                  )
                }
                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${notifAgenda ? "bg-brand-600" : "bg-slate-300"}`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${notifAgenda ? "translate-x-6" : "translate-x-0"}`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Ketika Status Agenda Berubah
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Beritahu saya ketika status suatu agenda diperbarui.
                </p>
              </div>
              <div
                onClick={() =>
                  handleNotificationToggle(
                    "status",
                    notifStatus,
                    setNotifStatus,
                  )
                }
                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${notifStatus ? "bg-brand-600" : "bg-slate-300"}`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${notifStatus ? "translate-x-6" : "translate-x-0"}`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Ketika Keuangan Umum Berubah
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dapatkan peringatan ketika terdapat penambahan atau pemakaian
                  dana kas.
                </p>
              </div>
              <div
                onClick={() =>
                  handleNotificationToggle(
                    "keuangan",
                    notifKeuangan,
                    setNotifKeuangan,
                  )
                }
                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${notifKeuangan ? "bg-brand-600" : "bg-slate-300"}`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${notifKeuangan ? "translate-x-6" : "translate-x-0"}`}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Install Aplikasi */}
        {(!isInstalled && isInstallable) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center"
          >
            <button
              onClick={install}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl shadow-sm border tracking-wide font-bold transition-all active:scale-[0.98] max-w-md bg-brand-600 text-white border-brand-500 hover:bg-brand-700 hover:shadow-md"
            >
              <svg
                className="w-5 h-5 z-10"
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
              <span>Install Aplikasi</span>
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
