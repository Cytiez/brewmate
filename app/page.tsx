import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/current-user";
import ThemeToggle from "@/components/ui/ThemeToggle";

export const dynamic = "force-dynamic";

// Public-facing landing. Authenticated users skip past it to /home.
export default async function RootPage() {
  const user = await getCurrentUser();
  if (user) redirect("/home");

  return (
    <main className="min-h-dvh flex flex-col">
      {/* Masthead */}
      <header className="px-5 md:px-10 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="display text-base">Brewmate</span>
          <span className="font-mono text-[10px] uppercase tracking-kissaten text-ink-3">
            日録
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="font-mono text-[11px] uppercase tracking-widest text-ink hover:text-persimmon transition-colors"
          >
            Sign in →
          </Link>
        </div>
      </header>

      <div className="flex-1 mx-auto w-full max-w-[640px] md:max-w-[920px] px-6 md:px-10 pt-12 md:pt-24 pb-12">
        {/* Hero */}
        <section className="mb-16 md:mb-24">
          <div className="eyebrow mb-5 flex items-center gap-2">
            <span className="h-px w-8 bg-rule-strong" />
            <span>for home brewers</span>
          </div>
          <h1 className="display text-[48px] sm:text-[64px] md:text-[88px] leading-[0.96] mb-6">
            A quiet
            <br />
            <span className="italic">brew journal.</span>
          </h1>
          <p className="text-ink-2 text-[17px] md:text-[19px] leading-relaxed max-w-[560px] mb-8">
            Log each brew in under thirty seconds. Track every variable. Let the
            patterns surface. Get one well-aimed tasting note after every cup —
            no fluff, just what to change next time.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="btn-ink h-12 px-6 text-xs">
              Start your journal
            </Link>
            <Link href="#how" className="font-mono text-[11px] uppercase tracking-widest text-ink-2 hover:text-ink transition-colors">
              How it works →
            </Link>
          </div>
        </section>

        {/* Three-step */}
        <section id="how" className="mb-16 md:mb-24 grid md:grid-cols-3 md:gap-10 gap-10 border-t border-rule pt-10 md:pt-14">
          <Step
            n="01"
            title="Log the brew"
            body="Pick a bean, the dripper, dose, water, time, taste. Smart defaults pre-fill from your last pour."
          />
          <Step
            n="02"
            title="Read the variables"
            body="Every entry sits in a journal that highlights what changed since the last time you used the same bean."
          />
          <Step
            n="03"
            title="Get a master's note"
            body="An AI tasting coach reads bean profile, gear, recipe, and your taste rating — and tells you one specific thing to change."
          />
        </section>

        {/* Closing mark */}
        <section className="border-t border-rule pt-10 md:pt-14 mb-16">
          <div className="md:max-w-[520px]">
            <div className="eyebrow mb-3">colophon</div>
            <p className="display italic text-2xl md:text-3xl leading-snug mb-3">
              一杯一会
            </p>
            <p className="text-ink-2 text-[15px] md:text-base leading-relaxed">
              <i>Ichi-go ichi-e.</i> One cup, one encounter. Each brew is its
              own. Brewmate is built to honour that — record it, learn from it,
              let it go.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-rule pt-6 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-widest text-ink-3">
          <span>© {new Date().getFullYear()} Brewmate</span>
          <nav className="flex gap-5">
            <Link href="/privacy" className="hover:text-ink transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-ink transition-colors">Terms</Link>
            <Link href="/login" className="hover:text-ink transition-colors">Sign in</Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div>
      <div className="font-mono text-[11px] tabular-nums text-ink-3 mb-3">{n}</div>
      <h3 className="display text-2xl mb-2 leading-tight">{title}</h3>
      <p className="text-ink-2 text-[15px] leading-relaxed">{body}</p>
    </div>
  );
}
