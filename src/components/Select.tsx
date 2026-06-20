import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Check } from "lucide-react";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Pilih opsi...",
  label,
  className = "",
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div
      className={`flex flex-col gap-1.5 relative ${className}`}
      ref={wrapperRef}
    >
      {label && (
        <label className="text-sm font-semibold text-slate-700">{label}</label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-500 bg-slate-50 flex items-center justify-between transition-colors hover:border-slate-300"
      >
        <span
          className={
            selectedOption ? "text-slate-900 font-medium" : "text-slate-400"
          }
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
          >
            <div className="p-1.5">
              {options.map((option, idx) => {
                const isSelected = value === option.value;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`px-3 py-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${isSelected ? "bg-brand-50 text-brand-700 font-medium" : "hover:bg-slate-50 text-slate-700"}`}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-brand-600" />}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
