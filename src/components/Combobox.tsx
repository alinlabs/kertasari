import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";

interface ComboboxProps {
  items: any[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  label?: string;
  getItemLabel: (item: any) => string;
  getItemValue?: (item: any) => string;
  allowCustomValue?: boolean;
}

export function Combobox({
  items,
  value,
  onChange,
  placeholder,
  label,
  getItemLabel,
  getItemValue,
  allowCustomValue = false,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getDisplayValue = (val: string) => {
    if (!val) return "";
    const item = items.find((i) => {
      const itemVal = getItemValue ? getItemValue(i) : getItemLabel(i);
      return itemVal === val;
    });
    return item ? getItemLabel(item) : val;
  };

  const [inputValue, setInputValue] = useState(getDisplayValue(value));
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setInputValue(getDisplayValue(value));
    }
  }, [value, isOpen, items]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setInputValue(getDisplayValue(value));
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value, items]);

  const filteredItems = items.filter((item) =>
    getItemLabel(item).toLowerCase().includes(inputValue.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-1.5 relative" ref={wrapperRef}>
      {label && (
        <label className="text-sm font-semibold text-slate-700">{label}</label>
      )}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onClick={() => {
            setInputValue(""); // Clear input on click so user can search
            setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-brand-500 bg-white"
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
          >
            {filteredItems.length > 0 ? (
              <div className="p-1">
                {filteredItems.map((item, idx) => {
                  const itemLabel = getItemLabel(item);
                  const itemVal = getItemValue ? getItemValue(item) : itemLabel;
                  const isSelected = value === itemVal;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (isSelected) {
                          onChange(""); // Deselect
                        } else {
                          onChange(itemVal);
                        }
                        setIsOpen(false);
                      }}
                      className={`px-3 py-2.5 rounded-lg flex items-center gap-3 cursor-pointer transition-colors ${isSelected ? "bg-brand-50 text-brand-700" : "hover:bg-slate-50 text-slate-700"}`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300"}`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <span className="text-sm font-medium">{itemLabel}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-slate-500">
                Tidak ada hasil ditemukan.
              </div>
            )}

            {allowCustomValue &&
              inputValue.trim().length > 0 &&
              !items.find(
                (i) =>
                  getItemLabel(i).toLowerCase() ===
                  inputValue.trim().toLowerCase(),
              ) && (
                <div
                  className="p-2 border-t border-slate-100"
                  onClick={() => {
                    onChange(inputValue.trim());
                    setIsOpen(false);
                  }}
                >
                  <div className="px-3 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-brand-50 text-brand-700 transition-colors">
                    <div className="w-5 h-5 rounded-full border border-dashed border-brand-400 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-brand-500" />
                    </div>
                    <span className="text-sm font-semibold">
                      Gunakan "{inputValue.trim()}"
                    </span>
                  </div>
                </div>
              )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
