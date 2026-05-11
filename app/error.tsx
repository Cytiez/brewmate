"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function RouteError({
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
    <main className="min-h-dvh flex items-center justify-center px-6">
      <div className="text-center max-w-[360px]">
        <div className="font-mono text-[10px] uppercase tracking-kissaten text-ink-3 mb-3">
          error · 500{error.digest ? ` · ${error.digest.slice(0, 8)}` : ""}
        </div>
        <h1 className="display text-3xl mb-2">Something brewed wrong.</h1>
        <p className="text-ink-2 text-[15px] leading-relaxed mb-6">
          We couldn’t finish loading this page. The error has been logged.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-ink h-11 px-5">Try again</button>
          <Link href="/home" className="btn-outline h-11 px-5">Go home</Link>
        </div>
      </div>
    </main>
  );
}
