"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteUnitPresetButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onDelete() {
    if (!window.confirm(`Delete unit preset “${name}”? Calculator fields that copied these units are not affected.`)) {
      return;
    }
    setPending(true);
    const res = await fetch(`/api/admin/unit-presets/${id}`, { method: "DELETE" });
    setPending(false);
    if (!res.ok) {
      window.alert("Could not delete preset.");
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void onDelete()}
      disabled={pending}
      className="text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
    >
      {pending ? "…" : "Delete"}
    </button>
  );
}
