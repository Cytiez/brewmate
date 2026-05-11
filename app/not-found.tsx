import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-dvh flex items-center justify-center px-6">
      <div className="text-center max-w-[380px]">
        <div className="font-mono text-[10px] uppercase tracking-kissaten text-ink-3 mb-3">
          404 · 行方不明
        </div>
        <h1 className="display text-4xl mb-2">The page is empty.</h1>
        <p className="text-ink-2 text-[15px] leading-relaxed mb-8">
          Nothing was logged here. Maybe try the journal — or pour something new.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/home" className="btn-ink h-11 px-5">Go home</Link>
          <Link href="/log" className="btn-outline h-11 px-5">Log a brew</Link>
        </div>
      </div>
    </main>
  );
}
