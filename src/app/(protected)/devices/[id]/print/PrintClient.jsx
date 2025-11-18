// src/app/(protected)/devices/[id]/print/PrintClient.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";

export default function PrintClient({ deviceId }) {
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔄 încărcăm fișa din API
  useEffect(() => {
    if (!deviceId) return;

    const load = async () => {
      try {
        const res = await fetch(`/api/devices/${deviceId}`);
        if (!res.ok) {
          console.error("Eroare la fetch /api/devices/[id]");
          setDevice(null);
        } else {
          const data = await res.json();
          setDevice(data);
        }
      } catch (err) {
        console.error("❌ Eroare fetch device pentru print:", err);
        setDevice(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [deviceId]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-600 dark:text-gray-300">
        Se încarcă fișa...
      </div>
    );
  }

  if (!device) {
    return (
      <div className="p-6 space-y-3 text-gray-600 dark:text-gray-300">
        <p>Nu am găsit fișa de service.</p>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100"
        >
          <ArrowLeft size={16} />
          Înapoi
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      {/* Bara de sus: butoane care NU se printează */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Fișă service – print
        </h1>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow"
          >
            <Printer size={16} />
            Printează
          </button>

          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 text-sm"
          >
            <ArrowLeft size={16} />
            Înapoi
          </button>
        </div>
      </div>

      {/* ZONA PRINTABILĂ */}
      <div className="bg-white text-black rounded-xl shadow-sm p-6 sm:p-8 print:shadow-none print:rounded-none">
        {/* Header cu logo și cod fișă */}
        <div className="flex items-start justify-between gap-4 mb-6 border-b pb-4">
          <div>
            <h2 className="text-lg font-semibold">ProComputer – Fișă service</h2>
            <p className="text-xs text-gray-600 mt-1">
              Cod fișă: <b>{device.formCode}</b>
            </p>
            <p className="text-xs text-gray-600">
              Data primirii:{" "}
              {device.createdAt
                ? new Date(device.createdAt).toLocaleDateString("ro-RO")
                : "-"}
            </p>
          </div>

          <div className="text-right">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-16 h-16 object-contain inline-block mb-1"
            />
            <p className="text-[10px] text-gray-500">
              www.procomputer.ro
            </p>
          </div>
        </div>

        {/* Client + Dispozitiv */}
        <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
          <div>
            <h3 className="font-semibold mb-2 border-b pb-1">Date client</h3>
            <p>
              <b>Nume:</b> {device.client?.name || "—"}
            </p>
            <p>
              <b>Telefon:</b> {device.client?.phone || "—"}
            </p>
            <p>
              <b>Email:</b> {device.client?.email || "—"}
            </p>
            {device.client?.address && (
              <p>
                <b>Adresă:</b> {device.client.address}
              </p>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-2 border-b pb-1">Date dispozitiv</h3>
            <p>
              <b>Tip:</b> {device.deviceType || "—"}
            </p>
            <p>
              <b>Marcă:</b> {device.brand || "—"}
            </p>
            <p>
              <b>Model:</b> {device.model || "—"}
            </p>
            <p>
              <b>Serie:</b> {device.serialNumber || "—"}
            </p>
          </div>
        </div>

        {/* Problemă + Observații */}
        <div className="mb-6 text-sm">
          <h3 className="font-semibold mb-2 border-b pb-1">
            Problemă reclamată
          </h3>
          <p className="min-h-[60px]">
            {device.problem || device.description || "—"}
          </p>

          {device.notes && (
            <>
              <h4 className="font-semibold mt-4 mb-1">Observații interne</h4>
              <p className="text-xs text-gray-700 min-h-[40px]">
                {device.notes}
              </p>
            </>
          )}
        </div>

        {/* Detalii service / bani */}
        <div className="grid grid-cols-2 gap-6 text-sm mb-8">
          <div>
            <h3 className="font-semibold mb-2 border-b pb-1">
              Detalii service
            </h3>
            <p>
              <b>Status:</b> {device.status || "—"}
            </p>
            <p>
              <b>Tehnician:</b> {device.technician || "—"}
            </p>
            {device.deliveryDate && (
              <p>
                <b>Termen estimat:</b>{" "}
                {new Date(device.deliveryDate).toLocaleDateString("ro-RO")}
              </p>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-2 border-b pb-1">
              Detalii financiare
            </h3>
            <p>
              <b>Preț estimat:</b>{" "}
              {device.priceEstimate
                ? `${device.priceEstimate} lei`
                : "—"}
            </p>
            <p>
              <b>Avans:</b>{" "}
              {device.advance ? `${device.advance} lei` : "—"}
            </p>
          </div>
        </div>

        {/* Semnături */}
        <div className="grid grid-cols-2 gap-8 text-xs mt-10">
          <div className="text-center">
            <div className="border-t border-gray-400 w-40 mx-auto mb-1" />
            Client
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 w-40 mx-auto mb-1" />
            Recepționat de
          </div>
        </div>
      </div>
    </div>
  );
}