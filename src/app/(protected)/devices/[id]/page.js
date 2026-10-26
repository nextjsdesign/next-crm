import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import PrintButton from "./PrintButton"; // ← componentă CLIENT

import {
  ArrowLeft,
  Calendar,
  ClipboardList,
  Smartphone,
  User,
  Wrench,
  MessageCircle,
  Pencil,
  Printer,
  Phone,
  ChevronRight,
} from "lucide-react";

export default async function DeviceDetailsPage(props) {
  // 🔥 În Next.js 15/16, params este async → necesită await
  const params = await props.params;
  const id = params?.id;

  if (!id) return notFound();

  // 📌 Luăm fișa din DB
  let device = null;
  try {
    device = await prisma.device.findUnique({
      where: { id },
      include: { client: true },
    });
  } catch (err) {
    console.error("❌ Eroare Prisma:", err);
  }

  if (!device) return notFound();

  // 🎨 Culori status
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

  const rawPhone = (device.client?.phone || "").replace(/[^\d]/g, "");
  const whatsappPhone = rawPhone.startsWith("0") ? "40" + rawPhone.slice(1) : rawPhone;
  const whatsappText = `Bună ziua! Vă contactăm de la Devize Service în legătură cu fișa ${device.formCode || ""}.`;
  const deviceLabel = [device.deviceType, device.brand, device.model].filter(Boolean).join(" ");
  const formattedDate = new Date(device.createdAt).toLocaleDateString("ro-RO");
  const formattedPrice = device.priceEstimate != null ? `${device.priceEstimate} RON` : "—";

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-0 py-1 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300"><ArrowLeft size={18}/> Înapoi</Link>
        <h1 className="text-base font-bold text-slate-900 dark:text-white sm:text-xl">Detalii fișă</h1>
        <PrintButton deviceId={id} />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-white">{device.formCode || "Fișă service"}</span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(device.status)}`}>{device.status || "—"}</span>
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{device.client?.name || "Client necunoscut"}</h2>
        {device.client?.phone && <a href={`tel:${rawPhone}`} className="mt-1 inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400"><Phone size={14}/>{device.client.phone}</a>}
        <p className="mt-3 text-sm font-medium text-slate-800 dark:text-slate-200">{deviceLabel || "Dispozitiv"}</p>
        {device.serialNumber && <p className="mt-1 text-xs text-slate-500">SN: {device.serialNumber}</p>}
        <div className="mt-4 rounded-xl bg-rose-50 px-3 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">{device.problem || device.description || "Defect nespecificat"}</div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {[
            { label: "Data intrării", value: formattedDate, icon: Calendar },
            { label: "Preț estimat", value: formattedPrice, icon: ClipboardList },
            { label: "Tehnician", value: device.technician || "—", icon: User },
            { label: "Status", value: device.status || "—", icon: Wrench },
          ].map((item) => {
            const Icon = item.icon;
            return <div key={item.label} className="min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40"><div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400"><Icon size={14}/>{item.label}</div><div className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-white">{item.value}</div></div>;
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Observații și detalii</h3>
        <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-900/40 dark:text-slate-200">{device.notes || "Nu există observații adăugate."}</div>
        {device.client?.email && <p className="mt-3 text-xs text-slate-500">Email: {device.client.email}</p>}
      </section>

      {whatsappPhone ? (
        <a href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappText)}`} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
          <MessageCircle size={19}/> Trimite mesaj WhatsApp
        </a>
      ) : <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center text-xs text-amber-800">Clientul nu are un număr de telefon în fișă.</div>}

      <section className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Acțiuni rapide</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link href={`/devices/${id}?edit=1`} className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-center text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><Pencil size={21}/> Editează fișa</Link>
          <Link href={`/devices/${id}/repair`} className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-center text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><Wrench size={21}/> Fișă reparație</Link>
        </div>
      </section>
    </div>
  );
}
