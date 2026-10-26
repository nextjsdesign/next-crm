"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Moon,
  Sun,
  LayoutDashboard,
  Users,
  FileText,
  User,
  X,
  Menu,
  Bell,
} from "lucide-react";
import { useTheme } from "next-themes";
import { createPortal } from "react-dom";
import { Toaster } from "react-hot-toast";

export default function ProtectedLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();

  // 📱 MOBILE drawer
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Închide meniul mobil și la schimbarea rutei (inclusiv Back/Forward).
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // 🖥️ DESKTOP pinned sidebar
  const [sidebarPinned, setSidebarPinned] = useState(false);

  // 🤏 hover expand
  const [hovered, setHovered] = useState(false);

  // 👤 avatar dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const avatarRef = useRef(null);
  const dropdownRef = useRef(null);

  // 🔔 notifications
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const bellRef = useRef(null);

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Închide dropdown-urile și la navigare, inclusiv Back/Forward.
  useEffect(() => {
    setDropdownOpen(false);
    setNotifOpen(false);
  }, [pathname]);

  // Close avatar dropdown
  useEffect(() => {
    if (!dropdownOpen) return;

    const handler = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !avatarRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  // Închide notificările la atingere/click în afara clopoțelului și panoului.
  useEffect(() => {
    if (!notifOpen) return;
    const closeOutside = (event) => {
      if (!notifRef.current?.contains(event.target) &&
          !bellRef.current?.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [notifOpen]);

  // 🔔 Load notifications
  useEffect(() => {
    if (!session?.user?.id) return;

    const load = async () => {
      try {
        const res = await fetch(`/api/notifications?userId=${session.user.id}`);
        const data = await res.json();
        const notifs = data.notifications || [];

        setNotifications(notifs);
        setUnread(notifs.filter((n) => !n.read).length);
      } catch (e) {
        console.error("Eroare la notificări:", e);
      }
    };

    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  if (!session) return null;

  // =========================
  //      SIDEBAR ITEMS
  // =========================
  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "technician", "receptionist"],
    },
    {
      href: "/clients",
      label: "Clients",
      icon: Users,
      roles: ["admin", "receptionist"],
    },
    {
      href: "/devices",
      label: "Devices",
      icon: FileText,
      roles: ["admin", "technician", "receptionist"],
    },
    {
      href: "/users",
      label: "Users",
      icon: User,
      roles: ["admin"],
    },
  ];

  const SidebarLink = ({ item, expanded }) => {
    const Icon = item.icon;
    const active = pathname.startsWith(item.href);

    return (
      <Link
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        onTouchEnd={(event) => {
          // Safari poate consuma prima atingere pentru :hover.
          // Navigăm explicit pe touch și prevenim click-ul duplicat.
          if (event.cancelable) event.preventDefault();
          setSidebarOpen(false);
          if (pathname !== item.href) router.push(item.href);
        }}
        className={`
          group flex items-center min-h-11 touch-manipulation transition-colors rounded-xl text-sm font-medium
          ${expanded ? "px-3 py-2.5 gap-3" : "justify-center p-3"}
          ${active ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 shadow-sm ring-1 ring-blue-100 dark:ring-blue-500/20" : "text-slate-600 dark:text-slate-300 lg:hover:bg-slate-100 dark:lg:hover:bg-slate-700/70"}
        `}
      >
        <Icon size={19} className="shrink-0" />
        {expanded && <span>{item.label}</span>}
      </Link>
    );
  };

  const isDesktop =
    typeof window !== "undefined" ? window.innerWidth >= 1024 : false;

  const expanded = isDesktop ? sidebarPinned || hovered : true;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 overflow-x-hidden">
      {/* Fundalul închide meniul mobil la prima atingere. */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Închide meniul"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* ===================== SIDEBAR ===================== */}
      <aside
        onMouseEnter={(event) => { if (event.nativeEvent?.pointerType !== "touch") setHovered(true); }}
        onMouseLeave={() => setHovered(false)}
        className={`
          fixed lg:static top-0 left-0 z-50
          h-screen lg:h-auto
          border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[2px_0_12px_rgba(15,23,42,0.03)]
          transition-all duration-300 flex flex-col

          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${expanded ? "lg:w-60" : "lg:w-[76px]"}

          w-60
        `}
      >
        <button
          type="button"
          aria-label="Închide meniul"
          onClick={() => setSidebarOpen(false)}
          className="absolute top-3 right-3 rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 lg:hidden"
        >
          <X size={20} />
        </button>
        {/* LOGO — click revine la Dashboard */}
        <Link
          href="/dashboard"
          aria-label="Mergi la Dashboard"
          title="Înapoi la Dashboard"
          onClick={() => setSidebarOpen(false)}
          className={`flex h-[72px] shrink-0 items-center border-b border-slate-200 dark:border-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${expanded ? "gap-3 px-4" : "justify-center px-2"}`}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-white shadow-sm dark:bg-slate-700">
            <FileText size={21} strokeWidth={2.2} aria-hidden="true" />
          </span>
          {expanded && (
            <span className="font-semibold tracking-tight text-base text-slate-900 dark:text-white">
              Devize Service
            </span>
          )}
        </Link>

        {/* MENU */}
        <nav className="p-3 pt-5 space-y-1.5">
          {navItems
            .filter((i) => i.roles.includes(session.user.role))
            .map((item) => (
              <SidebarLink key={item.href} item={item} expanded={expanded} />
            ))}
        </nav>
      </aside>

      {/* ===================== PAGE AREA ===================== */}
      <div className="min-w-0 flex-1 flex flex-col overflow-x-hidden">
        {/* ===================== NAVBAR ===================== */}
        <header className="flex h-[72px] shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6 dark:border-slate-800 dark:bg-slate-900 sticky top-0 z-20">
          {/* DESKTOP toggler */}
          <button
            aria-label={sidebarPinned ? "Restrânge meniul lateral" : "Fixează meniul lateral"}
            className="hidden lg:flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={() => setSidebarPinned((prev) => !prev)}
          >
            {sidebarPinned ? (
              <div className="flex flex-col gap-[3px]">
                <span className="w-5 h-[3px] bg-gray-700 dark:bg-gray-300 rounded"></span>
                <span className="w-5 h-[3px] bg-gray-700 dark:bg-gray-300 rounded"></span>
                <span className="w-5 h-[3px] bg-gray-700 dark:bg-gray-300 rounded"></span>
              </div>
            ) : (
              <X size={20} />
            )}
          </button>

          {/* MOBILE */}
          <button
            aria-label="Deschide meniul"
            className="lg:hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={() => setSidebarOpen((open) => !open)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="min-w-0 flex-1"><h1 className="truncate text-sm sm:text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">Devize Service</h1><p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400">Administrare service</p></div>

          <div className="flex items-center gap-3">
            {/* 🔔 NOTIFICATION BELL */}
            <div className="relative">
              <button
                ref={bellRef}
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1.5 py-[2px] rounded-full">
                    {unread}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div ref={notifRef} className="fixed top-16 right-3 left-3 sm:left-auto sm:right-6 sm:w-80 max-h-[min(24rem,calc(100dvh-5rem))] overflow-y-auto bg-white dark:bg-gray-900 border dark:border-gray-700 shadow-xl rounded-xl p-2 z-50">
                  {notifications.length === 0 && (
                    <p className="text-xs p-3 text-gray-500 text-center">
                      Nu ai notificări.
                    </p>
                  )}

                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`relative p-3 rounded-lg text-xs mb-1 transition cursor-pointer ${
                        n.read
                          ? "bg-gray-100 dark:bg-gray-800"
                          : "bg-blue-50 dark:bg-blue-900"
                      }`}
                    >
                      {/* DELETE BTN */}
                      <button
                        className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await fetch("/api/notifications", {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: n.id }),
                          });

                          setNotifications((prev) =>
                            prev.filter((x) => x.id !== n.id)
                          );
                          setUnread((prev) => prev - (n.read ? 0 : 1));
                        }}
                      >
                        <X size={12} />
                      </button>

                      {/* CLICK → mark read + navigate */}
                      <div
                        onClick={async () => {
                          // mark as read
                          if (!n.read) {
                            await fetch("/api/notifications", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: n.id }),
                            });

                            setNotifications((prev) =>
                              prev.map((x) =>
                                x.id === n.id ? { ...x, read: true } : x
                              )
                            );
                            setUnread((prev) => prev - 1);
                          }

                          setNotifOpen(false);

                          // FIX NAVIGATION
                          if (n.deviceId) {
                            router.push(`/devices/${n.deviceId}/repair`);
                          }
                        }}
                      >
                        <p className="font-medium">{n.message}</p>
                        <p className="text-[10px] text-gray-500">
                          {new Date(n.createdAt).toLocaleString("ro-RO")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* THEME SWITCH */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* AVATAR */}
            <img
              ref={avatarRef}
              src={`https://ui-avatars.com/api/?name=${session.user.name}&background=0D8ABC&color=fff`}
              className="w-8 h-8 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-500"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            />
          </div>
        </header>

        {/* ===================== DROPDOWN ===================== */}
        {dropdownOpen &&
          createPortal(
            <div
              ref={dropdownRef}
              className="fixed top-16 right-4 z-[9999] w-44 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-xl rounded-lg p-2"
            >
              <Link href="/profile" onClick={() => setDropdownOpen(false)} className="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                Profil
              </Link>

              {session.user.role === "admin" && (
                <Link href="/settings" onClick={() => setDropdownOpen(false)} className="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Setări
                </Link>
              )}

              <button
                className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => { setDropdownOpen(false); signOut({ callbackUrl: "/login" }); }}
              >
                Delogare
              </button>
            </div>,
            document.body
          )}

        {/* ===================== PAGE CONTENT ===================== */}
        <main className="flex-1 p-4 sm:p-6">{children}</main>

{/* TOASTER GLOBAL */}
<Toaster
  position="top-center"
  toastOptions={{
    style: {
      background: "#333",
      color: "#fff",
    },
  }}
/>
      </div>
    </div>
  );
}