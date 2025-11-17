"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  User,
  Laptop2,
  Package,
  Wrench,
  CreditCard,
  CheckCircle2,
  Search,
  Check,
  Loader2,
  UserPlus,
} from "lucide-react";

import FancySelectPlus from "@/app/components/FancySelectPlus";

//
// 🔹 Mini-modal pentru adăugare client nou
//
function AddClientModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Completează numele clientului.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare la crearea clientului.");
      toast.success("Client adăugat!");
      onSave(data);
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
          <UserPlus className="w-5 h-5 text-blue-500" />
          Adaugă client nou
        </h2>

        <div className="space-y-3">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="input text-base py-3"
            placeholder="Nume complet"
            autoFocus
          />
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="input text-base py-3"
            placeholder="Telefon"
          />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="input text-base py-3"
            placeholder="Email"
          />
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="btn-gray px-5 py-2.5 text-base">
            Anulează
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="btn-blue px-5 py-2.5 text-base"
          >
            {saving ? "Se salvează..." : "Salvează"}
          </button>
        </div>
      </div>
    </div>
  );
}

//
// 🔹 Modal generic pentru adăugare opțiuni (tip / brand / observație estetică)
//
function AddOptionModal({ fieldKey, onClose, onSave }) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  if (!fieldKey) return null;

  const titles = {
    deviceType: "Adaugă tip dispozitiv",
    brand: "Adaugă brand",
    receptionCondition: "Adaugă observație estetică",
  };

  const placeholders = {
    deviceType: "Ex: Laptop gaming, All-in-One, Telefon business...",
    brand: "Ex: Fujitsu, Razer, MSI...",
    receptionCondition: "Ex: Zgârieturi colț dreapta, capac ciobit...",
  };

  const handleSubmit = () => {
    if (!value.trim()) {
      toast.error("Completează câmpul.");
      return;
    }
    setSaving(true);
    onSave(value.trim());
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
          {titles[fieldKey] || "Adaugă"}
        </h2>

        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="input text-base py-3"
          placeholder={placeholders[fieldKey] || "Scrie aici..."}
          autoFocus
        />

        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="btn-gray px-5 py-2.5 text-base">
            Anulează
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="btn-blue px-5 py-2.5 text-base"
          >
            {saving ? "Se salvează..." : "Salvează"}
          </button>
        </div>
      </div>
    </div>
  );
}

