"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import {
  User,
  Laptop2,
  Wrench,
  ClipboardList,
  CircleDollarSign,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Clock,
} from "lucide-react";

export default function DeviceRepairPage() {
  const params = useParams();
  const router = useRouter();
  const deviceId = params?.id;

  const { data: session } = useSession();
  const currentUser = session?.user || null;
  const currentUserId = currentUser?.id || null;
  const currentRole = currentUser?.role || null;
  const isAdmin = currentRole === "admin";
  const isTechnician = currentRole === "technician";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const [device, setDevice] = useState(null);
  const [existingRepair, setExistingRepair] = useState(null);

  // 🔧 form state
  const [status, setStatus] = useState("În lucru");
  const [diagnostic, setDiagnostic] = useState("");
  const [techNotes, setTechNotes] = useState("");

  const [parts, setParts] = useState([{ label: "", qty: 1, price: "" }]);
  const [labor, setLabor] = useState([{ label: "", price: "" }]);

  // 👨‍🔧 tehnicieni pentru ASSIGN (admin)
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState("");
  const [assigning, setAssigning] = useState(false);

  // 📝 istoric note (RepairNote)
  const [repairNotes, setRepairNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // 🔐 drepturi de editare pentru FIȘĂ (nu pentru note)
  const assignedUserId = device?.userId || device?.user?.id || null;
  const assignedUserName = device?.user?.name || device?.technician || null;
  const isAssigned = !!assignedUserId;
  const isAssignedToMe =
    assignedUserId && currentUserId && assignedUserId === currentUserId;

  // ❗ regula:
  //  - admin = poate mereu edita
  //  - tehnician = poate edita DOAR dacă a preluat el lucrarea
  //  - dacă lucrarea NU este preluată → nimeni nu poate edita până nu apasă Preia lucrarea (except admin)
  const canEdit = isAdmin || isAssignedToMe;
  const isLocked = !canEdit;

  // cine poate scrie note:
  // - admin
  // - tehnicianul care are lucrarea
  // - ORICE user dacă fișa nu e preluată de nimeni (isAssigned = false)
  const canWriteNotes = isAdmin || isAssignedToMe || !isAssigned;

  // ===== FETCH DEVICE + REPAIR + TECHNICIANS =====
  useEffect(() => {
    if (!deviceId) return;

    const loadData = async () => {
      try {
        setLoading(true);

        // 🔹 1) Device info
        try {
          const resDevice = await fetch(
            `/api/devices/repair-init?deviceId=${deviceId}`,
            { cache: "no-store" }
          );
          if (resDevice.ok) {
            const dev = await resDevice.json();
            setDevice(dev);

            // dacă fișa are deja userId, îl putem propune ca selectat în dropdown
            if (dev?.userId) {
              setSelectedTechnicianId(dev.userId);
            }
          } else {
            setDevice(null);
          }
        } catch {
          setDevice(null);
        }

        // 🔹 2) Repair info
        try {
          const resRepair = await fetch(`/api/repairs?deviceId=${deviceId}`);
          if (resRepair.ok) {
            const data = await resRepair.json();
            if (data && data.repair) {
              const r = data.repair;
              setExistingRepair(r);

              setStatus(r.status || "În lucru");
              setDiagnostic(r.diagnostic || "");
              setTechNotes(r.notes || "");

              if (Array.isArray(r.items) && r.items.length > 0) {
                const partsItems = r.items.filter((it) => it.kind === "part");
                const laborItems = r.items.filter((it) => it.kind === "labor");

                setParts(
                  partsItems.length > 0
                    ? partsItems.map((it) => ({
                        label: it.label || "",
                        qty: it.qty || 1,
                        price: it.unitPrice?.toString() || "",
                      }))
                    : [{ label: "", qty: 1, price: "" }]
                );

                setLabor(
                  laborItems.length > 0
                    ? laborItems.map((it) => ({
                        label: it.label || "",
                        price: it.unitPrice?.toString() || "",
                      }))
                    : [{ label: "", price: "" }]
                );
              }
            }
          }
        } catch {
          // nu există încă fișă de reparație
        }

        // 🔹 3) Lista tehnicieni
        try {
          const resUsers = await fetch("/api/users");
          if (resUsers.ok) {
            const users = await resUsers.json();
            const techs = Array.isArray(users)
              ? users.filter((u) => u.role === "technician")
              : [];
            setTechnicians(techs);
          }
        } catch (err) {
          console.error("Eroare fetch tehnicieni:", err);
        }
      } catch (err) {
        console.error(err);
        toast.error("Eroare la încărcare fișă reparație.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [deviceId]);

  // ===== FETCH NOTES când avem existingRepair =====
  useEffect(() => {
    const repairId = existingRepair?.id;
    if (!repairId) {
      setRepairNotes([]);
      return;
    }

    const loadNotes = async () => {
      try {
        setNotesLoading(true);
        const res = await fetch(`/api/repair-notes?repairId=${repairId}`);
        if (res.ok) {
          const data = await res.json();
          setRepairNotes(data.notes || []);
        }
      } catch (err) {
        console.error("Eroare la încărcare note:", err);
      } finally {
        setNotesLoading(false);
      }
    };

    loadNotes();
  }, [existingRepair?.id]);

  // ===== CALCUL SUME =====
  const { totalParts, totalLabor, total } = useMemo(() => {
    const partsSum = parts.reduce((sum, p) => {
      const qty = Number(p.qty) || 0;
      const price = Number(p.price) || 0;
      return sum + qty * price;
    }, 0);

    const laborSum = labor.reduce((sum, l) => {
      const price = Number(l.price) || 0;
      return sum + price;
    }, 0);

    return {
      totalParts: partsSum,
      totalLabor: laborSum,
      total: partsSum + laborSum,
    };
  }, [parts, labor]);

  // ===== HELPERS Piese / Manoperă =====
  const updatePart = (index, field, value) => {
    setParts((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const addPart = () => {
    setParts((prev) => [...prev, { label: "", qty: 1, price: "" }]);
  };

  const removePart = (index) => {
    setParts((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== index)
    );
  };

  const updateLabor = (index, field, value) => {
    setLabor((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const addLabor = () => {
    setLabor((prev) => [...prev, { label: "", price: "" }]);
  };

  const removeLabor = (index) => {
    setLabor((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== index)
    );
  };

  // ===== PREIA LUCRAREA =====
  const handleClaim = async () => {
    if (!deviceId || !currentUserId) {
      toast.error("Nu avem user-ul sau fișa.");
      return;
    }

    try {
      setClaiming(true);
      const res = await fetch("/api/devices/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          userId: currentUserId,
          userName: currentUser.name,
        }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Nu am putut prelua lucrarea.");

      setDevice(data.device);
      if (data.repair) {
        setExistingRepair((prev) => ({
          ...(prev || {}),
          ...data.repair,
        }));
      }
      setSelectedTechnicianId(currentUserId);
      toast.success("Ai preluat lucrarea.");
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setClaiming(false);
    }
  };

  // ===== REASIGNEAZĂ (ASSIGN) – DOAR ADMIN =====
  const handleAssign = async () => {
    if (!isAdmin) {
      toast.error("Doar administratorul poate reasigna lucrarea.");
      return;
    }

    if (!selectedTechnicianId) {
      toast.error("Selectează un tehnician.");
      return;
    }

    const tech = technicians.find((t) => t.id === selectedTechnicianId);
    if (!tech) {
      toast.error("Tehnician invalid.");
      return;
    }

    try {
      setAssigning(true);
      const res = await fetch("/api/devices/assign", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          userId: tech.id,
          userName: tech.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare la reasignare.");

      setDevice(data.device);
      if (data.repair) {
        setExistingRepair((prev) => ({
          ...(prev || {}),
          ...data.repair,
        }));
      }

      toast.success("Lucrarea a fost reasignată.");
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setAssigning(false);
    }
  };

  // ===== ADĂUGARE NOTĂ ÎN ISTORIC =====
  const handleAddNote = async () => {
    if (!existingRepair?.id) {
      toast.error("Trebuie salvată fișa de reparație înainte să adaugi note.");
      return;
    }
    if (!currentUserId) {
      toast.error("Nu ești autentificat.");
      return;
    }
    if (!newNote.trim()) {
      toast.error("Introdu un mesaj pentru notă.");
      return;
    }
    if (!canWriteNotes) {
      toast.error("Nu ai drept să scrii note la această fișă.");
      return;
    }

    try {
      setAddingNote(true);
      const res = await fetch("/api/repair-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repairId: existingRepair.id,
          userId: currentUserId,
          message: newNote.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare la adăugarea notei.");

      setRepairNotes((prev) => [...prev, data.note]);
      setNewNote("");
      toast.success("Notă adăugată în istoric.");
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setAddingNote(false);
    }
  };

  // ===== SUBMIT =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deviceId) return;

    if (!canEdit) {
      toast.error("Nu ai drept de editare pe această fișă.");
      return;
    }

    try {
      setSaving(true);

      const body = {
        id: existingRepair?.id || null,
        deviceId,
        status,
        diagnostic,
        notes: techNotes,
        items: [
          ...parts
            .filter((p) => p.label || p.price)
            .map((p) => ({
              kind: "part",
              label: p.label,
              qty: Number(p.qty) || 1,
              unitPrice: Number(p.price) || 0,
            })),
          ...labor
            .filter((l) => l.label || l.price)
            .map((l) => ({
              kind: "labor",
              label: l.label,
              qty: 1,
              unitPrice: Number(l.price) || 0,
            })),
        ],
      };

      const res = await fetch("/api/repairs", {
        method: existingRepair ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Eroare la salvare reparație.");

      toast.success("Fișa de reparație a fost salvată.");
      setExistingRepair(data.repair || null);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-gray-600 dark:text-gray-300">
        <Loader2 className="mr-2 w-5 h-5 animate-spin" />
        Se încarcă fișa de reparație...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* HEADER + BACK */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Înapoi la fișe service
          </button>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-gray-400">
              Status fișă reparație
            </span>
            <span
              className={`
                inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                ${
                  status === "Finalizat"
                    ? "bg-green-100 text-green-700"
                    : status === "Refuzat"
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                }
              `}
            >
              <CheckCircle2 className="w-3 h-3" />
              {status}
            </span>
          </div>

          {/* INFO TEHNICIAN + BUTON PREIA LUCRAREA */}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>
              {assignedUserName
                ? `Lucrare preluată de: ${assignedUserName}`
                : "Lucrarea nu este preluată încă."}
            </span>

            {!isAssigned && (isTechnician || isAdmin) && (
              <button
                type="button"
                onClick={handleClaim}
                disabled={claiming}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-600 text-white text-[11px] hover:bg-emerald-700 disabled:opacity-60"
              >
                {claiming && <Loader2 className="w-3 h-3 animate-spin" />}
                {claiming ? "Se preia..." : "Preia lucrarea"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TITLU */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          🛠️ Fișă de reparație
        </h1>
        {device && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cod fișă:{" "}
            <span className="font-mono font-medium text-gray-800 dark:text-gray-200">
              {device.formCode || device.id}
            </span>
          </p>
        )}
      </div>

      {/* MESAJ BLOCAT / INFO DREPTURI */}
      {isLocked && !isAdmin && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 text-amber-800 text-xs px-3 py-2">
          Fișa este blocată pentru tine. Doar tehnicianul care a preluat lucrarea sau
          un administrator poate modifica această fișă. Poți totuși adăuga note în
          istoricul lucrării (dacă fișa nu este asignată altcuiva).
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* STÂNGA – 2/3: Info, diagnostic, piese, manoperă, note */}
        <div className="lg:col-span-2 space-y-6">
          {/* CARD: Info client + device (read-only) */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                <ClipboardList className="w-4 h-4 text-blue-500" />
                Rezumat fișă service
              </h2>
            </div>

            {device ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {/* CLIENT */}
                <div className="space-y-1">
                  <p className="text-gray-500 text-xs uppercase tracking-wide">
                    Client
                  </p>
                  <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1">
                    <User className="w-4 h-4 text-blue-500" />
                    {device.client?.name || "—"}
                  </p>
                  <p className="text-gray-500">
                    {device.client?.phone || "—"}
                    {device.client?.email ? (
                      <>
                        {" · "}
                        {device.client.email}
                      </>
                    ) : null}
                  </p>
                </div>

                {/* DISPOZITIV + DEFECT + OBSERVAȚII CLIENT */}
                <div className="space-y-1">
                  <p className="text-gray-500 text-xs uppercase tracking-wide">
                    Dispozitiv
                  </p>
                  <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1">
                    <Laptop2 className="w-4 h-4 text-blue-500" />
                    {device.deviceType || "—"} {device.brand} {device.model}
                  </p>

                  <p className="text-gray-500 text-xs">
                    <span className="font-semibold">Defect reclamat: </span>
                    {device.problem || "—"}
                  </p>

                  <p className="text-gray-500 text-xs">
                    <span className="font-semibold">Observații client: </span>
                    {device.description || device.receptionNotes || "—"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Nu am putut încărca detaliile fișei. Poți continua totuși completarea
                reparației.
              </p>
            )}
          </div>

          {/* CARD: Diagnostic tehnician + note interne */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                <Wrench className="w-4 h-4 text-blue-500" />
                Diagnostic tehnician
              </h2>
            </div>

            <textarea
              value={diagnostic}
              onChange={(e) => setDiagnostic(e.target.value)}
              placeholder="Descrie clar defectul real, testele efectuate, cauza identificată..."
              className="input min-h-[90px] text-sm"
              disabled={isLocked}
            />

            <textarea
              value={techNotes}
              onChange={(e) => setTechNotes(e.target.value)}
              placeholder="Note interne tehnician (ex: recomandări, observații, riscuri)..."
              className="input min-h-[70px] text-sm"
              disabled={isLocked}
            />
          </div>

          {/* CARD: Piese utilizate */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                <ClipboardList className="w-4 h-4 text-blue-500" />
                Piese utilizate
              </h2>
              <button
                type="button"
                onClick={addPart}
                disabled={isLocked}
                className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-60"
              >
                + Adaugă piesă
              </button>
            </div>

            <div className="space-y-3">
              {parts.map((row, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 items-center"
                >
                  <input
                    type="text"
                    value={row.label}
                    onChange={(e) =>
                      updatePart(index, "label", e.target.value)
                    }
                    placeholder="Denumire piesă"
                    className="input text-xs py-2 col-span-7"
                    disabled={isLocked}
                  />
                  <input
                    type="number"
                    min="1"
                    value={row.qty}
                    onChange={(e) =>
                      updatePart(index, "qty", e.target.value)
                    }
                    placeholder="Cant."
                    className="input text-xs py-2 text-center col-span-2"
                    disabled={isLocked}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.price}
                    onChange={(e) =>
                      updatePart(index, "price", e.target.value)
                    }
                    placeholder="Preț / buc"
                    className="input text-xs py-2 col-span-3"
                    disabled={isLocked}
                  />
                  {parts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePart(index)}
                      disabled={isLocked}
                      className="col-span-12 text-xs text-red-500 hover:text-red-600 text-right disabled:opacity-60"
                    >
                      Șterge
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CARD: Manoperă */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                <ClipboardList className="w-4 h-4 text-blue-500" />
                Manoperă
              </h2>
              <button
                type="button"
                onClick={addLabor}
                disabled={isLocked}
                className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-60"
              >
                + Adaugă manoperă
              </button>
            </div>

            <div className="space-y-3">
              {labor.map((row, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 items-center"
                >
                  <input
                    type="text"
                    value={row.label}
                    onChange={(e) =>
                      updateLabor(index, "label", e.target.value)
                    }
                    placeholder="Tip intervenție (ex: înlocuire display, curățare...)"
                    className="input text-xs py-2 col-span-8"
                    disabled={isLocked}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.price}
                    onChange={(e) =>
                      updateLabor(index, "price", e.target.value)
                    }
                    placeholder="Preț manoperă"
                    className="input text-xs py-2 col-span-4"
                    disabled={isLocked}
                  />
                  {labor.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLabor(index)}
                      disabled={isLocked}
                      className="col-span-12 text-xs text-red-500 hover:text-red-600 text-right disabled:opacity-60"
                    >
                      Șterge
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CARD: Istoric note lucrare – ULTIMUL */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                <ClipboardList className="w-4 h-4 text-blue-500" />
                Istoric note lucrare
              </h2>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {notesLoading ? (
                <div className="flex items-center text-xs text-gray-500">
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Se încarcă notele...
                </div>
              ) : repairNotes.length === 0 ? (
                <p className="text-xs text-gray-500">
                  Nu există încă note în istoric. Orice coleg poate adăuga o notă
                  (ex: client sunat, client anunțat, piesă comandată etc.),
                  în funcție de drepturile pe fișă.
                </p>
              ) : (
                repairNotes.map((note) => (
                  <div
                    key={note.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800 dark:text-gray-100 flex items-center gap-1">
                        <User className="w-3 h-3 text-blue-500" />
                        {note.user?.name || "User"}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-gray-500">
                        <Clock className="w-3 h-3" />
                        {note.createdAt
                          ? new Date(note.createdAt).toLocaleString("ro-RO")
                          : ""}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {note.message}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={
                  existingRepair
                    ? "Adaugă o notă (ex: clientul a fost sunat, clientul a confirmat, vine mâine după laptop...)"
                    : "Salvează întâi fișa de reparație pentru a adăuga note."
                }
                className="input min-h-[70px] text-xs"
                disabled={!existingRepair || !canWriteNotes || addingNote}
              />
              <button
                type="button"
                onClick={handleAddNote}
                disabled={
                  addingNote || !existingRepair || !canWriteNotes
                }
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-50"
              >
                {addingNote && <Loader2 className="w-3 h-3 animate-spin" />}
                {addingNote ? "Se adaugă..." : "➕ Adaugă notă în istoric"}
              </button>
            </div>
          </div>
        </div>

        {/* DREAPTA – 1/3: Status + costuri + acțiuni */}
        <div className="lg:col-span-1 space-y-6">
          {/* CARD: Status lucrare */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <Wrench className="w-4 h-4 text-blue-500" />
              Status lucrare
            </h2>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input text-sm py-2.5"
              disabled={isLocked}
            >
              <option value="În lucru">În lucru</option>
              <option value="În așteptare piese">În așteptare piese</option>
              <option value="Finalizat">Finalizat</option>
              <option value="Refuzat">Refuzat</option>
            </select>

            <div className="mt-3 space-y-2 text-xs text-gray-500 dark:text-gray-400">
              <p>Traseu recomandat:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>În lucru</li>
                <li>În așteptare piese (dacă e cazul)</li>
                <li>Finalizat</li>
                <li>Predat clientului (în fișa principală)</li>
              </ol>
            </div>
          </div>

          {/* CARD: Sumare costuri */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <CircleDollarSign className="w-4 h-4 text-green-500" />
              Costuri reparație
            </h2>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Piese</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {totalParts.toFixed(2)} lei
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Manoperă</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {totalLabor.toFixed(2)} lei
                </span>
              </div>
              <div className="h-[1px] bg-gray-200 dark:bg-gray-700 my-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Total
                </span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {total.toFixed(2)} lei
                </span>
              </div>
            </div>
          </div>

          {/* CARD: Salvare + ASSIGN */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              Acțiuni
            </h2>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Când salvezi, fișa de reparație se leagă de fișa de service și poate fi
              folosită la print și istoric.
            </p>

            <button
              type="submit"
              disabled={saving || isLocked}
              className="w-full inline-flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-xl disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Se salvează..." : "💾 Salvează fișa de reparație"}
            </button>

            {/* ASSIGN – doar pentru admin */}
            {isAdmin && (
              <div className="mt-4 space-y-2">
                <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Reasignează tehnicianul
                </h3>

                <select
                  value={selectedTechnicianId}
                  onChange={(e) => setSelectedTechnicianId(e.target.value)}
                  className="input text-sm"
                >
                  <option value="">Selectează tehnician</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleAssign}
                  disabled={assigning || !selectedTechnicianId}
                  className="w-full inline-flex justify-center items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2.5 rounded-xl disabled:opacity-50"
                >
                  {assigning && <Loader2 className="w-4 h-4 animate-spin" />}
                  {assigning ? "Se reasignează..." : "🔁 Reasignează lucrarea"}
                </button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}