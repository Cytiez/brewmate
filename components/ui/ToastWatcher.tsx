"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";

// Server actions can't surface toasts directly (server components have no client
// state). The convention here: actions redirect with ?ok=<kind> or ?err=<kind>;
// this watcher reads it, fires the toast, and scrubs the query so a refresh
// doesn't re-fire.
const OK_MESSAGES: Record<string, string> = {
  saved: "Saved.",
  deleted: "Deleted.",
};
const ERR_MESSAGES: Record<string, string> = {
  validation: "Check the form values.",
  save: "Could not save. Try again.",
  delete: "Could not delete.",
};

export default function ToastWatcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  useEffect(() => {
    const ok = params.get("ok");
    const err = params.get("err");
    if (!ok && !err) return;

    if (ok && OK_MESSAGES[ok]) toast.success(OK_MESSAGES[ok]);
    if (err && ERR_MESSAGES[err]) toast.error(ERR_MESSAGES[err]);

    // Strip the marker so refresh / back doesn't replay it.
    const next = new URLSearchParams(params);
    next.delete("ok");
    next.delete("err");
    const q = next.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }, [params, pathname, router]);

  return null;
}
