"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
