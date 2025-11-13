"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Home,
  Users,
  Wrench,
  UserCog,
  Menu,
  X,
} from "lucide-react";

export default function Sidebar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // 🔗 Navigație în funcție de rol
  const links = [
    { name: "Dashboard", href: "/dashboard", icon: <Home size={18} /> },
    {
      name: "Clienți",
      href: "/clients",
      icon: <Users size={18} />,
      roles: ["admin", "receptionist"],
    },
    {
      name: "Dispozitive",
      href: "/devices",
      icon: <Wrench size={18} />,
      roles: ["admin", "technician", "receptionist"],
    },
    {
      name: "Utilizatori",
      href: "/users",
      icon: <UserCog size={18} />,
      roles: ["admin"],
    },
  ];

  // 🔄 Loading înainte să știe dacă userul e logat
  if (status === "loading") {
    return (
      <div className="fixed top-0 left-0 w-56 h-full bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 shadow-sm animate-pulse"></div>
    );
  }

  // 🚫 Dacă userul nu e logat → nu arătăm sidebar
  if (!session) return null;

  return (
    <>
      {/* 🔹 Buton meniu mobil */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 md:hidden bg-blue-600 text-white p-2 rounded-md shadow-md"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* 🔹 Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-56 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 shadow-sm transform transition-transform duration-300 z-40
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Header logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-zinc-800">
          <span className="text-lg font-bold text-blue-600">
            ProComputer CRM
          </span>
        </div>

        {/* Navigație */}
        <nav className="p-4 space-y-1">
          {links
            // firtrare după rol
            .filter((l) => !l.roles || l.roles.includes(session.user.role))
            .map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 p-2 rounded-md font-medium transition
                  ${
                    pathname === link.href
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                  }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
        </nav>
      </aside>
    </>
  );
}