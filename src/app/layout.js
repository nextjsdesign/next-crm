import "./globals.css";
import { Inter } from "next/font/google";
import Providers from "./providers";
import ThemeProvider from "./theme-provider";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "CRM Next",
  description: "Dashboard CRM",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen transition-colors duration-300`}
      >
        <ThemeProvider>
          <Providers>
            {children}
            {/* Notificări globale (toasts) */}
            <Toaster richColors position="top-right" />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
