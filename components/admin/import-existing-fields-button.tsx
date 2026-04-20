"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ImportResult = {
  scanned: number;
  created: number;
  linked: number;
};

export function ImportExistingFieldsButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onImport() {
    if (!window.confirm("Import fields from existing calculators and link matching rows?")) {
      return;
    }
    setBusy(true);
    const res = await fetch("/api/admin/shared-fields/import-existing", { method: "POST" });
    const data = (await res.json()) as ImportResult & { error?: string };
    setBusy(false);
    if (!res.ok) {
      window.alert(data.error ?? "Import failed.");
      return;
    }
    window.alert(`Imported: created ${data.created}, linked ${data.linked}, scanned ${data.scanned}.`);
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
