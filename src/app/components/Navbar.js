"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Sun, Moon, LogOut, User } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // 🌓 Tema
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  if (!session?.user) return null;

  const initial = session.user.name?.charAt(0).toUpperCase() || "?";

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-10 transition-colors">
      <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        CRM Dashboard
      </h1>

      <div className="flex items-center gap-4 relative">
        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          title={darkMode ? "Mod luminos" : "Mod întunecat"}
        >
          {darkMode ? (
            <Sun className="text-yellow-400" size={20} />
          ) : (
            <Moon className="text-gray-700 dark:text-gray-300" size={20} />
          )}
        </button>

        {/* Avatar */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white font-semibold"
            title="Meniu utilizator"
          >
            {initial}
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 z-20">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="font-medium text-gray-900 dark:text-white">
                  {session.user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {session.user.role}
                </p>
              </div>
              <ul className="text-sm">
                <li>
                  <a
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                  >
                    <User size={16} /> Profil
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-800/30 transition"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}