"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteCategoryAction } from "@/app/actions/admin-actions";

export function DeleteCategoryButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!window.confirm(`Delete category “${name}”? Calculators must not use this slug.`)) {
      return;
    }
    setBusy(true);
    const res = await deleteCategoryAction(id);
    setBusy(false);
    if (!res.ok) {
      window.alert(res.error ?? "Delete failed.");
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
