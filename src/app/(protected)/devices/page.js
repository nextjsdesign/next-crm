"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Search,
  SlidersHorizontal,
  Columns3,
  Eye,
  Pencil,
  Trash2,
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
  phone: true,
  device: true,
  model: true,
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
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  // Număr filtre active
const activeFilterCount = () => {
  let c = 0;
  if (dateFrom) c++;
  if (dateTo) c++;
  return c;
};

  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_COLUMNS);
  const [showColumns, setShowColumns] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const filterRef = useRef(null);
  const columnsRef = useRef(null);

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
      const res = await fetch("/api/devices", { cache: "no-store" });
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

  // 🎨 Status badge classes
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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Fișe Service
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Vizualizezi și filtrezi fișele de service pentru clienți.
          </p>
        </div>
      </div>

      {/* Status tabs – stil „segmented control / macOS” */}
      <div className="rounded-2xl bg-white/70 dark:bg-gray-900/70 border border-gray-200/70 dark:border-gray-700/70 shadow-sm backdrop-blur-sm w-full">
        <div className="px-2 py-2 sm:px-3 sm:py-3 overflow-x-auto">
          <div className="flex gap-1.5 sm:gap-2 min-w-max">
            {STATUS_TABS.map((tab) => {
              const isActive = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm border transition whitespace-nowrap
                    ${
                      isActive
                        ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 border-gray-900/80 dark:border-gray-100"
                        : "bg-gray-100/70 text-gray-700 dark:bg-gray-800/70 dark:text-gray-300 border-transparent hover:bg-gray-200/80 dark:hover:bg-gray-700"
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter bar (search + icons) */}
      <div className="relative rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="flex-1 min-w-[180px]">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Caută după client, telefon, model, tehnician..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/60 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500/70 outline-none"
              />
            </div>
          </div>

          {/* Icons: Filter & Columns */}
          <div className="flex items-center justify-end gap-2 mt-1 sm:mt-0">
            {/* Filter */}
            <div ref={filterRef} className="relative">
              <button
  type="button"
  onClick={() => {
    setShowFilters((prev) => !prev);
    setShowColumns(false);
  }}
  className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/60 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
>
  <SlidersHorizontal className="w-4 h-4" />

  {/* 🔵 Badge filtre active */}
  {activeFilterCount() > 0 && (
    <span
      className="
        absolute -top-1 -right-1
        bg-blue-600 text-white text-[10px]
        w-4 h-4 rounded-full
        flex items-center justify-center
        shadow-sm
      "
    >
      {activeFilterCount()}
    </span>
  )}
</button>

              {showFilters && (
                <div className="absolute right-0 mt-2 w-60 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg p-3 text-xs sm:text-sm z-20">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
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
                        className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/60 text-gray-800 dark:text-gray-100 focus:ring-1 focus:ring-blue-500/70 focus:border-blue-500/70 outline-none"
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
                        className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/60 text-gray-800 dark:text-gray-100 focus:ring-1 focus:ring-blue-500/70 focus:border-blue-500/70 outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDateFrom("");
                        setDateTo("");
                      }}
                      className="mt-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Resetează datele
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Columns */}
            <div ref={columnsRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowColumns((prev) => !prev);
                  setShowFilters(false);
                }}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/60 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <Columns3 className="w-4 h-4" />
              </button>

              {showColumns && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg p-3 text-xs sm:text-sm z-20">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Afișare coloane
                  </p>
                  {Object.entries(visibleColumns).map(([key, value]) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 text-gray-700 dark:text-gray-200 py-0.5"
                    >
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          setVisibleColumns((prev) => ({
                            ...prev,
                            [key]: e.target.checked,
                          }))
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>
                        {key === "client"
                          ? "Client"
                          : key === "phone"
                          ? "Telefon"
                          : key === "device"
                          ? "Dispozitiv"
                          : key === "model"
                          ? "Model"
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
          </div>
        </div>
      </div>

      {/* Dacă nu există rezultate */}
      {totalItems === 0 ? (
        <div className="text-center text-gray-400 dark:text-gray-500 py-6 text-sm">
          Nu există fișe care să corespundă filtrării.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-900/60 text-gray-700 dark:text-gray-300">
                <tr>
                  {visibleColumns.client && (
                    <th className="px-3 py-2 text-left font-medium">Client</th>
                  )}
                  {visibleColumns.phone && (
                    <th className="px-3 py-2 text-left font-medium">
                      Telefon
                    </th>
                  )}
                  {visibleColumns.device && (
                    <th className="px-3 py-2 text-left font-medium">
                      Dispozitiv
                    </th>
                  )}
                  {visibleColumns.model && (
                    <th className="px-3 py-2 text-left font-medium">Model</th>
                  )}
                  {visibleColumns.status && (
                    <th className="px-3 py-2 text-center font-medium">
                      Status
                    </th>
                  )}
                  {visibleColumns.technician && (
                    <th className="px-3 py-2 text-left font-medium">
                      Tehnician
                    </th>
                  )}
                  {visibleColumns.price && (
                    <th className="px-3 py-2 text-right font-medium">Preț</th>
                  )}
                  {visibleColumns.createdAt && (
                    <th className="px-3 py-2 text-center font-medium">
                      Data creării
                    </th>
                  )}
                  <th className="px-3 py-2 text-center font-medium">Acțiuni</th>
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
                    "-";
                  const deviceLabel =
                    d.deviceType || d.device || d.device_type || "Dispozitiv";
                  const model = d.model || d.modelName || "-";
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
                      {visibleColumns.client && (
                        <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">
                          {clientName}
                        </td>
                      )}
                      {visibleColumns.phone && (
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                          {phone}
                        </td>
                      )}
                      {visibleColumns.device && (
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                          {deviceLabel}
                        </td>
                      )}
                      {visibleColumns.model && (
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                          {model}
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td className="px-3 py-2 text-center">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(
                              d.status
                            )}`}
                          >
                            {d.status || "—"}
                          </span>
                        </td>
                      )}
                      {visibleColumns.technician && (
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                          {technician}
                        </td>
                      )}
                      {visibleColumns.price && (
                        <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-100">
                          {formatPrice(price)}
                        </td>
                      )}
                      {visibleColumns.createdAt && (
                        <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-300">
                          {formatDate(d.createdAt)}
                        </td>
                      )}
                      <td className="px-3 py-2">
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
              const deviceLabel =
                d.deviceType || d.device || d.device_type || "Dispozitiv";
              const model = d.model || d.modelName || "-";
              const technician = d.technician || d.user?.name || "-";
              const price =
                d.priceEstimate ?? d.price ?? d.total ?? d.totalPrice ?? null;

              return (
                <div
                  key={d.id || index}
                  className="border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 shadow-sm p-4 space-y-3 w-full"
                >
                  {/* Header card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        CLIENT
                      </p>
                      <h2 className="font-semibold text-gray-900 dark:text-gray-50 truncate">
                        {clientName}
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        {deviceLabel}
                        {model ? ` • ${model}` : ""}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-[11px] font-medium ${statusBadge(
                        d.status
                      )}`}
                    >
                      {d.status || "—"}
                    </span>
                  </div>

                  {/* Info row compact */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">
                        Tehnician
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {technician}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 dark:text-gray-400">
                        Preț estimat
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatPrice(price)}
                      </p>
                    </div>
                  </div>

                  {/* Program + dată jos, discret */}
                  <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 border-t border-dashed border-gray-200 dark:border-gray-700 pt-2 mt-1">
                    <span className="truncate">
                      {d.workHours
                        ? `Program tehnician: ${d.workHours}`
                        : "Program standard"}
                    </span>
                    <span className="ml-2 whitespace-nowrap">
                      {formatDate(d.createdAt)}
                    </span>
                  </div>

                  {/* Acțiuni mobile */}
                  <div className="flex items-center justify-end gap-2 pt-1">
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
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination (doar jos) */}
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
                onClick={() =>
                  setCurrentPage((p) => Math.max(1, p - 1))
                }
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