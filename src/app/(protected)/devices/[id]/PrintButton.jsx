"use client";

import { useRouter } from "next/navigation";
import { Printer } from "lucide-react";

export default function PrintButton({ deviceId }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/devices/${deviceId}/print`)}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
    >
      <Printer className="w-5 h-5" />
      Printează fișa
    </button>
  );
}