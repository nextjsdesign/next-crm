"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

export default function RoundedModal({ open, title, children, onClose, onSave }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="
        fixed inset-0 z-[9999]
        flex items-center justify-center
        bg-black/40 backdrop-blur-sm
        px-4
      "
      onClick={onClose}
    >
      <div
        className="
          bg-white dark:bg-gray-900
          rounded-2xl shadow-2xl
          p-6 w-full max-w-md mx-auto
          animate-[fadeIn_0.18s_ease-out]
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="space-y-4">{children}</div>

        {/* FOOTER */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            Anulează
          </button>

          <button
            onClick={onSave}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Salvează
          </button>
        </div>
      </div>
    </div>
  );
}