"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteCalculatorAction } from "@/app/actions/admin-actions";

export function DeleteCalculatorButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!globalThis.confirm(`Delete “${name}”? This cannot be undone.`)) {
      return;
    }
    setBusy(true);
    const res = await deleteCalculatorAction(id);
    setBusy(false);
    if (!res.ok) {
      alert(res.error ?? "Could not delete.");
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void handleDelete()}
      className="text-sm font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
    >
      {busy ? "…" : "Delete"}
    </button>
  );
}
