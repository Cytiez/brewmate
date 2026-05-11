import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";

// Lean marketing chrome for /privacy, /terms — no auth required.
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="px-5 md:px-10 pt-4 pb-2 flex items-center justify-between border-b border-rule">
        <Link href="/" className="group">
          <span className="display text-base group-hover:text-persimmon transition-colors">Brewmate</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-[14px] text-ink hover:text-persimmon transition-colors"
          >
            Sign in →
          </Link>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-[720px] px-6 md:px-10 py-12 md:py-16">
        {children}
      </main>

      <footer className="px-5 md:px-10 py-6 border-t border-rule flex flex-wrap items-center justify-between gap-4 text-[13px] text-ink-3">
        <span>© {new Date().getFullYear()} Brewmate</span>
        <nav className="flex gap-5">
          <Link href="/" className="hover:text-ink transition-colors">Home</Link>
          <Link href="/privacy" className="hover:text-ink transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-ink transition-colors">Terms</Link>
        </nav>
      </footer>
    </div>
  );
}
