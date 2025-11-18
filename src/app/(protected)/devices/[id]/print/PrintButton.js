"use client";

import { Printer } from "lucide-react";

export default function PrintButton({ id }) {
  return (
    <button
      onClick={() => window.open(`/devices/${id}/print`, "_blank")}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
    >
      <Printer className="w-5 h-5" />
      Print
    </button>
  );
}