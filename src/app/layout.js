import "./globals.css";
import ThemeProvider from "./theme-provider";
import SessionWrapper from "./providers/SessionWrapper";

export const metadata = {
  title: "CRM Next Mario",
  description: "CRM Service ProComputer",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionWrapper>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
            {children}
          </ThemeProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}