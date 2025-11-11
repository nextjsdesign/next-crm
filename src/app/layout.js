import "./globals.css";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import SessionWrapper from "./providers/SessionWrapper";
import ProtectedLayout from "./providers/ProtectedLayout";

export const metadata = {
  title: "CRM Next",
  description: "ProComputer CRM - Next.js version",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <body className="bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 transition-colors">
        <SessionWrapper>
          {/* ✅ Folosim un wrapper care ascunde UI-ul dacă userul nu e logat */}
          <ProtectedLayout>{children}</ProtectedLayout>
        </SessionWrapper>
      </body>
    </html>
  );
}