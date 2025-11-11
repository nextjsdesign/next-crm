import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "../../lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h2 className="text-xl text-gray-700">Te rog să te autentifici...</h2>
      </div>
    );
  }

  // 🔹 Obținem statistici din baza de date
  const [clients, devices, warranties] = await Promise.all([
    prisma.client.count(),
    prisma.device.count(),
    prisma.device.count({ where: { status: "Garantie" } }),
  ]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
        Bun venit, {session.user.name || "utilizator"} 👋
      </h1>

      <p className="text-gray-500 dark:text-gray-400">
        Iată o privire rapidă asupra activității din sistem:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            📁 Total fișe service
          </h2>
          <p className="text-3xl font-bold mt-2 text-blue-600">{devices}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            👥 Clienți înregistrați
          </h2>
          <p className="text-3xl font-bold mt-2 text-green-600">{clients}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            🛡️ Fise în garanție
          </h2>
          <p className="text-3xl font-bold mt-2 text-yellow-500">{warranties}</p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Accesează secțiunile:
        </h2>

        <div className="flex flex-wrap gap-4">
          <a
            href="/devices"
            className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            🔧 Fise Service
          </a>
          <a
            href="/clients"
            className="px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            👥 Clienți
          </a>
          <a
            href="/warranty"
            className="px-5 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
          >
            🛡️ Garanții
          </a>
          <a
            href="/users"
            className="px-5 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            👑 Utilizatori
          </a>
        </div>
      </div>
    </div>
  );
}