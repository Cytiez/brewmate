import ThemeToggle from "@/components/ui/ThemeToggle";
import LoginButton from "./LoginButton";

export const metadata = { title: "Sign in — Brewmate" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return (
    <main className="min-h-dvh flex flex-col">
      <div className="px-5 md:px-10 pt-4 pb-2 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-kissaten text-ink-2">日録</span>
        <ThemeToggle />
      </div>

      <div className="flex-1 px-6 md:px-10 pb-safe-bottom flex flex-col justify-center mx-auto w-full max-w-[460px] md:max-w-[520px]">
        <div className="mb-10 animate-ink-fade">
          <div className="eyebrow mb-6 flex items-center gap-2">
            <span className="h-px w-8 bg-rule-strong" />
            <span>est. 2026 · home brewers only</span>
          </div>
          <h1 className="display text-[44px] sm:text-[56px] md:text-[64px] leading-[0.95] mb-4">
            <span className="block">Brew</span>
            <span className="block italic">mate.</span>
          </h1>
          <p className="text-ink-2 text-[15px] md:text-base leading-relaxed max-w-[360px]">
            A quiet journal for the way you make coffee at home.
            Log the variables. Read the patterns. Dial it in.
          </p>
        </div>

        <div className="animate-ink-fade [animation-delay:120ms]">
          <LoginButton next={searchParams.next ?? "/home"} />
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 animate-ink-fade [animation-delay:200ms]">
          <Stat n="01" label="Log a brew" />
          <Stat n="02" label="Track variables" />
          <Stat n="03" label="Get a suggestion" />
        </div>

        <div className="mt-16 pt-6 border-t border-rule space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-kissaten text-ink-2 text-center">
            一杯一会 ／ ichi-go ichi-e ／ one cup, one encounter
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-3 text-center">
            By signing in you agree to our{" "}
            <a href="/terms" className="underline underline-offset-4 hover:text-ink transition-colors">terms</a>
            {" "}and{" "}
            <a href="/privacy" className="underline underline-offset-4 hover:text-ink transition-colors">privacy policy</a>.
          </p>
        </div>
      </div>
    </main>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-mono text-[11px] tracking-widest text-ink-2 mb-1">{n}</div>
      <div className="text-[14px] md:text-[15px] leading-tight text-ink">{label}</div>
    </div>
  );
}
