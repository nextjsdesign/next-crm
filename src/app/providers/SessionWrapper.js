"use client";

import { SessionProvider, useSession } from "next-auth/react";

export default function SessionWrapper({ children }) {
  return (
    <SessionProvider
      refetchOnWindowFocus={false}
      refetchInterval={0}
    >
      {children}
    </SessionProvider>
  );
}