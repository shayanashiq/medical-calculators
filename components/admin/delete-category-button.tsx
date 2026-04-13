"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteCategoryButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!window.confirm(`Delete category “${name}”? Calculators must not use this slug.`)) {
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      window.alert(data.error ?? "Delete failed.");
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void onDelete()}
      disabled={busy}
      className="font-semibold text-rose-600 hover:text-rose-800 disabled:opacity-50"
    >
      {busy ? "…" : "Delete"}
    </button>
  );
}
