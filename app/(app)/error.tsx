"use client";

import { useEffect } from "react";
import Link from "next/link";

// Scoped error boundary for the protected app. Doesn't break the bottom nav
// because Next renders this *inside* the (app) layout.
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="py-12 text-center">
      <div className="font-mono text-[10px] uppercase tracking-kissaten text-ink-3 mb-3">
        journal · error{error.digest ? ` · ${error.digest.slice(0, 8)}` : ""}
      </div>
      <h2 className="display text-2xl mb-2">A page didn’t load.</h2>
      <p className="text-ink-2 text-[15px] leading-relaxed max-w-[340px] mx-auto mb-6">
        The journal is fine — only this view failed. Try again, or step out
        and come back.
      </p>
      <div className="flex gap-3 justify-center">
        <button onClick={reset} className="btn-ink h-11 px-5">Try again</button>
        <Link href="/home" className="btn-outline h-11 px-5">Home</Link>
      </div>
    </div>
  );
}
