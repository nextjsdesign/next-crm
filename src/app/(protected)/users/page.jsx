"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "technician",
    startHour: "09:00",
    endHour: "17:00",
    workHours: "",
    target: "",
    bonus: "",
    isActive: true,
  });

  // 🔐 acces doar pentru admin
  useEffect(() => {
    if (status === "loading") return;
    if (session?.user?.role !== "admin") {
      toast.error("Acces interzis — doar pentru administratori");
      router.push("/");
    }
  }, [status, session, router]);

  // 🔹 Fetch users
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch {
      toast.error("Eroare la încărcarea utilizatorilor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 Save user (add/edit)
  const handleSaveUser = async () => {
    try {
      const method = editingUser ? "PATCH" : "POST";
      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";

      const workHours =
        formData.startHour && formData.endHour
          ? `${formData.startHour}-${formData.endHour}`
          : "";

      const payload = { ...formData, workHours };

      if (editingUser && !formData.password.trim()) delete payload.password;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      await fetchUsers();
      toast.success(editingUser ? "Utilizator actualizat!" : "Utilizator adăugat!");
      setShowModal(false);
      setEditingUser(null);
      resetForm();
    } catch (err) {
      console.error("❌ Eroare la salvare:", err);
      toast.error("Eroare la salvare");
    }
  };

  // 🔹 Delete user
  const handleDeleteUser = async (id) => {
    if (!confirm("Ești sigur că vrei să ștergi acest utilizator?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await fetchUsers();
      toast.success("Utilizator șters cu succes!");
    } catch {
      toast.error("Eroare la ștergere");
    }
  };

  // 🔹 Toggle Activ/Inactiv cu notificare
  const toggleActive = async (id, value) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: value }),
      });

      if (!res.ok) throw new Error();

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isActive: value } : u))
      );

      toast(value ? "Cont activat" : "Cont dezactivat", {
        className: "text-sm text-gray-700 dark:text-gray-200",
      });
    } catch {
      toast.error("Eroare la schimbarea statusului");
    }
  };

  // ✅ Reset complet
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "technician",
      startHour: "09:00",
      endHour: "17:00",
      workHours: "",
      target: "",
      bonus: "",
      isActive: true,
    });
  };

  // 🔖 Badge pentru roluri
  const roleBadge = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300";
      case "technician":
        return "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300";
      case "receptionist":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-600/30 dark:text-gray-300";
    }
  };

  const ActionButton = ({ icon: Icon, onClick, color, hover }) => (
    <button
      onClick={onClick}
      className={`p-1.5 rounded-md transition ${color} ${hover}`}
    >
      <Icon size={17} strokeWidth={1.6} />
    </button>
  );

  if (loading)
    return <div className="p-6 text-gray-500">Se încarcă utilizatorii...</div>;

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-3">
        <h1 className="text-2xl font-semibold dark:text-white">
          Gestionare Utilizatori
        </h1>
        <button
          onClick={() => {
            setEditingUser(null);
            resetForm();
            setShowModal(true);
          }}
          className="btn-blue w-full sm:w-auto"
        >
          ➕ Adaugă Utilizator
        </button>
      </div>

      {/* ✅ Desktop Table */}
      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <table className="min-w-full text-sm rounded-2xl">
          <thead className="bg-gray-100 dark:bg-gray-900/60 text-gray-700 dark:text-gray-300">
            <tr>
              <th className="p-3 text-left font-medium">Nume</th>
              <th className="p-3 text-left font-medium">Email</th>
              <th className="p-3 text-left font-medium">Rol</th>
              <th className="p-3 text-center font-medium">Activ</th>
              <th className="p-3 text-center font-medium">Target</th>
              <th className="p-3 text-center font-medium">Bonus</th>
              <th className="p-3 text-center font-medium">Program</th>
              <th className="p-3 text-center font-medium">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr
                key={u.id}
                className={`border-t border-gray-200 dark:border-gray-700 ${
                  i % 2 === 0
                    ? "bg-white dark:bg-gray-900/40"
                    : "bg-gray-50 dark:bg-gray-900/20"
                }`}
              >
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-lg ${roleBadge(
                      u.role
                    )}`}
                  >
                    {u.role === "admin"
                      ? "Administrator"
                      : u.role === "technician"
                      ? "Tehnician"
                      : "Recepționer"}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={u.isActive}
                      onChange={(e) => toggleActive(u.id, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </td>
                <td className="p-3 text-center">
                  {u.role === "technician" ? u.target ?? "-" : "-"}
                </td>
                <td className="p-3 text-center">
                  {u.role === "technician" ? u.bonus ?? "-" : "-"}
                </td>
                <td className="p-3 text-center">
                  {u.role === "technician" ? u.workHours ?? "-" : "-"}
                </td>
                <td className="p-3 text-center flex justify-center gap-3">
                  <ActionButton
                    icon={Pencil}
                    color="text-gray-500 dark:text-gray-400"
                    hover="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-gray-700"
                    onClick={() => {
                      const [startHour, endHour] = u.workHours
                        ? u.workHours.split("-")
                        : ["09:00", "17:00"];
                      setEditingUser(u);
                      setFormData({ ...u, startHour, endHour, password: "" });
                      setShowModal(true);
                    }}
                  />
                  <ActionButton
                    icon={Trash2}
                    color="text-gray-400 dark:text-gray-500"
                    hover="hover:bg-red-50 hover:text-red-500 dark:hover:bg-gray-700"
                    onClick={() => handleDeleteUser(u.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Mobile Cards */}
      <div className="sm:hidden space-y-4">
        {users.map((u) => (
          <div
            key={u.id}
            className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm"
          >
            <div className="flex justify-between items-center">
  <div>
    <h2 className="font-semibold text-gray-800 dark:text-gray-100">
      {u.name}
    </h2>

    <p className="text-sm text-gray-500 dark:text-gray-400">
      {u.email}
    </p>

    {/* 🕒 Program — doar pentru tehnicieni și doar dacă există */}
    {u.role === "technician" && u.workHours && (
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
        <span>🕒</span> {u.workHours}
      </p>
    )}
  </div>

  <span
    className={`text-xs px-2 py-1 rounded-md font-medium ${roleBadge(
      u.role
    )}`}
  >
    {u.role}
  </span>
</div>

            {u.role === "technician" && (
              <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">🎯 Target</p>
                  <p className="font-medium">{u.target ?? "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">💰 Bonus</p>
                  <p className="font-medium">{u.bonus ?? "-"}</p>
                </div>
              </div>
            )}

            {/* 🔹 Toggle + Actions */}
            <div className="flex justify-between items-center mt-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={u.isActive}
                  onChange={(e) => toggleActive(u.id, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>

              <div className="flex gap-3">
                <ActionButton
                  icon={Pencil}
                  color="text-gray-500 dark:text-gray-400"
                  hover="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-gray-700"
                  onClick={() => {
                    const [startHour, endHour] = u.workHours
                      ? u.workHours.split("-")
                      : ["09:00", "17:00"];
                    setEditingUser(u);
                    setFormData({ ...u, startHour, endHour, password: "" });
                    setShowModal(true);
                  }}
                />
                <ActionButton
                  icon={Trash2}
                  color="text-gray-400 dark:text-gray-500"
                  hover="hover:bg-red-50 hover:text-red-500 dark:hover:bg-gray-700"
                  onClick={() => handleDeleteUser(u.id)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              {editingUser ? "Editează utilizator" : "Adaugă utilizator nou"}
            </h2>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nume complet"
                className="input w-full"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                className="input w-full"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <input
                type="password"
                placeholder={
                  editingUser ? "Lasă gol dacă nu vrei să schimbi parola" : "Parolă"
                }
                className="input w-full"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <select
                className="input w-full"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="technician">Tehnician</option>
                <option value="receptionist">Recepționer</option>
                <option value="admin">Administrator</option>
              </select>

              {formData.role === "technician" && (
  <div className="mt-4 space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4 animate-fadeIn">
    <div>
      <label className="label">🕒 Ore de acces CRM</label>
      <div className="flex gap-2">
        {/* Ora de început */}
        <select
          value={formData.startHour || "09:00"}
          onChange={(e) =>
            setFormData({ ...formData, startHour: e.target.value })
          }
          className="input flex-1"
        >
          {Array.from({ length: 24 }).map((_, i) => {
            const hour = `${i.toString().padStart(2, "0")}:00`;
            return (
              <option key={hour} value={hour}>
                {hour}
              </option>
            );
          })}
        </select>

        <span className="text-gray-500 self-center">-</span>

        {/* Ora de sfârșit */}
        <select
          value={formData.endHour || "17:00"}
          onChange={(e) =>
            setFormData({ ...formData, endHour: e.target.value })
          }
          className="input flex-1"
        >
          {Array.from({ length: 24 }).map((_, i) => {
            const hour = `${i.toString().padStart(2, "0")}:00`;
            return (
              <option key={hour} value={hour}>
                {hour}
              </option>
            );
          })}
        </select>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="label">🎯 Target (lei)</label>
        <input
          type="number"
          placeholder="ex: 5000"
          className="input w-full"
          value={formData.target || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              target: Number(e.target.value),
            })
          }
        />
      </div>
      <div>
        <label className="label">💰 Bonus (lei)</label>
        <input
          type="number"
          placeholder="ex: 300"
          className="input w-full"
          value={formData.bonus || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              bonus: Number(e.target.value),
            })
          }
        />
      </div>
    </div>
  </div>
)}

              {/* Toggle activ */}
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-gray-700 dark:text-gray-300">Cont activ:</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingUser(null);
                  resetForm();
                }}
                className="btn-gray"
              >
                Anulează
              </button>
              <button onClick={handleSaveUser} className="btn-blue">
                Salvează
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}