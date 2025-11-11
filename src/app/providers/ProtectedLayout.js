"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function ProtectedLayout({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  // 🔄 Redirecționare automată dacă userul nu e logat
  useEffect(() => {
    if (status === "unauthenticated" && pathname !== "/login") {
      router.push("/login");
    }
  }, [status, pathname, router]);

  // ⏳ În timpul verificării — afișăm un loader
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Se verifică sesiunea...
      </div>
    );
  }

  // 🔒 Dacă e pagina de login — nu afișăm sidebar/nav
  if (pathname === "/login") {
    return children;
  }

  // ✅ Dacă userul e autentificat — afișăm CRM-ul complet
  return (
    <>
      <Sidebar />
      <div className="ml-56 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </>
  );
}