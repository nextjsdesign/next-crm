import { prisma } from "../../../lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  ClipboardList,
  Smartphone,
  User,
  Wrench,
} from "lucide-react";

export default async function DeviceDetailsPage(props) {
  const params = await props.params; // ✅ Next.js 16 necesită await
  const id = params?.id;

  console.log("🔍 Parametru primit:", id);

  if (!id) {
    console.error("❌ ID invalid sau lipsă:", params);
    return notFound();
  }

  let device = null;

  try {
    // încearcă după id
    device = await prisma.device.findUnique({
      where: { id },
      include: { client: true },
    });

    // dacă nu merge, încearcă după _id
    if (!device) {
      device = await prisma.device.findFirst({
        where: { _id: id },
        include: { client: true },
      });
    }
  } catch (err) {
    console.error("❌ Eroare Prisma:", err);
  }

  if (!device) {
    console.error("❌ Fișă negăsită pentru ID:", id);
    return notFound();
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Reparat":
        return "bg-green-100 text-green-800";
      case "În așteptare":
        return "bg-yellow-100 text-yellow-800";
      case "Garanție":
        return "bg-blue-100 text-blue-800";
      case "Refuzat":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
          <ClipboardList className="w-7 h-7 text-blue-600" /> Detalii fișă service
        </h1>
        <Link
          href="/devices"
          className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 transition"
        >
          <ArrowLeft className="w-5 h-5" /> Înapoi la listă
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Info client */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <User className="w-5 h-5 text-blue-500" /> Client
          </h2>
          <p><b>Nume:</b> {device.client?.name || "—"}</p>
          <p><b>Telefon:</b> {device.client?.phone || "—"}</p>
          <p><b>Email:</b> {device.client?.email || "—"}</p>
        </div>

        {/* Info dispozitiv */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <Smartphone className="w-5 h-5 text-blue-500" /> Dispozitiv
          </h2>
          <p><b>Tip:</b> {device.deviceType || "—"}</p>
          <p><b>Marcă:</b> {device.brand || "—"}</p>
          <p><b>Model:</b> {device.model || "—"}</p>
          <p><b>Serie:</b> {device.serialNumber || "—"}</p>
        </div>

        {/* Problemă */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <Wrench className="w-5 h-5 text-blue-500" /> Descriere / Problemă
          </h2>
          <p>{device.problem || device.description || "—"}</p>
          {device.notes && (
            <p className="text-sm italic text-gray-500 mt-2">
              📝 Observații: {device.notes}
            </p>
          )}
        </div>

        {/* Detalii service */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <Calendar className="w-5 h-5 text-blue-500" /> Detalii service
          </h2>
          <div className="grid sm:grid-cols-2 gap-2">
            <p><b>Data primirii:</b> {new Date(device.createdAt).toLocaleDateString("ro-RO")}</p>
            <p><b>Data livrării:</b> {device.deliveryDate ? new Date(device.deliveryDate).toLocaleDateString("ro-RO") : "—"}</p>
            <p><b>Tehnician:</b> {device.technician || "—"}</p>
            <p><b>Preț estimativ:</b> {device.priceEstimate ? `${device.priceEstimate} lei` : "—"}</p>
            <p><b>Status:</b> <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(device.status)}`}>{device.status}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}