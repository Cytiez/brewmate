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
      <TopNav signOut={signOut} />

      {/* Mobile-only quiet utility row — theme + sign-out tucked in the
          corner. No brand text here; the bottom nav identifies the app and the
          PageHeader carries the page title. */}
      <div className="md:hidden flex justify-end items-center spine pt-3 pb-1 gap-1">
        <ThemeToggle />
        {signOut}
      </div>

      <main className="spine md:pt-6 lg:pt-8">{children}</main>
      <BottomNav />
      <ToastWatcher />
    </div>
  );
}
