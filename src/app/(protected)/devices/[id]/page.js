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
  Pencil,
  Phone,
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
      include: { client: true, repairs: { include: { items: true, historyNotes: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } } }, orderBy: { createdAt: "desc" }, take: 1 } },
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

  const repair = device.repairs?.[0] || null;
  const query = await props.searchParams;
  const activeTab = ["detalii", "diagnosticare", "interventii", "piese", "note"].includes(query?.tab) ? query.tab : "detalii";
  const tabs = [{ id: "detalii", label: "Detalii" }, { id: "diagnosticare", label: "Diagnosticare" }, { id: "interventii", label: "Intervenții" }, { id: "piese", label: "Piese" }, { id: "note", label: "Note" }];
  const dateTime = (value) => new Date(value).toLocaleString("ro-RO", { dateStyle: "short", timeStyle: "short" });
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
        {device.client?.phone && <a href={`tel:${device.client.phone}`} className="mt-1 inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400"><Phone size={14}/>{device.client.phone}</a>}
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

      <nav aria-label="Secțiuni fișă" className="flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-700">
        {tabs.map((tab) => <Link key={tab.id} href={`/devices/${id}?tab=${tab.id}`} scroll={false} aria-current={activeTab === tab.id ? "page" : undefined} className={`shrink-0 border-b-2 px-3 py-3 text-xs font-medium transition-colors ${activeTab === tab.id ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 dark:text-slate-400"}`}>{tab.label}</Link>)}
      </nav>

      <section className="min-h-36 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {activeTab === "detalii" && <div className="space-y-4">
          <div><h3 className="text-sm font-semibold text-slate-900 dark:text-white">Descriere problemă</h3><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{device.problem || device.description || "Nu există o descriere."}</p></div>
          <div className="border-t border-slate-100 pt-3 dark:border-slate-700"><h3 className="text-sm font-semibold text-slate-900 dark:text-white">Informații suplimentare</h3><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{device.receptionNotes || device.description || "—"}</p></div>
        </div>}
        {activeTab === "diagnosticare" && <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Defecte identificate / Diagnostic</h3>
          <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-200">{repair?.diagnostic || "Nu există încă un diagnostic înregistrat."}</p>
          {repair?.notes && <><h4 className="text-xs font-semibold text-slate-500">Observații tehnician</h4><p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{repair.notes}</p></>}
          <Link href={`/devices/${id}/repair`} className="block rounded-xl bg-blue-50 p-3 text-center text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Deschide fișa cu operațiuni</Link>
        </div>}
        {activeTab === "interventii" && <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Intervenții efectuate</h3>
          {(repair?.items || []).filter((item) => item.kind === "labor").length ? (repair.items.filter((item) => item.kind === "labor").map((item) => <div key={item.id} className="rounded-xl border border-slate-100 p-3 dark:border-slate-700"><p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p><p className="mt-1 text-xs text-slate-500">{item.qty} × {item.unitPrice} RON</p></div>)) : <p className="text-sm text-slate-500">Nu există intervenții înregistrate.</p>}
          <Link href={`/devices/${id}/repair`} className="block rounded-xl bg-blue-50 p-3 text-center text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Adaugă / editează intervenții</Link>
        </div>}
        {activeTab === "piese" && <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Piese utilizate</h3>
          {(repair?.items || []).filter((item) => item.kind === "part").length ? (repair.items.filter((item) => item.kind === "part").map((item) => <div key={item.id} className="rounded-xl border border-slate-100 p-3 dark:border-slate-700"><p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p><p className="mt-1 text-xs text-slate-500">{item.qty} × {item.unitPrice} RON</p></div>)) : <p className="text-sm text-slate-500">Nu există piese înregistrate.</p>}
          <Link href={`/devices/${id}/repair`} className="block rounded-xl bg-blue-50 p-3 text-center text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Gestionează piesele</Link>
        </div>}
        {activeTab === "note" && <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Note și observații</h3>
          {device.notes && <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-200">{device.notes}</p>}
          {(repair?.historyNotes || []).map((note) => <div key={note.id} className="rounded-xl border border-slate-100 p-3 dark:border-slate-700"><p className="whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200">{note.message}</p><p className="mt-2 text-xs text-slate-500">{note.user?.name || "Tehnician"} · {dateTime(note.createdAt)}</p></div>)}
          {!device.notes && !repair?.historyNotes?.length && <p className="text-sm text-slate-500">Nu există note înregistrate.</p>}
          <Link href={`/devices/${id}/repair`} className="block rounded-xl bg-blue-50 p-3 text-center text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Adaugă notă în fișa cu operațiuni</Link>
        </div>}
      </section>

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
