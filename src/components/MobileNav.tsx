import React from "react";
import { Calendar, Home, Target } from "lucide-react";
import { Link } from "react-router-dom";

interface MobileNavProps {
  activeTab: string;
}

export function MobileNav({ activeTab }: MobileNavProps) {
  const mobileNavItems = [
    { id: "agenda", label: "Agenda", icon: Calendar },
    { id: "beranda", label: "Beranda", icon: Home },
    { id: "proker", label: "Proker", icon: Target },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100/50 z-50 shadow-[0_-6px_20px_rgba(0,0,0,0.08)]">
      <div className="flex justify-around items-end h-16 px-4 pb-2">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.id === "beranda") {
            return (
              <div
                key={item.id}
                className="relative flex flex-col items-center justify-end h-full w-20"
              >
                <Link
                  to={`/${item.id}`}
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg border-4 border-white -translate-y-3.5 ${
                    isActive
                      ? "bg-brand-600 ring-2 ring-brand-100"
                      : "bg-brand-500"
                  }`}
                  aria-label={item.label}
                >
                  <Icon className="w-6 h-6 text-white" />
                </Link>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wide transition-colors absolute bottom-[-1px] ${isActive ? "text-brand-600" : "text-slate-500"}`}
                >
                  {item.label}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.id}
              to={`/${item.id}`}
              className={`flex flex-col items-center justify-center w-20 h-full pb-1 space-y-1 ${
                isActive ? "text-brand-600" : "text-slate-400"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-brand-50" : "bg-transparent"}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] uppercase font-bold tracking-wide ${isActive ? "text-brand-600" : "text-slate-500"}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
