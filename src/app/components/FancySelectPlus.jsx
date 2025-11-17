"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus } from "lucide-react";

export default function FancySelectPlus({
  label,
  value,
  options,
  onChange,
  onAddNew,
  disableAdd = false, // 🔵 dacă e TRUE, nu arătăm PLUS-ul
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // 🔥 Închide dropdown când dai click în afară
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="w-full mb-4 relative" ref={containerRef}>
      {label && (
        <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      {/* FIELD PRINCIPAL */}
      <div
        onClick={() => setOpen((prev) => !prev)}
        className="
          flex items-center justify-between
          w-full h-[48px]
          bg-white dark:bg-gray-900
          border border-gray-300 dark:border-gray-700
          rounded-xl px-4
          cursor-pointer select-none
          focus-within:ring-2 focus-within:ring-blue-600
        "
      >
        <span
          className={`
            text-gray-700 dark:text-gray-200
            ${!value ? "text-gray-400" : ""}
          `}
        >
          {value || "Selectează o opțiune"}
        </span>

        <div className="flex items-center gap-2">

          {/* ▼ arrow */}
          <ChevronDown
            size={18}
            className={`text-gray-500 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />

          {/* separator */}
          {!disableAdd && (
            <div className="w-[1px] h-6 bg-gray-300 dark:bg-gray-600" />
          )}

          {/* ➕ PLUS – apare doar dacă disableAdd = false */}
          {!disableAdd && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddNew();
              }}
              className="
                w-7 h-7 rounded-lg flex items-center justify-center
                bg-blue-600 hover:bg-blue-700 text-white
              "
            >
              <Plus size={16} />
            </button>
          )}
        </div>
      </div>

      {/* DROPDOWN */}
      {open && (
        <div
          className="
            absolute mt-2 w-full 
            bg-white dark:bg-gray-900
            rounded-xl border border-gray-200 dark:border-gray-700
            shadow-xl z-50
            max-h-64 overflow-auto
            p-1
          "
        >
          {options.map((opt, index) => (
            <div
              key={index}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className="
                px-4 py-2 rounded-lg text-gray-800 dark:text-gray-200
                hover:bg-blue-50 dark:hover:bg-gray-700
                cursor-pointer
              "
            >
              {opt}
            </div>
          ))}

          {options.length === 0 && (
            <div className="px-4 py-2 text-gray-400 text-sm">
              Nicio opțiune disponibilă
            </div>
          )}
        </div>
      )}
    </div>
  );
}