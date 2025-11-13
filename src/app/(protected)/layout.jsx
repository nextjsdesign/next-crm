"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { Menu, X, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ProtectedLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();

  // 🔹 HOOKS – toate sus, în ordine fixă
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef(null);

  // 🔹 1. Marcare montare
  useEffect(() => setMounted(true), []);

  // 🔹 2. Redirect logic – NO RETURN EARLY!!!
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // 🔹 3. Click outside dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔹 Evităm return înainte ca hook-urile să ruleze
  const isLoading = status === "loading";
  const isLoggedOut = status === "unauthenticated";

  // 🔹 Meniu pe roluri
  const navItems = [
    { href: "/", label: "Dashboard", roles: ["admin", "technician", "receptionist"] },
    { href: "/clients", label: "Clients", roles: ["admin", "receptionist"] },
    { href: "/devices", label: "Devices", roles: ["admin", "technician", "receptionist"] },
    { href: "/users", label: "Users", roles: ["admin"] },
  ];

  // 🟡 Afișare loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600 dark:text-gray-300">
        Se verifică sesiunea...
      </div>
    );
  }

  // 🟡 Dacă userul nu e logat, nu afișăm layout-ul
  if (isLoggedOut) return null;

  // 🟢 DACA E LOGAT, ARĂTĂ TOT UI-UL
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      {/* Overlay mobil */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 lg:hidden transition-opacity ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside
        className={`fixed z-50 lg:static transform transition-transform backdrop-blur-xl bg-white/70 dark:bg-gray-800/60 shadow-md w-64 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 text-2xl font-bold text-center border-b dark:border-gray-700">
          CRM Next
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems
            .filter((item) => item.roles.includes(session?.user?.role))
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`block px-3 py-2 rounded-lg transition ${
                  pathname === item.href
                    ? "bg-blue-600 text-white"
                    : "hover:bg-blue-100 dark:hover:bg-gray-700 dark:text-gray-200"
                }`}
              >
                {item.label}
              </Link>
            ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="flex items-center justify-between bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl shadow px-4 py-3 relative">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 lg:hidden"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <h1 className="font-semibold dark:text-gray-100">CRM Next</h1>

          <div className="flex items-center space-x-3 relative" ref={dropdownRef}>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {mounted && (theme === "dark" ? <Sun size={20} /> : <Moon size={20} />)}
            </button>

            {/* Avatar */}
            <div className="relative">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  session.user.name || "User"
                )}&background=0D8ABC&color=fff`}
                alt="profile"
                className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 cursor-pointer hover:ring-2 hover:ring-blue-400 transition"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-fadeIn">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setDropdownOpen(false)}
                  >
                    🧍‍♂️ Profile
                  </Link>

                  {session?.user?.role === "admin" && (
                    <Link
                      href="/settings"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setDropdownOpen(false)}
                    >
                      ⚙️ Settings
                    </Link>
                  )}

                  <div className="border-t dark:border-gray-700"></div>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      signOut({ callbackUrl: "/login" });
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}