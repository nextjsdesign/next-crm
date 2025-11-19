"use client";

import { Printer, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrintPageButtons() {
  const router = useRouter();

  return (
    <div className="print:hidden w-[210mm] flex justify-between mb-4">
      <button
        onClick={() => window.print()}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow"
      >
        <Printer className="inline w-4 h-4 mr-1" />
        Printează
      </button>

      <button
        onClick={() => router.back()}
        className="px-4 py-2 bg-gray-300 text-black rounded-lg shadow"
      >
        <ArrowLeft className="inline w-4 h-4 mr-1" />
        Înapoi
      </button>
    </div>
  );
}