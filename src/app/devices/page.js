"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Eye,
  Trash2,
  Plus,
  Search,
  Loader2,
  Laptop2,
  X,
  UserPlus,
  ChevronDown,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

// =========================
//  Mini-modal CLIENT NOU
// =========================
function AddClientModal({ onClose, onSave }) {
  const [client, setClient] = useState({ name: "", phone: "", email: "" });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setClient((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!client.name.trim()) {
      toast.error("Te rog completează numele clientului.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(client),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Eroare la crearea clientului.");
      }

      toast.success("Client creat cu succes!");
      onSave(data); // trimitem clientul înapoi la modalul principal
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-5 border border-gray-200/70 dark:border-gray-700/70 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-500" />
            Adaugă client nou
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Nume complet
            </label>
            <input
              name="name"
              value={client.name}
              onChange={handleChange}
              className="input w-full"
              placeholder="Ex: Popescu Ion"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Telefon
              </label>
              <input
                name="phone"
                value={client.phone}
                onChange={handleChange}
                className="input w-full"
                placeholder="07xx xxx xxx"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={client.email}
                onChange={handleChange}
                className="input w-full"
                placeholder="exemplu@client.ro"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="btn-gray">
            Anulează
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="btn-blue"
          >
            {saving ? "Se salvează..." : "Salvează client"}
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================
//   Pagina principală
// =========================
export default function DevicesPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal fișă
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // mini-modal client nou
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  // client existent
  const [clientSearch, setClientSearch] = useState("");
  const [clientResults, setClientResults] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDevices, setClientDevices] = useState([]);
  const [searching, setSearching] = useState(false);

  // control dropdown altceva
  const [deviceTypeSelect, setDeviceTypeSelect] = useState("Laptop");
  const [brandSelect, setBrandSelect] = useState("Asus");
  const [serviceSelect, setServiceSelect] = useState("Diagnosticare");
  const [deliveryDays, setDeliveryDays] = useState(3);
  const [liquidContact, setLiquidContact] = useState("Nu");
  const [warrantySelect, setWarrantySelect] = useState("30 zile");
  const [priceConfirmed, setPriceConfirmed] = useState(false);

  // formular fișă
  const [form, setForm] = useState({
    clientName: "",
    phone: "",
    email: "",
    // device
    deviceTypeOther: "",
    brandOther: "",
    deviceType: "",
    brand: "",
    model: "",
    serialNumber: "",
    charger: "Nu",
    battery: "Nu",
    hdd: "Nu",
    // problemă
    problem: "",
    description: "",
    serviceOther: "",
    accessCode: "",
    // service
    technician: "",
    status: "Primire",
    priceEstimate: "",
    advance: "",
    notes: "",
    // derivat
    deliveryDate: "",
  });

  const resetForm = () => {
    setForm({
      clientName: "",
      phone: "",
      email: "",
      deviceTypeOther: "",
      brandOther: "",
      deviceType: "",
      brand: "",
      model: "",
      serialNumber: "",
      charger: "Nu",
      battery: "Nu",
      hdd: "Nu",
      problem: "",
      description: "",
      serviceOther: "",
      accessCode: "",
      technician: "",
      status: "Primire",
      priceEstimate: "",
      advance: "",
      notes: "",
      deliveryDate: "",
    });
    setDeviceTypeSelect("Laptop");
    setBrandSelect("Asus");
    setServiceSelect("Diagnosticare");
    setDeliveryDays(3);
    setLiquidContact("Nu");
    setWarrantySelect("30 zile");
    setPriceConfirmed(false);
    setSelectedClient(null);
    setClientSearch("");
    setClientResults([]);
    setClientDevices([]);
  };

  // încarcă fișele din DB
  const loadDevices = async () => {
    const res = await fetch("/api/devices");
    const data = await res.json();
    setDevices(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadDevices();
  }, []);

  // culoare status
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

  // căutare clienți
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
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  // select client existent
  const selectClient = async (client) => {
    setSelectedClient(client);
    setClientResults([]);
    setClientSearch(client.name || "");
    setForm((prev) => ({
      ...prev,
      clientName: client.name || "",
      phone: client.phone || "",
      email: client.email || "",
    }));

    try {
      const res = await fetch(`/api/devices/history?clientId=${client.id}`);
      const data = await res.json();
      setClientDevices(data || []);
    } catch {
      setClientDevices([]);
    }
  };

  // șterge client selectat (reset)
  const clearSelectedClient = () => {
    setSelectedClient(null);
    setClientDevices([]);
    setClientSearch("");
    setForm((prev) => ({
      ...prev,
      clientName: "",
      phone: "",
      email: "",
    }));
  };

  // select device anterior
  const selectPreviousDevice = (d) => {
    setForm((prev) => ({
      ...prev,
      deviceTypeOther: "",
      brandOther: "",
      deviceType: d.deviceType || "",
      brand: d.brand || "",
      model: d.model || "",
      serialNumber: d.serialNumber || "",
      description: d.description || "",
      problem: d.problem || "",
    }));
    toast.success("Datele dispozitivului au fost completate.");
  };

  // handle change general
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // submit fișă
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // determinăm tip device & brand finale
      const finalDeviceType =
        deviceTypeSelect === "Altceva" ? form.deviceTypeOther : deviceTypeSelect;
      const finalBrand =
        brandSelect === "Alt brand" ? form.brandOther : brandSelect;

      // calculăm deliveryDate pe baza termenului în zile
      const delivery = new Date();
      delivery.setDate(delivery.getDate() + Number(deliveryDays || 0));

      // construim text accessories
      const accessories = [
        form.charger === "Da" ? "Alimentator" : null,
        form.battery === "Da" ? "Baterie" : null,
        form.hdd === "Da" ? "HDD" : null,
      ]
        .filter(Boolean)
        .join(", ");

      // servicii solicitate
      const finalService =
        serviceSelect === "Altceva"
          ? form.serviceOther || "Alt serviciu"
          : serviceSelect;

      // notițe combinate
      const extraNotes = [
        form.notes && `Observații interne: ${form.notes}`,
        finalService && `Servicii solicitate: ${finalService}`,
        form.accessCode && `Cod acces: ${form.accessCode}`,
        deliveryDays && `Termen predare: ${deliveryDays} zile`,
        `Contact cu lichide: ${liquidContact}`,
        form.advance && `Avans: ${form.advance} lei`,
        warrantySelect && `Garanție intervenție: ${warrantySelect}`,
        `Preț confirmat: ${priceConfirmed ? "Da" : "Nu"}`,
      ]
        .filter(Boolean)
        .join(" | ");

      const payload = {
        clientName: form.clientName,
        phone: form.phone,
        email: form.email,
        deviceType: finalDeviceType,
        brand: finalBrand,
        model: form.model,
        serialNumber: form.serialNumber,
        problem: form.problem,
        accessories,
        description: form.description,
        technician: form.technician,
        status: form.status,
        priceEstimate: form.priceEstimate,
        notes: extraNotes,
        deliveryDate: delivery.toISOString(),
      };

      const res = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Eroare la salvare.");
      }

      toast.success("Fișa a fost salvată.");
      setShowModal(false);
      resetForm();
      loadDevices();
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ștergere fișă
  const handleDelete = async (id) => {
    if (!confirm("Sigur vrei să ștergi această fișă?")) return;
    try {
      const res = await fetch("/api/devices", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare la ștergere.");
      toast.success("Fișa a fost ștearsă.");
      loadDevices();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-gray-900">
        <h2 className="text-xl text-gray-700 dark:text-gray-200">
          🔒 Te rog să te autentifici...
        </h2>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            🔧 Fișe Service
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestionează rapid fișele de service, clienții și istoricul
            intervențiilor.
          </p>
        </div>
        <button
  onClick={() => router.push("/devices/create")}
  className="inline-flex items-center gap-2 btn-blue shadow-sm"
>
  <Plus className="w-5 h-5" />
  Adaugă fișă
</button>
      </div>

      {/* Lista fișe */}
      {loading ? (
        <p className="text-gray-500">Se încarcă...</p>
      ) : devices.length === 0 ? (
        <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center text-gray-500 dark:text-gray-400">
          Nu există încă nicio fișă. Apasă{" "}
          <span className="font-semibold">„Adaugă fișă”</span> pentru a crea
          prima fișă de service.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Client
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Dispozitiv
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Data
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {devices.map((d, i) => (
                <tr
                  key={d.id}
                  className="hover:bg-gray-50/80 dark:hover:bg-gray-800/60 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {d.client?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {d.deviceType || ""} {d.brand || ""}{" "}
                    {d.model ? `– ${d.model}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        d.status
                      )}`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(d.createdAt).toLocaleDateString("ro-RO")}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => router.push(`/devices/${d.id}`)}
                      className="inline-flex items-center justify-center rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                      title="Vezi detalii"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="inline-flex items-center justify-center rounded-full p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600"
                      title="Șterge fișa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL FIȘĂ SERVICE */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm modal-enter">
          <div className="w-full max-w-5xl bg-white dark:bg-gray-950 rounded-2xl shadow-2xl border border-gray-200/70 dark:border-gray-800/80 max-h-[92vh] overflow-y-auto animate-fade-in">
            <form onSubmit={handleSubmit}>
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-200/80 dark:border-gray-800/80 bg-white/90 dark:bg-gray-950/90 backdrop-blur">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    ➕ Fișă service nouă
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Completează detaliile clientului, dispozitivului și
                    intervenției.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="btn-gray"
                  >
                    Anulează
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-blue"
                  >
                    {saving ? "Se salvează..." : "💾 Salvează fișa"}
                  </button>
                </div>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* CLIENT */}
                <section className="bg-gradient-to-r from-slate-50 to-white dark:from-gray-900 dark:to-gray-950 rounded-xl p-5 border border-slate-200 dark:border-gray-800 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                        1
                      </span>
                      Client
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddClientModal(true)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      <UserPlus className="w-4 h-4" />
                      Client nou
                    </button>
                  </div>

                  {/* search client */}
                  <div className="relative mb-3">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Caută client existent după nume, telefon, email..."
                          value={clientSearch}
                          onChange={(e) => searchClients(e.target.value)}
                          className="input w-full pl-9"
                        />
                      </div>
                      {selectedClient && (
                        <button
                          type="button"
                          onClick={clearSelectedClient}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300"
                          title="Șterge clientul selectat"
                        >
                          <X className="w-3 h-3" />
                          Reset client
                        </button>
                      )}
                    </div>

                    {searching && (
                      <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Se caută clienți...
                      </p>
                    )}

                    {clientResults.length > 0 && (
                      <div className="absolute z-20 mt-1 w-full max-h-52 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl">
                        {clientResults.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => selectClient(c)}
                            className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-sm flex items-center justify-between"
                          >
                            <span>
                              <span className="font-medium">
                                {c.name || "—"}
                              </span>
                              <span className="block text-xs text-gray-500">
                                {c.phone || "fără telefon"} •{" "}
                                {c.email || "fără email"}
                              </span>
                            </span>
                            <ChevronDown className="w-4 h-4 text-gray-400 rotate-90" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* client selectat + istoricul */}
                  {selectedClient && (
                    <div className="mt-3 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/30 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                            ✅ Client selectat: {selectedClient.name}
                          </p>
                          <p className="text-xs text-blue-900/80 dark:text-blue-200/80">
                            ☎ {selectedClient.phone || "—"} • ✉{" "}
                            {selectedClient.email || "—"}
                          </p>
                        </div>
                      </div>

                      {clientDevices.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-blue-900/80 dark:text-blue-200/80 mb-1">
                            📜 Dispozitive anterioare:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {clientDevices.map((d) => (
                              <button
                                key={d.id}
                                type="button"
                                onClick={() => selectPreviousDevice(d)}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/80 dark:bg-gray-900/80 border border-blue-100 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-100 hover:bg-blue-50 dark:hover:bg-blue-900/70"
                              >
                                <Laptop2 className="w-3 h-3" />
                                {d.brand} {d.model}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* date client - manual / override */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="label">Nume complet</label>
                      <input
                        name="clientName"
                        value={form.clientName}
                        onChange={handleChange}
                        className="input"
                        placeholder="Nume și prenume"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Email</label>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        className="input"
                        placeholder="email@client.ro"
                      />
                    </div>
                    <div>
                      <label className="label">Telefon</label>
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="input"
                        placeholder="07xx xxx xxx"
                      />
                    </div>
                  </div>
                </section>

                {/* DETALII DISPOZITIV */}
                <section className="bg-gradient-to-r from-slate-50 to-white dark:from-gray-900 dark:to-gray-950 rounded-xl p-5 border border-slate-200 dark:border-gray-800 shadow-sm">
                  <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200 uppercase tracking-wide flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                      2
                    </span>
                    Detalii dispozitiv
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* tip device */}
                    <div>
                      <label className="label">Tip device</label>
                      <div className="flex gap-2">
                        <select
                          className="input flex-1"
                          value={deviceTypeSelect}
                          onChange={(e) => setDeviceTypeSelect(e.target.value)}
                        >
                          <option>Laptop</option>
                          <option>Telefon</option>
                          <option>PC</option>
                          <option>GPS</option>
                          <option>Altceva</option>
                        </select>
                      </div>
                      {deviceTypeSelect === "Altceva" && (
                        <input
                          name="deviceTypeOther"
                          value={form.deviceTypeOther}
                          onChange={handleChange}
                          className="input mt-2"
                          placeholder="Introduceți tipul dispozitivului"
                        />
                      )}
                    </div>

                    {/* brand */}
                    <div>
                      <label className="label">Brand</label>
                      <select
                        className="input"
                        value={brandSelect}
                        onChange={(e) => setBrandSelect(e.target.value)}
                      >
                        <option>Asus</option>
                        <option>HP</option>
                        <option>Lenovo</option>
                        <option>MSI</option>
                        <option>Gigabyte</option>
                        <option>Alt brand</option>
                      </select>
                      {brandSelect === "Alt brand" && (
                        <input
                          name="brandOther"
                          value={form.brandOther}
                          onChange={handleChange}
                          className="input mt-2"
                          placeholder="Introduceți brandul"
                        />
                      )}
                    </div>

                    {/* model + serie */}
                    <div>
                      <label className="label">Model</label>
                      <input
                        name="model"
                        value={form.model}
                        onChange={handleChange}
                        className="input"
                        placeholder="Ex: TUF Gaming F15"
                      />
                    </div>
                    <div>
                      <label className="label">Serie / IMEI</label>
                      <input
                        name="serialNumber"
                        value={form.serialNumber}
                        onChange={handleChange}
                        className="input"
                        placeholder="Număr serie sau IMEI"
                      />
                    </div>

                    {/* accesorii */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:col-span-2 mt-2">
                      <div>
                        <label className="label">Alimentator</label>
                        <select
                          name="charger"
                          value={form.charger}
                          onChange={handleChange}
                          className="input"
                        >
                          <option>Nu</option>
                          <option>Da</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">Baterie</label>
                        <select
                          name="battery"
                          value={form.battery}
                          onChange={handleChange}
                          className="input"
                        >
                          <option>Nu</option>
                          <option>Da</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">HDD</label>
                        <select
                          name="hdd"
                          value={form.hdd}
                          onChange={handleChange}
                          className="input"
                        >
                          <option>Nu</option>
                          <option>Da</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </section>

                {/* PROBLEMĂ / SERVICII */}
                <section className="bg-gradient-to-r from-slate-50 to-white dark:from-gray-900 dark:to-gray-950 rounded-xl p-5 border border-slate-200 dark:border-gray-800 shadow-sm">
                  <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200 uppercase tracking-wide flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                      3
                    </span>
                    Problemă & servicii
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="label">Defect reclamat</label>
                      <textarea
                        name="problem"
                        value={form.problem}
                        onChange={handleChange}
                        className="input min-h-[70px]"
                        placeholder="Descrie pe scurt problema raportată de client"
                      />
                    </div>

                    <div>
                      <label className="label">Observații client</label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="input min-h-[60px]"
                        placeholder="Alte detalii transmise de client..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="label">Servicii solicitate</label>
                        <select
                          className="input"
                          value={serviceSelect}
                          onChange={(e) => setServiceSelect(e.target.value)}
                        >
                          <option>Diagnosticare</option>
                          <option>Reparație</option>
                          <option>Altceva</option>
                        </select>
                        {serviceSelect === "Altceva" && (
                          <input
                            name="serviceOther"
                            value={form.serviceOther}
                            onChange={handleChange}
                            className="input mt-2"
                            placeholder="Scrie serviciul dorit"
                          />
                        )}
                      </div>

                      <div>
                        <label className="label">Cod de acces</label>
                        <input
                          name="accessCode"
                          value={form.accessCode}
                          onChange={handleChange}
                          className="input"
                          placeholder="PIN / parolă / model"
                        />
                      </div>

                      <div>
                        <label className="label">Termen predare</label>
                        <select
                          className="input"
                          value={deliveryDays}
                          onChange={(e) => setDeliveryDays(e.target.value)}
                        >
                          {Array.from({ length: 15 }).map((_, idx) => (
                            <option key={idx + 1} value={idx + 1}>
                              {idx + 1} zile
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="label">Contact cu lichide</label>
                        <select
                          className="input"
                          value={liquidContact}
                          onChange={(e) => setLiquidContact(e.target.value)}
                        >
                          <option>Nu</option>
                          <option>Da</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </section>

                {/* PREȚ & GARANȚIE */}
                <section className="bg-gradient-to-r from-slate-50 to-white dark:from-gray-900 dark:to-gray-950 rounded-xl p-5 border border-slate-200 dark:border-gray-800 shadow-sm">
                  <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200 uppercase tracking-wide flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                      4
                    </span>
                    Preț & garanție
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="label">Preț estimat</label>
                      <input
                        name="priceEstimate"
                        type="number"
                        value={form.priceEstimate}
                        onChange={handleChange}
                        className="input"
                        placeholder="Ex: 250"
                      />
                    </div>
                    <div>
                      <label className="label">Avans</label>
                      <input
                        name="advance"
                        type="number"
                        value={form.advance}
                        onChange={handleChange}
                        className="input"
                        placeholder="Ex: 50"
                      />
                    </div>
                    <div>
                      <label className="label">Garanție intervenție</label>
                      <select
                        className="input"
                        value={warrantySelect}
                        onChange={(e) => setWarrantySelect(e.target.value)}
                      >
                        <option>30 zile</option>
                        <option>90 zile</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPriceConfirmed((prev) => !prev)}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium border transition-colors ${
                          priceConfirmed
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700"
                        }`}
                      >
                        <span
                          className={`inline-flex h-4 w-4 items-center justify-center rounded-full border ${
                            priceConfirmed
                              ? "border-white bg-white/20"
                              : "border-gray-400"
                          }`}
                        >
                          {priceConfirmed && (
                            <Check className="w-3 h-3" />
                          )}
                        </span>
                        Preț confirmat la preluare
                      </button>
                    </div>

                    <div className="flex gap-3">
                      <div>
                        <label className="label">Tehnician</label>
                        <input
                          name="technician"
                          value={form.technician}
                          onChange={handleChange}
                          className="input"
                          placeholder="Nume tehnician"
                        />
                      </div>
                      <div>
                        <label className="label">Status</label>
                        <select
                          name="status"
                          value={form.status}
                          onChange={handleChange}
                          className="input"
                        >
                          <option>Primire</option>
                          <option>În așteptare</option>
                          <option>Reparat</option>
                          <option>Refuzat</option>
                          <option>Garanție</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="label">Observații interne</label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      className="input min-h-[60px]"
                      placeholder="Detalii interne (nu apar pe bonul clientului)..."
                    />
                  </div>
                </section>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MINI-MODAL CLIENT NOU */}
      {showAddClientModal && (
        <AddClientModal
          onClose={() => setShowAddClientModal(false)}
          onSave={(newClient) => {
            setSelectedClient(newClient);
            setClientSearch(newClient.name || "");
            setForm((prev) => ({
              ...prev,
              clientName: newClient.name || "",
              phone: newClient.phone || "",
              email: newClient.email || "",
            }));
          }}
        />
      )}
    </div>
  );
}