import "./globals.css";
import SessionWrapper from "./providers/SessionWrapper";

export const metadata = {
  title: "CRM Next",
  description: "ProComputer CRM - Next.js version",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <body className="bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 transition-colors">
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}