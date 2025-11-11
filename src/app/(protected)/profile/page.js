"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: session.user.id, name, email, password }),
    });

    const data = await res.json();
    if (res.ok) setMessage("✅ Profil actualizat cu succes!");
    else setMessage("❌ Eroare la actualizare: " + data.error);
  };

  if (!session?.user) return <p className="p-6">Neautentificat.</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white dark:bg-gray-800 rounded-xl shadow p-8">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
        Profil utilizator
      </h2>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
            Nume complet
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
            Parolă nouă (opțional)
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        {message && (
          <div className="text-sm text-center py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            {message}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-md transition"
        >
          Salvează modificările
        </button>
      </form>
    </div>
  );
}