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
      <div className="px-5 md:px-10 pt-4 pb-2 flex items-center justify-end">
        <ThemeToggle />
      </div>

      <div className="flex-1 px-6 md:px-10 pb-safe-bottom flex flex-col justify-center mx-auto w-full max-w-[460px] md:max-w-[520px]">
        <div className="mb-10 animate-ink-fade">
          <h1 className="display text-[48px] sm:text-[60px] md:text-[68px] leading-[0.95] mb-4">
            <span className="block">Brew</span>
            <span className="block italic">mate.</span>
          </h1>
          <p className="text-ink-2 text-[15px] md:text-base leading-relaxed max-w-[360px]">
            A quiet journal for the way you make coffee at home.
          </p>
        </div>

        <div className="animate-ink-fade [animation-delay:120ms]">
          <LoginButton next={searchParams.next ?? "/home"} />
          <p className="sublabel mt-3 text-center">
            Log a brew. Track variables. Get a suggestion.
          </p>
        </div>

        <div className="mt-16 pt-6 border-t border-rule space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-widest text-ink-2 text-center">
            一杯一会 ／ ichi-go ichi-e
          </p>
          <p className="text-[12px] text-ink-3 text-center">
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
