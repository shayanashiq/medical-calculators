"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { importExistingFieldsAction } from "@/app/actions/admin-actions";

export function ImportExistingFieldsButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onImport() {
    if (!window.confirm("Import fields from existing calculators and link matching rows?")) {
      return;
    }
    setBusy(true);
    const data = await importExistingFieldsAction();
    setBusy(false);
    if (!data.ok) {
      window.alert(data.error ?? "Import failed.");
      return;
    }
    window.alert(`Imported: created ${data.data.created}, linked ${data.data.linked}, scanned ${data.data.scanned}.`);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void onImport()}
      disabled={busy}
      className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
    >
      {busy ? "Importing…" : "Import from existing calculators"}
    </button>
  );
}
