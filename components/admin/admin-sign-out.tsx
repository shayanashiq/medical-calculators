"use client";

import { signOut } from "next-auth/react";

export function AdminSignOut({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl: "/" })}
      className={
        className ??
        "text-sm font-semibold text-slate-600 hover:text-slate-900"
      }
    >
      Sign out
    </button>
  );
}
