"use client";

import Sidebar from "@/app/components/Sidebar";
import Navbar from "@/app/components/Navbar";

export default function ProtectedAppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100">
      {/* 🔹 Sidebar fix */}
      <Sidebar />

      {/* 🔹 Conținut principal */}
      <div className="flex-1 flex flex-col ml-56 md:ml-56 transition-all duration-300">
        {/* Navbar fix sus */}
        <Navbar />

        {/* 🔹 Zona de conținut scrollabil */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}