"use client";
import { useState } from "react";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState([
    { id: 1, name: "Ion Popescu", phone: "0721 123 456", email: "ion@example.com" },
    { id: 2, name: "Maria Ionescu", phone: "0742 654 321", email: "maria@example.com" },
    { id: 3, name: "George Enache", phone: "0733 555 888", email: "george@example.com" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", phone: "", email: "" });

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const addClient = () => {
    if (!newClient.name.trim() || !newClient.phone.trim()) {
      alert("Completează numele și telefonul!");
      return;
    }

    const nextId = clients.length ? clients[clients.length - 1].id + 1 : 1;
    setClients([...clients, { id: nextId, ...newClient }]);
    setNewClient({ name: "", phone: "", email: "" });
    setShowModal(false);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-zinc-900 transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          👥 Clienți
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg shadow-sm transition"
        >
          + Adaugă client
        </button>
      </div>

      {/* 🔍 Căutare */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="Caută client după nume sau telefon..."
          className="w-full max-w-md p-3 border border-gray-300 rounded-lg shadow-sm 
                     focus:ring-2 focus:ring-blue-500 focus:outline-none 
                     dark:bg-zinc-800 dark:text-gray-100 dark:border-zinc-700"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 🧾 Tabel clienți */}
      <div className="overflow-x-auto shadow-sm border border-gray-200 dark:border-zinc-700 rounded-lg">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300">
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Nume</th>
              <th className="px-6 py-3">Telefon</th>
              <th className="px-6 py-3">Email</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((client) => (
                <tr
                  key={client.id}
                  className="border-t border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                >
                  <td className="px-6 py-3">{client.id}</td>
                  <td className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">
                    {client.name}
                  </td>
                  <td className="px-6 py-3">{client.phone}</td>
                  <td className="px-6 py-3">{client.email || "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  Niciun client găsit.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🪟 Modal Add Client */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-xl w-full max-w-md relative">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Adaugă client nou
            </h2>

            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Nume client"
                className="p-3 rounded-lg border border-gray-300 dark:border-zinc-700 
                           dark:bg-zinc-900 dark:text-gray-100"
                value={newClient.name}
                onChange={(e) =>
                  setNewClient({ ...newClient, name: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Telefon"
                className="p-3 rounded-lg border border-gray-300 dark:border-zinc-700 
                           dark:bg-zinc-900 dark:text-gray-100"
                value={newClient.phone}
                onChange={(e) =>
                  setNewClient({ ...newClient, phone: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email (opțional)"
                className="p-3 rounded-lg border border-gray-300 dark:border-zinc-700 
                           dark:bg-zinc-900 dark:text-gray-100"
                value={newClient.email}
                onChange={(e) =>
                  setNewClient({ ...newClient, email: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 
                           text-gray-800 font-medium transition dark:bg-zinc-700 dark:text-gray-100"
              >
                Anulează
              </button>
              <button
                onClick={addClient}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 
                           text-white font-medium transition"
              >
                Salvează
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}