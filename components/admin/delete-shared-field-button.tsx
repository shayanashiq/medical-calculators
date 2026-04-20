"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteSharedFieldButton({ id, label }: { id: string; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!window.confirm(`Delete shared field “${label}”?`)) {
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/admin/shared-fields/${id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      window.alert("Could not delete shared field.");
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void onDelete()}
      disabled={busy}
      className="text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
    >
      {busy ? "…" : "Delete"}
    </button>
  );
}
