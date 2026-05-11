import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/current-user";
import BottomNav from "@/components/nav/BottomNav";
import TopNav from "@/components/nav/TopNav";
import ThemeToggle from "@/components/ui/ThemeToggle";
import ToastWatcher from "@/components/ui/ToastWatcher";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const signOut = (
    <form action="/auth/signout" method="post">
      <button
        className="inline-flex items-center gap-1.5 h-9 px-2 font-mono text-[11px] uppercase tracking-widest text-ink-3 hover:text-ink transition-colors"
        aria-label="Sign out"
      >
        Sign out
      </button>
    </form>
  );

  return (
    <div className="min-h-dvh pb-28 md:pb-12 pt-safe-top">
      {/* Desktop / tablet nav */}
      <TopNav signOut={signOut} />

      {/* Mobile-only masthead — kept simple */}
      <div className="md:hidden spine pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="display text-base">Brewmate</span>
          <span className="font-mono text-[10px] uppercase tracking-kissaten text-ink-3">
            日録
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {signOut}
        </div>
      </div>

      <main className="spine md:pt-6 lg:pt-8">{children}</main>
      <BottomNav />
      <ToastWatcher />
    </div>
  );
}
