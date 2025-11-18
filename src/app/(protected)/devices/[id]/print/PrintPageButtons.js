"use client";

import { useRouter } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";

export default function PrintPageButtons({ id }) {
  const router = useRouter();

  return (
    <div className="flex justify-between mb-6 print:hidden">
      <button
        onClick={() => router.back()}
        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded-lg flex items-center gap-2"
      >
        <ArrowLeft size={18} />
        Înapoi
      </button>

      <button
        onClick={() => window.print()}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
      >
        <Printer size={18} />
        Prin­tează
      </button>
    </div>
  );
}