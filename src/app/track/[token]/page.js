import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function TrackPage({ params }) {
  // În Next.js 15, params este async → trebuie await
  const { token } = await params;

  if (!token) return notFound();

  // Căutăm fișa după publicToken
  const device = await prisma.device.findFirst({
    where: { publicToken: token },
    include: {
      client: true,
      repairs: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!device) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700 dark:text-gray-300">
        Cod invalid sau fișă inexistentă.
      </div>
    );
  }

  const repair = device.repairs?.[0] || null;

  const statusSteps = [
    "Primire",
    "Diagnosticare",
    "În lucru",
    "Finalizat",
    "Predat",
  ];

  const currentIndex = statusSteps.indexOf(device.status);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-4 py-10">
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">

        {/* LOGO */}
        <div className="flex justify-center mb-5">
          <img
            src="/logo.png"
            className="w-20 h-20 object-contain"
            alt="Logo"
          />
        </div>

        <h1 className="text-2xl font-bold text-center">
          Status fișă service
        </h1>

        <p className="text-center text-gray-500 mt-1">
          Cod urmărire: <b>{device.formCode}</b>
        </p>

        {/* STATUS */}
        <div className="mt-6 text-center">
          <span className="inline-block px-4 py-2 rounded-full text-white text-sm font-medium bg-blue-600">
            {device.status}
          </span>
        </div>

{/* WIZARD PROGRES */}
<div className="relative mt-10 mb-6">
  {/* LINIA DIN SPATE */}
  <div className="absolute top-3 left-0 right-0 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>

  {/* LINIA ACTIVĂ */}
  <div
    className="absolute top-3 left-0 h-1 bg-blue-600 rounded-full transition-all duration-500"
    style={{
      width: `${((currentIndex + 1) / statusSteps.length) * 100}%`,
    }}
  ></div>

  {/* BULINE + TEXTE */}
  <div className="relative flex justify-between">
    {statusSteps.map((step, index) => (
      <div key={step} className="flex flex-col items-center w-full">
        {/* BULINĂ */}
        <div
          className={`
            w-6 h-6 rounded-full flex items-center justify-center border
            transition-all duration-300
            ${
              index <= currentIndex
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-600 text-gray-400"
            }
          `}
        >
          {index + 1}
        </div>

        {/* TEXT */}
        <span
          className={`mt-2 text-[11px] font-medium text-center ${
            index <= currentIndex
              ? "text-blue-700 dark:text-blue-400"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {step}
        </span>
      </div>
    ))}
  </div>
</div>

        {/* DEVICE INFO */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
          <h2 className="font-semibold text-lg mb-3">Detalii dispozitiv</h2>

          <p>
            <b>Tip:</b> {device.deviceType || "-"}
          </p>
          <p>
            <b>Marcă:</b> {device.brand || "-"}
          </p>
          <p>
            <b>Model:</b> {device.model || "-"}
          </p>
          <p>
            <b>Serie:</b> {device.serialNumber || "-"}
          </p>

          <h3 className="font-semibold mt-4">Problemă reclamată</h3>
          <p className="text-sm">{device.problem || "-"}</p>
        </div>

        {/* OPTIONAL: DIAGNOSTIC */}
        {repair?.diagnostic && (
          <div className="mt-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
            <h2 className="font-semibold text-lg mb-2">Diagnostic service</h2>
            <p className="text-sm">{repair.diagnostic}</p>
          </div>
        )}

        <div className="mt-8 text-xs text-gray-500 text-center">
          Ultima actualizare:{" "}
          {new Date(device.updatedAt || device.createdAt).toLocaleString(
            "ro-RO"
          )}
        </div>
      </div>
    </div>
  );
}