"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useTabStyle from "@/hooks/useTabStyle";
import {
  Search,
  SlidersHorizontal,
  Columns3,
  Eye,
  Pencil,
  Trash2,
  Plus,
  Wrench
} from "lucide-react";

const STATUS_TABS = [
  { value: "all", label: "Toate" },
  { value: "Primire", label: "Primire" },
  { value: "Diagnosticare", label: "Diagnosticare" },
  { value: "Nspf", label: "NPSF" },
  { value: "Așteaptă piese", label: "Așteaptă piese" },
  { value: "În lucru", label: "În lucru" },
  { value: "Finalizat", label: "Finalizat" },
  { value: "Predat", label: "Predat" },
  { value: "Refuzat", label: "Refuzat" },
];

const DEFAULT_COLUMNS = {
  client: true,
  phone: true, // controlează arătarea telefonului+email-ului sub nume
  device: true,
  model: true, // controlează arătarea seriei sub dispozitiv
  status: true,
  technician: true,
  price: true,
  createdAt: true,
};

const COLUMNS_STORAGE_KEY = "devices_visible_columns_v1";
const ITEMS_PER_PAGE = 10;

export default function DevicesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [devices, setDevices] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_COLUMNS);
  const [showColumns, setShowColumns] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const filterRef = useRef(null);
  const columnsRef = useRef(null);

  const { style } = useTabStyle();

  // 🔐 Protecție acces
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
    }
  }, [status, session, router]);

  // 🧩 Încarcă preferințele de coloane din localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem(COLUMNS_STORAGE_KEY);
      if (saved) {
        setVisibleColumns((prev) => ({
          ...prev,
          ...JSON.parse(saved),
        }));
      }
    } catch (err) {
      console.warn("Nu pot citi setările coloanelor:", err);
    }
  }, []);

  // 💾 Salvează preferințele de coloane
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        COLUMNS_STORAGE_KEY,
        JSON.stringify(visibleColumns)
      );
    } catch (err) {
      console.warn("Nu pot salva setările coloanelor:", err);
    }
  }, [visibleColumns]);

  // 🔄 Fetch fișe service
  const fetchDevices = async () => {
    try {
      const res = await fetch("/api/devices/list/", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) {
        setDevices(data);
      } else {
        console.warn("Răspuns /api/devices neașteptat:", data);
      }
    } catch (err) {
      console.error("Eroare la încărcarea fișelor:", err);
      toast.error("Eroare la încărcarea fișelor de service");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session) return;
    fetchDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // 🔒 închide popover-ele la click în afară
  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilters(false);
      }
      if (columnsRef.current && !columnsRef.current.contains(e.target)) {
        setShowColumns(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // 🎨 Status badge classes (culori pale)
  const statusBadge = (status) => {
    switch (status) {
      case "Primire":
        return "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300";
      case "Diagnosticare":
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300";
      case "Nspf":
        return "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300";
      case "Așteaptă piese":
        return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300";
      case "În lucru":
        return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300";
      case "Finalizat":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300";
      case "Predat":
        return "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300";
      case "Refuzat":
        return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-600/30 dark:text-gray-300";
    }
  };

  const statusSoftBg = (status) => {
    switch (status) {
      case "Primire":
        return "bg-sky-100/60 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300";
      case "Diagnosticare":
        return "bg-indigo-100/60 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300";
      case "Nspf":
        return "bg-orange-100/60 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300";
      case "Așteaptă piese":
        return "bg-amber-100/60 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300";
      case "În lucru":
        return "bg-blue-100/60 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300";
      case "Finalizat":
        return "bg-emerald-100/60 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300";
      case "Predat":
        return "bg-slate-100/60 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300";
      case "Refuzat":
        return "bg-rose-100/60 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300";
      default:
        return "bg-gray-100/60 text-gray-700 dark:bg-gray-600/20 dark:text-gray-300";
    }
  };

  // Număr filtre active
  const activeFilterCount = () => {
    let c = 0;
    if (dateFrom) c++;
    if (dateTo) c++;
    return c;
  };

  // 🧮 Filtrare fișe
  const filteredDevices = devices.filter((d) => {
    // status
    if (statusFilter !== "all" && d.status !== statusFilter) return false;

    // căutare
    if (search.trim()) {
      const term = search.toLowerCase();
      const clientName =
        d.clientName ||
        d.client?.name ||
        d.client_name ||
        d.client ||
        "";
      const phone =
        d.clientPhone || d.client?.phone || d.phone || d.telefon || "";
      const deviceLabel =
        d.deviceType || d.device || d.device_type || d.deviceName || "";
      const model = d.model || d.modelName || "";
      const technician = d.technician || d.user?.name || "";

      const haystack = [
        clientName,
        phone,
        deviceLabel,
        model,
        technician,
        d.status || "",
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(term)) return false;
    }

    // date
    if (dateFrom && d.createdAt) {
      const created = new Date(d.createdAt);
      if (created < new Date(dateFrom)) return false;
    }
    if (dateTo && d.createdAt) {
      const created = new Date(d.createdAt);
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      if (created > endOfDay) return false;
    }

    return true;
  });

  // 👉 reset pagină la schimbarea filtrelor
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, search, dateFrom, dateTo]);

  const totalItems = filteredDevices.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDevices = filteredDevices.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("ro-RO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatPrice = (value) => {
    if (value === null || value === undefined) return "-";
    try {
      const num = typeof value === "number" ? value : Number(value);
      if (Number.isNaN(num)) return "-";
      return new Intl.NumberFormat("ro-RO", {
        style: "currency",
        currency: "RON",
        maximumFractionDigits: 0,
      }).format(num);
    } catch {
      return `${value} lei`;
    }
  };

  const ActionIconButton = ({ icon: Icon, onClick, title }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-1.5 rounded-md transition text-gray-500 dark:text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700"
    >
      <Icon size={16} strokeWidth={1.6} />
    </button>
  );

  if (loading) {
    return (
      <div className="p-6 text-gray-500 dark:text-gray-300">
        Se încarcă fișele de service...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text:white">
            Fișe Service
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Vizualizezi și filtrezi fișele de service pentru clienți.
          </p>
        </div>
      </div>

      {/* STATUS TABS – stil din Settings */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-4xl mx-auto">
          {/* CLASSIC */}
          {style === "classic" && (
            <div
              className="
                rounded-xl bg-white dark:bg-gray-900 border 
                p-3 sm:p-4 
                flex gap-2 overflow-x-auto no-scrollbar
                justify-start sm:justify-center
                shadow-sm
              "
            >
              {STATUS_TABS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setStatusFilter(t.value)}
                  className={`
                    px-4 py-1.5 rounded-full text-sm whitespace-nowrap
                    ${
                      statusFilter === t.value
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }
                  `}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {/* GLASS */}
          {style === "glass" && (
            <div
              className="
                rounded-2xl bg-white/20 dark:bg-gray-800/20 
                backdrop-blur-xl border border-white/40 dark:border-gray-700/40 
                shadow-lg 
                p-3 sm:p-4 
                overflow-x-auto no-scrollbar
                flex justify-start sm:justify-center
              "
            >
              <div className="flex gap-2 min-w-max">
                {STATUS_TABS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setStatusFilter(t.value)}
                    className={`
                      px-4 py-1.5 rounded-full text-sm whitespace-nowrap backdrop-blur-sm
                      ${
                        statusFilter === t.value
                          ? "bg-white/70 dark:bg-gray-700/50 text-gray-900 dark:text-white shadow"
                          : "text-gray-700 dark:text-gray-300 hover:bg-white/30"
                      }
                    `}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* iOS */}
          {style === "ios" && (
            <div
              className="
                rounded-xl bg-gray-200 dark:bg-gray-700 
                p-2 sm:p-3
                overflow-x-auto no-scrollbar
                flex justify-start sm:justify-center
              "
            >
              <div className="flex gap-1 min-w-max">
                {STATUS_TABS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setStatusFilter(t.value)}
                    className={`
                      px-4 py-1 rounded-lg text-sm whitespace-nowrap
                      ${
                        statusFilter === t.value
                          ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow"
                          : "text-gray-600 dark:text-gray-300"
                      }
                    `}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* RIPPLE */}
          {style === "ripple" && (
            <div
              className="
                p-2 sm:p-3 
                overflow-x-auto no-scrollbar 
                flex justify-start sm:justify-center
              "
            >
              <div className="flex gap-2 min-w-max">
                {STATUS_TABS.map((t) => (
                  <button
                    key={t.value}
                    onClick={(e) => {
                      const el = e.currentTarget;
                      const circle = document.createElement("span");

                      const diameter = Math.max(
                        el.clientWidth,
                        el.clientHeight
                      );
                      const radius = diameter / 2;

                      circle.style.width = circle.style.height = `${diameter}px`;
                      circle.style.left = `${e.clientX - el.offsetLeft - radius}px`;
                      circle.style.top = `${e.clientY - el.offsetTop - radius}px`;
                      circle.classList.add("ripple");

                      const ripple = el.getElementsByClassName("ripple")[0];
                      if (ripple) ripple.remove();

                      el.appendChild(circle);

                      setStatusFilter(t.value);
                    }}
                    className={`
                      relative overflow-hidden px-4 py-1.5 rounded-full text-sm
                      ${
                        statusFilter === t.value
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      }
                    `}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* COLOR */}
          {style === "color" && (
            <div
              className="
                w-full rounded-2xl 
                bg-white/20 dark:bg-gray-800/20 
                backdrop-blur-xl
                border border-white/40 dark:border-gray-700/40 
                shadow-[0_4px_20px_rgba(0,0,0,0.06)]
                px-4 py-4
                overflow-x-auto no-scrollbar
                flex justify-start sm:justify-center
              "
            >
              <div className="flex gap-2 min-w-max">
                {STATUS_TABS.map((t) => {
                  const isActive = statusFilter === t.value;
                  return (
                    <button
                      key={t.value}
                      onClick={() => setStatusFilter(t.value)}
                      className={`
                        px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap
                        transition-all duration-200 border border-transparent
                        ${
                          isActive
                            ? statusSoftBg(t.value) + " shadow-sm scale-[1.03]"
                            : "bg-white/40 dark:bg-gray-700/40 text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60"
                        }
                      `}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bara de filtre + search + coloane + create */}
      <div className="relative rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-3 sm:p-4">
        <div className="flex items-center gap-2 w-full">
          {/* Search */}
          <div className="flex-1">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Caută după client, telefon, model, tehnician..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/60 text-sm outline-none"
              />
            </div>
          </div>

          {/* Filter date */}
          <div ref={filterRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setShowFilters((prev) => !prev);
                setShowColumns(false);
              }}
              className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/60"
            >
              <SlidersHorizontal className="w-4 h-4 text-gray-700 dark:text-gray-200" />

              {activeFilterCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFilterCount()}
                </span>
              )}
            </button>

            {showFilters && (
              <div className="absolute right-0 mt-2 w-60 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg p-3 text-xs z-20">
                <p className="text-xs font-medium mb-2 text-gray-500 dark:text-gray-400">
                  Filtrare după dată
                </p>

                <div className="space-y-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      De la
                    </span>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="text-xs px-2 py-1.5 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-900/60"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      Până la
                    </span>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="text-xs px-2 py-1.5 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-900/60"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDateFrom("");
                      setDateTo("");
                    }}
                    className="mt-1 text-[11px] text-blue-600 dark:text-blue-400"
                  >
                    Resetează datele
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Setări coloane – desktop */}
          <div ref={columnsRef} className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => {
                setShowColumns((prev) => !prev);
                setShowFilters(false);
              }}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/60"
            >
              <Columns3 className="w-4 h-4 text-gray-700 dark:text-gray-200" />
            </button>

            {showColumns && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg p-3 text-xs z-20">
                <p className="text-xs font-medium mb-1">Afișare coloane</p>

                {Object.entries(visibleColumns).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-2 py-0.5">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) =>
                        setVisibleColumns((prev) => ({
                          ...prev,
                          [key]: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <span>
                      {key === "client"
                        ? "Client"
                        : key === "phone"
                        ? "Telefon + email în client"
                        : key === "device"
                        ? "Dispozitiv"
                        : key === "model"
                        ? "Serie în dispozitiv"
                        : key === "status"
                        ? "Status"
                        : key === "technician"
                        ? "Tehnician"
                        : key === "price"
                        ? "Preț"
                        : key === "createdAt"
                        ? "Data"
                        : key}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Create – desktop */}
          <button
            onClick={() => router.push("/devices/create")}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg 
                     bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium 
                     shadow-md transition active:scale-95"
          >
            <Plus size={16} />
            Crează fișă
          </button>

          {/* Create – mobile toggle */}
          <button
            className="sm:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white"
            onClick={() => setShowCreate((p) => !p)}
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Expanded create – MOBILE */}
        {showCreate && (
          <div className="sm:hidden mt-3">
            <button
              onClick={() => router.push("/devices/create")}
              className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm"
            >
              Crează fișă
            </button>
          </div>
        )}
      </div>

      {/* Dacă nu există rezultate */}
      {totalItems === 0 ? (
        <div className="text-center text-gray-400 dark:text-gray-500 py-6 text-sm">
          Nu există fișe care să corespundă filtrării.
        </div>
      ) : (
        <>
          {/* 💻 DESKTOP TABLE */}
          <div className="hidden sm:block overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <table className="min-w-full text-[15px]">
              <thead className="bg-gray-100 dark:bg-gray-900/60 text-gray-700 dark:text-gray-300">
                <tr>
                  {visibleColumns.client && (
                    <th className="px-3 py-2 text-left font-medium text-[13px]">
                      Client
                    </th>
                  )}
                  {visibleColumns.device && (
                    <th className="px-3 py-2 text-left font-medium text-[13px]">
                      Dispozitiv
                    </th>
                  )}
                  {visibleColumns.status && (
                    <th className="px-3 py-2 text-center font-medium text-[13px]">
                      Status
                    </th>
                  )}
                  {visibleColumns.technician && (
                    <th className="px-3 py-2 text-left font-medium text-[13px]">
                      Tehnician
                    </th>
                  )}
                  {visibleColumns.price && (
                    <th className="px-3 py-2 text-right font-medium text-[13px]">
                      Preț
                    </th>
                  )}
                  {visibleColumns.createdAt && (
                    <th className="px-3 py-2 text-center font-medium text-[13px]">
                      Data creării
                    </th>
                  )}
                  <th className="px-3 py-2 text-center font-medium text-[13px]">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedDevices.map((d, index) => {
                  const clientName =
                    d.clientName ||
                    d.client?.name ||
                    d.client_name ||
                    "Client necunoscut";
                  const phone =
                    d.clientPhone ||
                    d.client?.phone ||
                    d.phone ||
                    d.telefon ||
                    "";
                  const email = d.client?.email || d.email || "";

                  const type = d.deviceType || "";
                  const brand = d.brand || "";
                  const model = d.model || d.modelName || "";
                  const serial =
                    d.serialNumber || d.serial_no || d.sn || "";

                  const combinedDevice =
                    [type, brand, model].filter(Boolean).join(" ") ||
                    d.device ||
                    d.device_type ||
                    "Dispozitiv";

                  const technician = d.technician || d.user?.name || "-";
                  const price =
                    d.priceEstimate ??
                    d.price ??
                    d.total ??
                    d.totalPrice ??
                    null;

                  return (
                    <tr
                      key={d.id || index}
                      className={`border-t border-gray-200 dark:border-gray-700 ${
                        index % 2 === 0
                          ? "bg-white dark:bg-gray-900/40"
                          : "bg-gray-50 dark:bg-gray-900/20"
                      }`}
                    >
                      {/* CLIENT: nume bold + telefon/email dedesubt */}
                      {visibleColumns.client && (
                        <td className="px-3 py-2 text-gray-900 dark:text-gray-100 align-top">
                          <div className="flex flex-col">
                            <span className="font-semibold">
                              {clientName}
                            </span>
                            {visibleColumns.phone && (
                              <>
                                {phone && (
                                  <span className="text-[13px] text-gray-600 dark:text-gray-300">
                                    {phone}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      )}

                      {/* DISPOZITIV: Laptop Asus UX32 + (SN...) */}
                      {visibleColumns.device && (
                        <td className="px-3 py-2 text-gray-800 dark:text-gray-200 align-top">
                          <div className="flex flex-col">
                            <span>{combinedDevice}</span>
                            {visibleColumns.model && serial && (
                              <span className="text-[13px] text-gray-500 dark:text-gray-400">
                                SN: {serial}
                              </span>
                            )}
                          </div>
                        </td>
                      )}

                      {/* STATUS */}
                      {visibleColumns.status && (
                        <td className="px-3 py-2 text-center align-middle">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-[12px] font-medium ${statusBadge(
                              d.status
                            )}`}
                          >
                            {d.status || "—"}
                          </span>
                        </td>
                      )}

                      {/* TEHNICIAN */}
                      {visibleColumns.technician && (
                        <td className="px-3 py-2 text-gray-800 dark:text-gray-200 align-middle">
                          <span className="font-medium">{technician}</span>
                        </td>
                      )}

                      {/* PREȚ */}
                      {visibleColumns.price && (
                        <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-100 align-middle">
                          {formatPrice(price)}
                        </td>
                      )}

                      {/* DATA CREĂRII */}
                      {visibleColumns.createdAt && (
                        <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-300 align-middle">
                          {formatDate(d.createdAt)}
                        </td>
                      )}

                      {/* ACȚIUNI */}
                      <td className="px-3 py-2 align-middle">
                        <div className="flex items-center justify-center gap-1.5">
                          <ActionIconButton
                            icon={Eye}
                            title="Deschide fișa"
                            onClick={() => {
                              if (d.id) {
                                router.push(`/devices/${d.id}`);
                              } else {
                                toast.info("Fișa nu are id disponibil.");
                              }
                            }}
                          />
                          <ActionIconButton
                            icon={Pencil}
                            title="Editează"
                            onClick={() => {
                              if (d.id) {
                                router.push(`/devices/${d.id}?edit=1`);
                              } else {
                                toast.info("Fișa nu are id disponibil.");
                              }
                            }}
                          />
                          {/* 🔧 FIȘĂ DE REPARAȚIE */}
    <ActionIconButton
      icon={Wrench}
      title="Fișă reparație"
      onClick={() => {
        if (d.id) {
          router.push(`/devices/${d.id}/repair`);
        } else {
          toast.info("Fișa nu are id disponibil.");
        }
      }}
    />

                          <ActionIconButton
                            icon={Trash2}
                            title="Șterge"
                            onClick={() => {
                              toast.info(
                                "Ștergerea fișelor o vom configura ulterior."
                              );
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
<div className="sm:hidden space-y-4">
  {paginatedDevices.map((d, index) => {
    const clientName =
      d.clientName ||
      d.client?.name ||
      d.client_name ||
      "Client necunoscut";

    const deviceLabel = [
      d.deviceType || d.device || d.device_type || "",
      d.brand || "",
      d.model || "",
    ]
      .filter(Boolean)
      .join(" ");

    const defect = d.problem || d.description || "-";
    const technician = d.technician || d.user?.name || "-";
    const price =
      d.priceEstimate ?? d.price ?? d.total ?? d.totalPrice ?? null;

    return (
      <div
        key={d.id || index}
        className="border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 shadow-sm p-4 space-y-3 w-full"
      >
        {/* HEADER */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {/* CLIENT */}
            <p className="text-xs text-gray-400 dark:text-gray-500">CLIENT</p>
            <h2 className="font-semibold text-gray-900 dark:text-gray-50 truncate">
              {clientName}
            </h2>

            {/* DEVICE */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {deviceLabel}
            </p>
          </div>

          {/* STATUS BADGE */}
          <span
            className={`px-2 py-1 rounded-full text-[11px] font-medium ${statusBadge(
              d.status
            )}`}
          >
            {d.status || "—"}
          </span>
        </div>

        {/* DEFECT */}
        <div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">DEFECT RECLAMAT</p>
          <p className="text-sm text-gray-800 dark:text-gray-200 font-medium line-clamp-2">
            {defect}
          </p>
        </div>

        {/* TEHNICIAN + PREȚ */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Tehnician</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {technician}
            </p>
          </div>

          <div className="text-right">
            <p className="text-gray-500 dark:text-gray-400">Preț estimat</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {formatPrice(price)}
            </p>
          </div>
        </div>

        {/* DATE + ACTIONS — aceeași linie */}
        <div className="flex items-center justify-between pt-2 mt-1 border-t border-dashed border-gray-200 dark:border-gray-700">

          {/* DATA ÎN STÂNGA */}
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            {formatDate(d.createdAt)}
          </span>

          {/* ACTIONS ÎN DREAPTA */}
          <div className="flex items-center gap-2">
            <ActionIconButton
              icon={Eye}
              title="Deschide fișa"
              onClick={() => d.id && router.push(`/devices/${d.id}`)}
            />
            <ActionIconButton
              icon={Pencil}
              title="Editează"
              onClick={() => d.id && router.push(`/devices/${d.id}?edit=1`)}
            />
            <ActionIconButton
            icon={Wrench}
             title="Fișă reparație"
             onClick={() => d.id && router.push(`/devices/${d.id}/repair`)}
            />
          </div>
        </div>
      </div>
    );
  })}
</div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            <div>
              {totalItems > 0 && (
                <span>
                  Afișate{" "}
                  <strong>
                    {startIndex + 1}–
                    {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}
                  </strong>{" "}
                  din <strong>{totalItems}</strong> fișe
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                «
              </button>
              <span className="px-2">
                Pagina {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                »
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}