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

export default function ProtectedLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();

  // 📱 MOBILE drawer
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🖥️ DESKTOP mode (Pinned = default)
  const [sidebarPinned, setSidebarPinned] = useState(true);

  // 🤏 DESKTOP hover expand
  const [hovered, setHovered] = useState(false);

  // 👤 Dropdown avatar
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const avatarRef = useRef(null);
  const dropdownRef = useRef(null);

  // 🔔 NOTIFICATIONS
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Close avatar dropdown when clicking outside
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
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  if (!session) return null;

  // =========================
  //        SIDEBAR ITEMS
  // =========================
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "technician", "receptionist"] },
    { href: "/clients",   label: "Clients",   icon: Users,            roles: ["admin", "receptionist"] },
    { href: "/devices",   label: "Devices",   icon: FileText,         roles: ["admin", "technician", "receptionist"] },
    { href: "/users",     label: "Users",     icon: User,             roles: ["admin"] },
  ];

  const SidebarLink = ({ item, expanded }) => {
    const Icon = item.icon;
    const active = pathname.startsWith(item.href);

    return (
      <Link
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        className={`
          flex items-center transition-all rounded-lg
          ${expanded ? "px-4 py-2 gap-3" : "justify-center p-3"}
          ${active ? "bg-blue-600 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-700"}
        `}
      >
        <Icon size={20} />
        {expanded && <span>{item.label}</span>}
      </Link>
    );
  };

  // Detect desktop safely for SSR
  const isDesktop =
    typeof window !== "undefined" ? window.innerWidth >= 1024 : false;

  // Sidebar expanded logic
  const expanded = isDesktop ? sidebarPinned || hovered : true;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">

      {/* ===================== SIDEBAR ===================== */}
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`
          fixed lg:static top-0 left-0 z-50
          h-screen lg:h-auto
          border-r dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg
          transition-all duration-300 flex flex-col

          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}

          ${expanded ? "lg:w-64" : "lg:w-20"}

          w-64
        `}
      >
        {/* LOGO */}
        <div className="flex items-center gap-2 px-4 py-4 border-b dark:border-gray-700">
          <img
            src="/logo.png"
            className={`${expanded ? "w-10 h-10" : "w-8 h-8 mx-auto"} transition-all`}
          />
          {expanded && (
            <span className="font-bold text-lg text-gray-900 dark:text-white">
              ProComputer
            </span>
          )}
        </div>

        {/* MENU */}
        <nav className="p-3 space-y-1">
          {navItems
            .filter((i) => i.roles.includes(session.user.role))
            .map((item) => (
              <SidebarLink key={item.href} item={item} expanded={expanded} />
            ))}
        </nav>
      </aside>

      {/* ===================== PAGE AREA ===================== */}
      <div className="flex-1 flex flex-col overflow-x-hidden">

        {/* ===================== NAVBAR ===================== */}
        <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 shadow-md sticky top-0 z-20">

          {/* DESKTOP toggler */}
          <button
            className="hidden lg:flex p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
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
            className="lg:hidden p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <h1 className="font-semibold dark:text-gray-100">CRM Next</h1>

          <div className="flex items-center gap-3">

{/* 🔔 NOTIFICATION BELL */}
<div className="relative">
  <button
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
    <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-900 border dark:border-gray-700 shadow-xl rounded-xl p-2 z-50">

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

              // scoatem instant din UI
              setNotifications((prev) =>
                prev.filter((x) => x.id !== n.id)
              );
              setUnread((prev) =>
                prev - (n.read ? 0 : 1)
              );
            }}
          >
            <X size={12} />
          </button>

          {/* CLICK = mark as read + navigate */}
          <div
            onClick={async () => {
              if (!n.read) {
                await fetch("/api/notifications", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: n.id }),
                });

                // update instant UI
                setNotifications((prev) =>
                  prev.map((x) =>
                    x.id === n.id ? { ...x, read: true } : x
                  )
                );
                setUnread((prev) => prev - 1);
              }

              setNotifOpen(false);

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
              <Link href="/profile" className="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                Profil
              </Link>

              {session.user.role === "admin" && (
                <Link href="/settings" className="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Setări
                </Link>
              )}

              <button
                className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                Delogare
              </button>
            </div>,
            document.body
          )}

        {/* ===================== PAGE CONTENT ===================== */}
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}