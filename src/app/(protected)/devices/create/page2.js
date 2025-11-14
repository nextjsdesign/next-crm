"use client";

import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreateDevicePage() {
  const router = useRouter();

  // ─────────────────────────────────────────────
  // STATE-uri principale
  // ─────────────────────────────────────────────
  const [loading, setLoading] = useState(false);

  // Client selectat
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientQuery, setClientQuery] = useState("");
  const [clientResults, setClientResults] = useState([]);

  // Device
  const [device, setDevice] = useState({
    deviceType: "",
    brand: "",
    model: "",
    serialNumber: "",
    problem: "",
    accessories: "",
    description: "",
    priceEstimate: "",
    advance: "",
    notes: "",
  });

  // Modal CLIENT
  const [showClientModal, setShowClientModal] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    phone: "",
    email: "",
  });

  // Modal MODEL
  const [showModelModal, setShowModelModal] = useState(false);
  const [customModel, setCustomModel] = useState("");

  // ─────────────────────────────────────────────
  // Căutare client (autocomplete)
  // ─────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      if (clientQuery.length < 2) {
        setClientResults([]);
        return;
      }

      const res = await fetch(`/api/clients/search?q=${clientQuery}`);
      const data = await res.json();
      setClientResults(data);
    };
    load();
  }, [clientQuery]);

  const setDev = (field, value) =>
    setDevice((p) => ({ ...p, [field]: value }));

  // ─────────────────────────────────────────────
  // Creare fișă service
  // ─────────────────────────────────────────────
  const createDevice = async () => {
    if (!selectedClient) {
      toast.error("Selectează clientul mai întâi!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/devices", {
        method: "POST",
        body: JSON.stringify({
          ...device,
          clientId: selectedClient.id,
          status: "Primire",
        }),
      });

      if (!res.ok) throw new Error();
      const dev = await res.json();

      toast.success("Fișa a fost creată!");
      router.push(`/devices/${dev.id}`);
    } catch (err) {
      toast.error("Eroare la creare fișă");
    }
    setLoading(false);
  };

  // ─────────────────────────────────────────────
  // Adăugare client nou
  // ─────────────────────────────────────────────
  const saveNewClient = async () => {
    if (!newClient.name.trim()) {
      toast.error("Numele este obligatoriu");
      return;
    }

    const res = await fetch("/api/clients", {
      method: "POST",
      body: JSON.stringify(newClient),
    });

    const data = await res.json();
    setSelectedClient(data);
    setShowClientModal(false);
    toast.success("Client adăugat");
  };

  // ─────────────────────────────────────────────
  // Adăugare model nou (din modal)
  // ─────────────────────────────────────────────
  const saveNewModel = () => {
    if (!customModel.trim()) return;
    setDev("model", customModel.trim());
    setShowModelModal(false);
  };

  // ─────────────────────────────────────────────
  // RETURN PAGE
  // ─────────────────────────────────────────────

  return (
    <div className="w-full max-w-screen-xl mx-auto p-4 sm:p-6 space-y-8">

      {/* TITLE */}
      <h1 className="text-2xl font-semibold">Creare fișă service</h1>

      {/* CARD — CLIENT */}
      <div className="rounded-2xl border bg-white dark:bg-gray-800 p-5 shadow-sm space-y-4">

        <h2 className="text-lg font-medium">Client</h2>

        {/* SEARCH FIELD */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            placeholder="Caută client după nume sau telefon..."
            value={clientQuery}
            onChange={(e) => setClientQuery(e.target.value)}
            className="input pl-10 pr-12 w-full"
          />

          {/* BUTON + în același field */}
          <button
            type="button"
            onClick={() => setShowClientModal(true)}
            className="
              absolute right-1.5 top-1/2 -translate-y-1/2
              w-8 h-8 flex items-center justify-center
              bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200
              rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition
            "
          >
            +
          </button>
        </div>

        {/* AUTOCOMPLETE LIST */}
        {clientResults.length > 0 && (
          <div className="border rounded-xl mt-2 bg-white dark:bg-gray-800 shadow-lg max-h-60 overflow-auto">
            {clientResults.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedClient(c);
                  setClientQuery(c.name);
                  setClientResults([]);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-gray-500">{c.phone}</div>
              </button>
            ))}
          </div>
        )}

        {selectedClient && (
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 mt-2">
            <p className="font-medium">{selectedClient.name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {selectedClient.phone}
            </p>
          </div>
        )}
      </div>

      {/* CARD — DETALII DISPOZITIV */}
      <div className="rounded-2xl border bg-white dark:bg-gray-800 p-5 shadow-sm space-y-4">
        <h2 className="text-lg font-medium">Detalii dispozitiv</h2>

        {/* Dispozitiv */}
        <input
          type="text"
          placeholder="Dispozitiv (ex: Laptop, Telefon)"
          value={device.deviceType}
          onChange={(e) => setDev("deviceType", e.target.value)}
          className="input w-full"
        />

        {/* Brand */}
        <input
          type="text"
          placeholder="Brand (ex: Lenovo, Samsung)"
          value={device.brand}
          onChange={(e) => setDev("brand", e.target.value)}
          className="input w-full"
        />

        {/* MODEL — dropdown + săgeată + buton + */}
        <div className="relative">
          <select
            value={device.model}
            onChange={(e) => setDev("model", e.target.value)}
            className="input w-full appearance-none pr-14"
          >
            <option value="">Selectează model...</option>
            <option value="Laptop">Laptop</option>
            <option value="Telefon">Telefon</option>
            <option value="PC">PC</option>
            <option value="GPS">GPS</option>
          </select>

          {/* SĂGEATĂ ▼ */}
          <div className="pointer-events-none absolute right-9 top-1/2 -translate-y-1/2 text-gray-500">
            ▼
          </div>

          {/* BUTON + */}
          <button
            type="button"
            onClick={() => setShowModelModal(true)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            +
          </button>
        </div>

        {/* Serial */}
        <input
          type="text"
          placeholder="Serie/IMEI"
          value={device.serialNumber}
          onChange={(e) => setDev("serialNumber", e.target.value)}
          className="input w-full"
        />
      </div>

      {/* CARD — PROBLEMĂ */}
      <div className="rounded-2xl border bg-white dark:bg-gray-800 p-5 shadow-sm space-y-4">
        <h2 className="text-lg font-medium">Problemă / observații</h2>

        <textarea
          placeholder="Problema reclamată"
          value={device.problem}
          onChange={(e) => setDev("problem", e.target.value)}
          className="input w-full h-28"
        />

        <input
          type="text"
          placeholder="Accesorii primite"
          value={device.accessories}
          onChange={(e) => setDev("accessories", e.target.value)}
          className="input w-full"
        />

        <textarea
          placeholder="Descriere completă"
          value={device.description}
          onChange={(e) => setDev("description", e.target.value)}
          className="input w-full h-24"
        />
      </div>

      {/* CARD — PREȚ */}
      <div className="rounded-2xl border bg-white dark:bg-gray-800 p-5 shadow-sm space-y-4">
        <h2 className="text-lg font-medium">Preț</h2>

        <input
          type="number"
          placeholder="Preț estimat"
          value={device.priceEstimate}
          onChange={(e) => setDev("priceEstimate", e.target.value)}
          className="input w-full"
        />

        <input
          type="number"
          placeholder="Avans"
          value={device.advance}
          onChange={(e) => setDev("advance", e.target.value)}
          className="input w-full"
        />
      </div>

      {/* CARD — NOTE */}
      <div className="rounded-2xl border bg-white dark:bg-gray-800 p-5 shadow-sm">
        <textarea
          placeholder="Note interne"
          value={device.notes}
          onChange={(e) => setDev("notes", e.target.value)}
          className="input w-full h-24"
        />
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end">
        <button
          onClick={createDevice}
          disabled={loading}
          className="btn-blue px-6 py-2 rounded-lg"
        >
          {loading ? "Se salvează..." : "Crează fișa"}
        </button>
      </div>

      {/* ─────────────── MODAL CLIENT ─────────────── */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-sm space-y-4">

            <h3 className="text-lg font-semibold">Adaugă client nou</h3>

            <input
              type="text"
              placeholder="Nume"
              value={newClient.name}
              onChange={(e) =>
                setNewClient({ ...newClient, name: e.target.value })
              }
              className="input w-full"
            />

            <input
              type="text"
              placeholder="Telefon"
              value={newClient.phone}
              onChange={(e) =>
                setNewClient({ ...newClient, phone: e.target.value })
              }
              className="input w-full"
            />

            <input
              type="email"
              placeholder="Email (opțional)"
              value={newClient.email}
              onChange={(e) =>
                setNewClient({ ...newClient, email: e.target.value })
              }
              className="input w-full"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowClientModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700"
              >
                Anulează
              </button>

              <button
                onClick={saveNewClient}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
              >
                Salvează
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────── MODAL MODEL ─────────────── */}
      {showModelModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-sm space-y-4">

            <h3 className="text-lg font-semibold">Adaugă model nou</h3>

            <input
              type="text"
              placeholder="Model nou..."
              value={customModel}
              onChange={(e) => setCustomModel(e.target.value)}
              className="input w-full"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModelModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700"
              >
                Anulează
              </button>

              <button
                onClick={saveNewModel}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
              >
                Adaugă
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}