// 🔹 Pagina principală
export default function CreateDevicePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // client
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [clientResults, setClientResults] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDevices, setClientDevices] = useState([]);
  const [searching, setSearching] = useState(false);

  // opțiuni dinamice
  const [deviceTypeOptions, setDeviceTypeOptions] = useState([
    "Laptop",
    "PC",
    "Telefon",
    "Tabletă",
    "Consolă",
  ]);

  const [brandOptions, setBrandOptions] = useState([
    "Dell",
    "HP",
    "Lenovo",
    "Asus",
    "Acer",
    "Apple",
    "Samsung",
    "Huawei",
  ]);

  const [conditionOptions, setConditionOptions] = useState([
    "Fără urme vizibile",
    "Zgârieturi fine",
    "Urme de uzură evidente",
    "Carcasa spartă / deteriorată",
    "Altă observație...",
  ]);

  const [addFieldKey, setAddFieldKey] = useState(null);
  const [showConditionDetails, setShowConditionDetails] = useState(false);

  const [form, setForm] = useState({
    clientName: "",
    phone: "",
    email: "",
    deviceType: "",
    brand: "",
    model: "",
    serialNumber: "",
    charger: "Nu",
    battery: "Nu",
    hdd: "Nu",
    problem: "",
    description: "",
    service: "",
    accessCode: "",
    priceEstimate: "",
    advance: "",
    warranty: "30 zile",
    warrantyStatus: "",
    technician: "",
    receptionCondition: "",
    receptionNotes: "",
    sheetType: "Nouă",
    selectedDeviceId: null,
    status: "Primire",
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // RESET CLIENT
  const resetClient = () => {
    setSelectedClient(null);
    setClientSearch("");
    setClientDevices([]);
    setForm((prev) => ({
      ...prev,
      clientName: "",
      phone: "",
      email: "",
      selectedDeviceId: null,
      warrantyStatus: "",
      deviceType: "",
      brand: "",
      model: "",
      serialNumber: "",
    }));
  };

  // 🔎 Căutare client
  const searchClients = async (query) => {
    setClientSearch(query);
    if (!query || query.length < 2) {
      setClientResults([]);
      return;
    }

    try {
      setSearching(true);
      const res = await fetch(`/api/clients/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setClientResults(data || []);
    } catch {
      setClientResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectClient = async (client) => {
    setSelectedClient(client);
    setClientSearch(client.name);
    setClientResults([]);
    setForm((prev) => ({
      ...prev,
      clientName: client.name,
      phone: client.phone || "",
      email: client.email || "",
    }));

    const res = await fetch(`/api/devices/history?clientId=${client.id}`);
    const data = await res.json();
    setClientDevices(data || []);

    setForm((prev) => ({ ...prev, warrantyStatus: "" }));
  };

  // 💾 Salvare fișă
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (form.selectedDeviceId && !form.serialNumber) {
        const selectedDevice = clientDevices.find(
          (d) => d.id === form.selectedDeviceId
        );
        if (selectedDevice) {
          form.deviceType = selectedDevice.deviceType || "";
          form.brand = selectedDevice.brand || "";
          form.model = selectedDevice.model || "";
          form.serialNumber = selectedDevice.serialNumber || "";
        }
      }

      const res = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare la salvare fișă.");

      toast.success("Fișa a fost creată!");
      router.push("/devices");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // 🔹 Wizard vizual sus
  const steps = [
    { id: 1, icon: <User className="w-4 h-4" />, label: "Client" },
    { id: 2, icon: <Laptop2 className="w-4 h-4" />, label: "Dispozitiv" },
    { id: 3, icon: <Package className="w-4 h-4" />, label: "Accesorii" },
    { id: 4, icon: <Wrench className="w-4 h-4" />, label: "Problemă" },
    { id: 5, icon: <CreditCard className="w-4 h-4" />, label: "Financiar" },
    { id: 6, icon: <CheckCircle2 className="w-4 h-4" />, label: "Confirmare" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* === Header + wizard === */}
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
          ➕ Creează fișă de service
        </h1>

        <div className="flex items-center justify-center mb-2 w-full max-w-2xl">
          {steps.map((s, i, arr) => (
            <div key={s.id} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-full border-2 text-sm font-semibold transition-all ${
                  step >= s.id
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 dark:border-gray-600 text-gray-400"
                }`}
              >
                {s.icon}
              </div>
              {i < arr.length - 1 && (
                <div
                  className={`flex-1 h-[2px] ${
                    step > s.id ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500">Pas {step} din 6</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* === PAS 1: CLIENT === */}
        {step === 1 && (
          <section className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm step-enter">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Client
            </h3>

            {/* 🔍 Search + buton + integrate */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

              <input
                type="text"
                value={clientSearch}
                onChange={(e) => searchClients(e.target.value)}
                placeholder="Caută client după nume sau telefon..."
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-base py-3 pl-10 pr-12 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />

              <button
                type="button"
                onClick={() => setShowAddClientModal(true)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <UserPlus className="w-4 h-4" />
              </button>

              {searching && (
                <div className="absolute right-12 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                </div>
              )}

              {clientResults.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-64 overflow-auto">
                  {clientResults.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selectClient(c)}
                      className="w-full px-3 py-2 flex justify-between items-center text-left hover:bg-blue-50 dark:hover:bg-gray-700 transition"
                    >
                      <div>
                        <span className="font-medium">{c.name}</span>
                        <span className="text-gray-500 text-sm ml-1">
                          {c.phone}
                        </span>
                      </div>
                      <Check className="w-4 h-4 text-blue-600" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Client selectat + RESET badge */}
            {selectedClient && (
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 mb-4 border border-blue-200 dark:border-blue-800 flex justify-between items-start gap-3">
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-100 text-base">
                    {selectedClient.name}
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    ☎ {selectedClient.phone || "—"} • ✉{" "}
                    {selectedClient.email || "—"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetClient}
                  className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"
                  title="Resetează clientul selectat"
                >
                  ✕ Reset
                </button>
              </div>
            )}

            {/* Dispozitive anterioare */}
            {clientDevices.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-4">
                <p className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-300">
                  🔄 Selectează un dispozitiv anterior:
                </p>

                <div className="flex flex-wrap gap-3">
                  {clientDevices.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          deviceType: d.deviceType || "",
                          brand: d.brand || "",
                          model: d.model || "",
                          serialNumber: d.serialNumber || "",
                          selectedDeviceId: d.id,
                        }));

                        if (d.deliveryDate) {
                          const garantie = 90;
                          const diff = Math.floor(
                            (new Date() - new Date(d.deliveryDate)) /
                              (1000 * 60 * 60 * 24)
                          );
                          const remaining = garantie - diff;

                          setForm((prev) => ({
                            ...prev,
                            warrantyStatus:
                              remaining > 0
                                ? `🟢 În garanție (${remaining} zile rămase)`
                                : "🔴 Garanție expirată",
                          }));
                        } else {
                          setForm((prev) => ({
                            ...prev,
                            warrantyStatus: "⚪ Fără informații de livrare",
                          }));
                        }

                        toast.success("Dispozitiv selectat.");
                      }}
                      className={`px-4 py-2 rounded-lg border shadow-sm transition-all text-sm ${
                        form.selectedDeviceId === d.id
                          ? "bg-blue-600 text-white border-blue-700 scale-[1.02]"
                          : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      💻 {d.deviceType} {d.brand} {d.model}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Status garanție */}
            {form.warrantyStatus && (
              <p
                className={`text-sm font-medium mb-4 ${
                  form.warrantyStatus.includes("expirată")
                    ? "text-red-600"
                    : form.warrantyStatus.includes("garanție")
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {form.warrantyStatus}
              </p>
            )}

            <div className="flex justify-end mt-5">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-blue px-5 py-2.5 text-base"
                disabled={!selectedClient}
              >
                Continuă ▶
              </button>
            </div>
          </section>
        )}

        {/* === PAS 2: DISPOZITIV === */}
        {step === 2 && (
          <section className="step-enter bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Laptop2 className="w-5 h-5 text-blue-500" />
              Detalii dispozitiv
            </h3>

            {/* Dispozitiv selectat */}
            {form.selectedDeviceId && (
              <div className="mb-5 bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 p-4 rounded-lg">
                <p className="font-medium text-blue-900 dark:text-blue-100 text-base mb-1">
                  {form.deviceType} {form.brand} {form.model}
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                  Serie / IMEI: {form.serialNumber || "—"}
                </p>

                {form.warrantyStatus && (
                  <p
                    className={`text-sm font-medium ${
                      form.warrantyStatus.includes("expirată")
                        ? "text-red-600"
                        : form.warrantyStatus.includes("garanție")
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {form.warrantyStatus}
                  </p>
                )}
              </div>
            )}

            {/* Tip fișă */}
            <div className="mb-6 flex flex-wrap gap-4">
              {["Nouă", "Garanție"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      sheetType: type,
                      status: type === "Garanție" ? "Garanție" : "Primire",
                    }))
                  }
                  className={`flex-1 min-w-[150px] text-center py-3 px-5 rounded-xl border text-base font-medium transition-all ${
                    form.sheetType === type
                      ? "bg-blue-600 text-white border-blue-700 shadow-md scale-[1.03]"
                      : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-200"
                  }`}
                >
                  {type === "Nouă" ? "🆕 Fișă nouă" : "🧾 Fișă de garanție"}
                </button>
              ))}
            </div>

            {/* Detalii dispozitiv: tip / brand / model / serie */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FancySelectPlus
                label="Tip dispozitiv"
                value={form.deviceType}
                options={deviceTypeOptions}
                onChange={(val) =>
                  setForm((prev) => ({ ...prev, deviceType: val }))
                }
                onAddNew={() => setAddFieldKey("deviceType")}
              />
              <FancySelectPlus
                label="Brand"
                value={form.brand}
                options={brandOptions}
                onChange={(val) =>
                  setForm((prev) => ({ ...prev, brand: val }))
                }
                onAddNew={() => setAddFieldKey("brand")}
              />
              <div>
                <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
                  Model
                </label>
                <input
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  placeholder="Ex: ThinkPad T14, MacBook Air M1..."
                  className="input text-base py-3"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
                  Serie / IMEI
                </label>
                <input
                  name="serialNumber"
                  value={form.serialNumber}
                  onChange={handleChange}
                  placeholder="Serie / IMEI"
                  className="input text-base py-3"
                />
              </div>
            </div>

            <div className="flex justify-between mt-5">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-gray px-5 py-2.5 text-base"
              >
                ◀ Înapoi
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-blue px-5 py-2.5 text-base"
              >
                Continuă ▶
              </button>
            </div>
          </section>
        )}

        {/* === PAS 3: ACCESORII + ESTETIC === */}
        {step === 3 && (
          <section className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm step-enter">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              Accesorii & Notă recepție
            </h3>

            {/* 🔌 Accesorii primite */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">

  <FancySelectPlus
  label="Alimentator"
  value={form.charger}
  options={["Nu", "Da"]}
  disableAdd={true}
  onChange={(val) => setForm((prev) => ({ ...prev, charger: val }))}
  onAddNew={() => {}}
/>

<FancySelectPlus
  label="Baterie"
  value={form.battery}
  options={["Nu", "Da"]}
  disableAdd={true}
  onChange={(val) => setForm((prev) => ({ ...prev, battery: val }))}
  onAddNew={() => {}}
/>

<FancySelectPlus
  label="HDD / SSD"
  value={form.hdd}
  options={["Nu", "Da"]}
  disableAdd={true}
  onChange={(val) => setForm((prev) => ({ ...prev, hdd: val }))}
  onAddNew={() => {}}
/>

</div>

            {/* Estetică */}
            <div className="mb-4">
              <FancySelectPlus
                label="Urme vizibile / Stare estetică"
                value={form.receptionCondition}
                options={conditionOptions}
                onChange={(val) => {
                  setForm((prev) => ({
                    ...prev,
                    receptionCondition: val,
                  }));
                  setShowConditionDetails(!!val);
                }}
                onAddNew={() => setAddFieldKey("receptionCondition")}
              />

              {showConditionDetails && (
                <div className="mt-3">
                  <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
                    Descrie exact starea estetică
                  </label>
                  <textarea
                    name="receptionNotes"
                    value={form.receptionNotes || ""}
                    onChange={handleChange}
                    placeholder="Ex: zgârieturi laterale, urme pe capac, colț lovit, etc."
                    className="input text-base py-3 min-h-[70px]"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-between mt-5">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-gray px-5 py-2.5 text-base"
              >
                ◀ Înapoi
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="btn-blue px-5 py-2.5 text-base"
              >
                Continuă ▶
              </button>
            </div>
          </section>
        )}

        {/* === PAS 4: PROBLEMĂ === */}
        {step === 4 && (
          <section className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm step-enter">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-500" />
              Problemă & observații
            </h3>

            <textarea
              name="problem"
              value={form.problem}
              onChange={handleChange}
              placeholder="Defect reclamat"
              className="input text-base py-3 min-h-[70px]"
            />
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Observații client"
              className="input text-base py-3 min-h-[70px] mt-3"
            />
            <input
              name="accessCode"
              value={form.accessCode}
              onChange={handleChange}
              placeholder="Cod acces / PIN / model"
              className="input text-base py-3 mt-3"
            />

            <div className="flex justify-between mt-5">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-gray px-5 py-2.5 text-base"
              >
                ◀ Înapoi
              </button>
              <button
                type="button"
                onClick={() => setStep(5)}
                className="btn-blue px-5 py-2.5 text-base"
              >
                Continuă ▶
              </button>
            </div>
          </section>
        )}

        {/* === PAS 5: FINANCIAR === */}
        {step === 5 && (
          <section className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm step-enter">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              Detalii financiare
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                name="priceEstimate"
                type="number"
                value={form.priceEstimate}
                onChange={handleChange}
                placeholder="Preț estimat (RON)"
                className="input text-base py-3"
              />
              <input
                name="advance"
                type="number"
                value={form.advance}
                onChange={handleChange}
                placeholder="Avans (RON)"
                className="input text-base py-3"
              />
              <select
                name="warranty"
                value={form.warranty}
                onChange={handleChange}
                className="input text-base py-3"
              >
                <option value="30 zile">Garanție intervenție - 30 zile</option>
                <option value="90 zile">Garanție intervenție - 90 zile</option>
              </select>
              <select
                name="technician"
                value={form.technician}
                onChange={handleChange}
                className="input text-base py-3"
              >
                <option value="">Selectează tehnician</option>
                <option value="Tehnician 1">Tehnician 1</option>
                <option value="Tehnician 2">Tehnician 2</option>
              </select>
            </div>

            <div className="flex items-center mt-4 gap-2">
              <input
                id="priceConfirmed"
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="priceConfirmed"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                Preț confirmat la recepție
              </label>
            </div>

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="btn-gray px-5 py-2.5 text-base"
              >
                ◀ Înapoi
              </button>
              <button
                type="button"
                onClick={() => setStep(6)}
                className="btn-blue px-5 py-2.5 text-base"
              >
                Continuă ▶
              </button>
            </div>
          </section>
        )}

        {/* === PAS 6: CONFIRMARE === */}
        {step === 6 && (
          <section className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm step-enter">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
              Confirmare finală
            </h3>

            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                <h4 className="font-semibold text-lg mb-1">👤 Client</h4>
                <p>
                  {form.clientName} — {form.phone || "—"} — {form.email || "—"}
                </p>
              </div>

              <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                <h4 className="font-semibold text-lg mb-1">💻 Dispozitiv</h4>
                <p>
                  {form.deviceType} {form.brand} {form.model} —{" "}
                  {form.serialNumber}
                </p>
              </div>

              <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                <h4 className="font-semibold text-lg mb-1">📦 Accesorii</h4>
                <p>
                  Alimentator: {form.charger} • Baterie: {form.battery} • HDD:{" "}
                  {form.hdd}
                </p>
              </div>

              <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                <h4 className="font-semibold text-lg mb-1">🧰 Problemă</h4>
                <p>
                  {form.problem || "—"} <br />
                  <span className="text-sm italic text-gray-500">
                    {form.description}
                  </span>
                </p>
              </div>

              <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                <h4 className="font-semibold text-lg mb-1">
                  🎨 Stare estetică
                </h4>
                <p>
                  {form.receptionCondition || "—"}
                  {form.receptionNotes && (
                    <>
                      <br />
                      <span className="text-sm italic text-gray-500">
                        {form.receptionNotes}
                      </span>
                    </>
                  )}
                </p>
              </div>

              <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                <h4 className="font-semibold text-lg mb-1">💰 Financiar</h4>
                <p>
                  Preț estimat: {form.priceEstimate || "—"} RON • Avans:{" "}
                  {form.advance || "—"} RON <br />
                  Garanție: {form.warranty} • Tehnician: {form.technician}
                </p>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => setStep(5)}
                className="btn-gray px-5 py-2.5 text-base"
              >
                ◀ Înapoi
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-blue px-5 py-2.5 text-base"
              >
                {saving ? "Se salvează..." : "💾 Creează fișa"}
              </button>
            </div>
          </section>
        )}

        {/* === Modal client nou === */}
        {showAddClientModal && (
          <AddClientModal
            onClose={() => setShowAddClientModal(false)}
            onSave={(client) => {
              setSelectedClient(client);
              setForm((prev) => ({
                ...prev,
                clientName: client.name,
                phone: client.phone || "",
                email: client.email || "",
              }));
              setClientSearch(client.name);
            }}
          />
        )}

        {/* === Modal generic pentru + (tip / brand / estetică) === */}
        {addFieldKey && (
          <AddOptionModal
            fieldKey={addFieldKey}
            onClose={() => setAddFieldKey(null)}
            onSave={(val) => {
              if (addFieldKey === "deviceType") {
                setDeviceTypeOptions((prev) =>
                  prev.includes(val) ? prev : [...prev, val]
                );
                setForm((prev) => ({ ...prev, deviceType: val }));
              } else if (addFieldKey === "brand") {
                setBrandOptions((prev) =>
                  prev.includes(val) ? prev : [...prev, val]
                );
                setForm((prev) => ({ ...prev, brand: val }));
              } else if (addFieldKey === "receptionCondition") {
                setConditionOptions((prev) =>
                  prev.includes(val) ? prev : [...prev, val]
                );
                setForm((prev) => ({
                  ...prev,
                  receptionCondition: val,
                }));
                setShowConditionDetails(true);
              }
            }}
          />
        )}
      </form>
    </div>
  );
}