"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Sun, Moon, LogOut, User } from "lucide-react";

export default function Navbar({ onToggleSidebar }) {
  const { data: session } = useSession();

  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);
  const btnRef = useRef(null);

  // Tema la încărcare
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const newState = !darkMode;

    setDarkMode(newState);

    if (newState) {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Închiderea dropdown-ului la click în afară
  useEffect(() => {
    const handleClick = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !btnRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!session?.user) return null;

  const initial = session.user.name?.charAt(0).toUpperCase() || "?";

  return (
    <header
      className="
        h-16 flex items-center justify-between
        px-4 sm:px-6
        bg-white dark:bg-gray-900
        border-b border-gray-200 dark:border-gray-700
        sticky top-0 z-20
        w-full max-w-full overflow-x-hidden
      "
    >
      {/* LEFT — BUTON 3 Linii TailAdmin */}
      <button
        onClick={onToggleSidebar}
        className="
          p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800
          flex flex-col justify-center items-center space-y-1.5
        "
        title="Toggle sidebar"
      >
        <span className="block w-5 h-0.5 bg-gray-700 dark:bg-gray-300 rounded"></span>
        <span className="block w-5 h-0.5 bg-gray-700 dark:bg-gray-300 rounded"></span>
        <span className="block w-5 h-0.5 bg-gray-700 dark:bg-gray-300 rounded"></span>
      </button>

      {/* TITLE */}
      <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        CRM Next
      </h1>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4 relative max-w-full">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {darkMode ? (
            <Sun className="text-yellow-400" size={20} />
          ) : (
            <Moon className="text-gray-700 dark:text-gray-300" size={20} />
          )}
        </button>

        {/* Avatar button */}
        <button
          ref={btnRef}
          onClick={() => setMenuOpen(!menuOpen)}
          className="
            flex items-center justify-center 
            w-9 h-9 rounded-full 
            bg-blue-600 text-white 
            font-semibold cursor-pointer
          "
        >
          {initial}
        </button>

        {/* Dropdown */}
        {menuOpen && (
          <div
            ref={menuRef}
            className="
              absolute right-0 top-12
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              rounded-lg shadow-xl
              w-48 overflow-hidden z-[9999]
            "
          >
            <div className="px-4 py-3 border-b dark:border-gray-700">
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
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200"
                  onClick={() => setMenuOpen(false)}
                >
                  <User size={16} /> Profil
                </a>
              </li>

              <li>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="
                    flex items-center gap-2 w-full text-left 
                    px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-800/30
                  "
                >
                  <LogOut size={16} /> Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}