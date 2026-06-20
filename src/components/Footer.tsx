import React from "react";

export function Footer() {
  return (
    <footer className="hidden md:block bg-white border-t border-slate-200 py-8 mt-12 pb-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <img
            src="/gambar/logo.png"
            alt="Logo KPPM"
            className="w-8 h-8 object-contain"
          />
          <div>
            <h2 className="font-bold text-sm text-slate-900">KPPM Kertasari</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              2026
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-500 text-center md:text-right">
          © {new Date().getFullYear()} KPPM Desa Kertasari. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
