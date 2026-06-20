import { Calendar as CalendarIcon } from "lucide-react";

interface KPPMCalendarProps {
  selectedDate: number;
  onSelectDate: (d: number) => void;
  agendasByDate: Record<number, number>;
}

export function KPPMCalendar({
  selectedDate,
  onSelectDate,
  agendasByDate,
}: KPPMCalendarProps) {
  // 31 days in July
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // July 2026 starts on Wednesday.
  // Jika minggu dimulai dari Senin:
  // 0 = Sen, 1 = Sel, 2 = Rab
  const blanks = Array.from({ length: 2 }, (_, i) => i);
  const weekDays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center">
      <div className="flex justify-between items-center w-full mb-6 relative">
        <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 flex-shrink-0" />
          Juli 2026
        </h3>
        <span className="text-[10px] bg-brand-50 text-brand-700 font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
          Pengabdian 30 Hari
        </span>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-7 gap-2 text-center mb-3">
          {weekDays.map((d, i) => (
            <div key={i} className="text-xs font-bold text-slate-400 py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {blanks.map((b) => (
            <div key={`blank-${b}`} className="p-2 md:p-3"></div>
          ))}
          {days.map((d) => {
            const agendaCount = agendasByDate[d] || 0;
            const hasAgenda = agendaCount > 0;
            const isSelected = selectedDate === d;

            return (
              <button
                key={d}
                onClick={() => onSelectDate(d)}
                className={`
                  aspect-square sm:aspect-auto sm:h-16 md:h-20 w-full text-base md:text-lg rounded-xl font-bold flex flex-col justify-center items-center relative transition-all
                  ${
                    isSelected
                      ? "bg-brand-600 text-white shadow-md scale-105 z-10"
                      : hasAgenda
                        ? "bg-brand-50/60 text-slate-700 hover:bg-brand-100"
                        : "text-slate-600 hover:bg-slate-50 bg-transparent"
                  }
                `}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
