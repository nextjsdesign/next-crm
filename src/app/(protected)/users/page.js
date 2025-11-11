"use client";

import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    workHours: "09:00 - 18:00",
    target: 3000,
    bonus: 300,
  });

  // 🔹 Fetch utilizatori
  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 Schimbare input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Adaugă sau editează user
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingUser ? "PUT" : "POST";
    const body = editingUser ? { ...form, id: editingUser.id } : form;

    const res = await fetch("/api/users", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setForm({
        name: "",
        email: "",
        password: "",
        role: "user",
        workHours: "09:00 - 18:00",
        target: 3000,
        bonus: 300,
      });
      setEditingUser(null);
      fetchUsers();
    } else {
      alert("Eroare la salvare");
    }
  };

  // 🔹 Editează user
  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      workHours: user.workHours || "09:00 - 18:00",
      target: user.target || 3000,
      bonus: user.bonus || 300,
    });
  };

  // 🔹 Șterge user
  const handleDelete = async (id) => {
    if (!confirm("Sigur vrei să ștergi acest utilizator?")) return;

    const res = await fetch("/api/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) fetchUsers();
    else alert("Eroare la ștergere");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">👥 Utilizatori CRM</h1>

      {/* 🔹 Formular */}
      <form
        onSubmit={handleSubmit}
        className="mb-8 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-2xl"
      >
        <h2 className="text-lg font-semibold mb-4">
          {editingUser ? "✏️ Editează utilizator" : "➕ Adaugă utilizator"}
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nume</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border rounded-md p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border rounded-md p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Parolă</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={editingUser ? "Lasă gol dacă nu schimbi parola" : ""}
              className="w-full border rounded-md p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Rol</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border rounded-md p-2 bg-gray-50 dark:bg-gray-800"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="technician">Tehnician</option>
              <option value="receptie">Recepție</option>
            </select>
          </div>

          {form.role === "technician" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Ore acces</label>
                <input
                  type="text"
                  name="workHours"
                  value={form.workHours}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 bg-gray-50 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target (lei)</label>
                <input
                  type="number"
                  name="target"
                  value={form.target}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 bg-gray-50 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bonus (lei)</label>
                <input
                  type="number"
                  name="bonus"
                  value={form.bonus}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 bg-gray-50 dark:bg-gray-800"
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            {editingUser ? "Salvează modificările" : "Adaugă utilizator"}
          </button>
          {editingUser && (
            <button
              type="button"
              onClick={() => {
                setEditingUser(null);
                setForm({
                  name: "",
                  email: "",
                  password: "",
                  role: "user",
                  workHours: "09:00 - 18:00",
                  target: 3000,
                  bonus: 300,
                });
              }}
              className="ml-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Anulează
            </button>
          )}
        </div>
      </form>

      {/* 🔹 Carduri utilizatori */}
      {loading ? (
        <p>Se încarcă utilizatorii...</p>
      ) : (
        <div className="grid gap-4">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex justify-between items-center p-5 rounded-lg bg-white dark:bg-gray-900 shadow hover:shadow-lg transition-all"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {u.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{u.email}</p>
                <p className="text-sm capitalize text-gray-600 mt-1">
                  Rol: <span className="font-medium">{u.role}</span>
                </p>

                {u.role === "technician" && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    <p>⏰ Ore acces: {u.workHours || "09:00 - 18:00"}</p>
                    <p>🎯 Target: {u.target || 3000} lei</p>
                    <p>💰 Bonus: {u.bonus || 300} lei</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(u)}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Editează
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Șterge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}