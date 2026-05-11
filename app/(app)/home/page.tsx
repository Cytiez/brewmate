import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import Eyebrow from "@/components/ui/Eyebrow";
import TastePill from "@/components/ui/TastePill";
import { ArrowUpRight, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

function greeting() {
  const h = new Date().getHours();
  if (h < 5)  return { en: "Late night",  jp: "夜更け" };
  if (h < 11) return { en: "Good morning", jp: "おはよう" };
  if (h < 14) return { en: "Midday",       jp: "昼下がり" };
  if (h < 18) return { en: "Good afternoon", jp: "午後" };
  return        { en: "Good evening",     jp: "こんばんは" };
}

export default async function HomePage() {
  const supabase = createSupabaseServerClient();
  const user = await getCurrentUser();
  const firstName = (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ?? "Brewer";

  const [
    { count: beanCount },
    { count: logCount },
    { data: recent },
    { data: lastLog },
  ] = await Promise.all([
    supabase.from("beans").select("*", { count: "exact", head: true }),
    supabase.from("brew_logs").select("*", { count: "exact", head: true }),
    supabase
      .from("brew_logs")
      .select("id, brewed_at, taste_rating, dose_g, water_g, bean_id, bean:beans!brew_logs_bean_id_fkey(name)")
      .order("brewed_at", { ascending: false })
      .limit(5),
    supabase
      .from("brew_logs")
      .select("brewed_at")
      .order("brewed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const g = greeting();
  const lastBrewDate = lastLog?.brewed_at ? new Date(lastLog.brewed_at) : null;
  const daysSince = lastBrewDate ? Math.floor((Date.now() - lastBrewDate.getTime()) / 86400000) : null;
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });

  return (
    <div>
      {/* Masthead */}
      <header className="pt-2 pb-6 md:pb-10 mb-6 md:mb-10 border-b border-rule">
        <div className="flex items-center justify-between mb-4">
          <Eyebrow index={dateStamp()}>{today}</Eyebrow>
        </div>

        <h1 className="display text-[40px] sm:text-[52px] md:text-[68px] lg:text-[80px] leading-[0.98]">
          {g.en},
          <br />
          <span className="italic">{firstName}.</span>
        </h1>
        <p className="font-mono text-[11px] uppercase tracking-kissaten text-ink-2 mt-3 md:mt-4">
          {g.jp} · {lastBrewDate ? (daysSince === 0 ? "brewed today" : `${daysSince}d since last brew`) : "ready when you are"}
        </p>
      </header>

      <div className="md:grid md:grid-cols-[1.2fr_1fr] md:gap-10 lg:gap-14">
        {/* Left column: primary CTA + recent */}
        <div className="space-y-6 md:space-y-8">
          {/* Primary action */}
          <Link
            href="/log"
            className="group block border-hairline border-ink transition-colors hover:bg-ink hover:text-paper"
          >
            <div className="flex items-center justify-between p-5 md:p-7">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-kissaten text-ink-2 group-hover:text-paper/70 mb-2">
                  Today’s ritual
                </div>
                <div className="display text-2xl md:text-3xl leading-tight">
                  Pour a new brew
                </div>
              </div>
              <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center border-hairline border-ink group-hover:border-paper">
                <Plus className="h-5 w-5" strokeWidth={1.5} />
              </div>
            </div>
          </Link>

          {/* Recent brews */}
          <section>
            <div className="flex items-baseline justify-between mb-3">
              <Eyebrow index="recent">last brews</Eyebrow>
              <Link href="/history" className="font-mono text-[11px] uppercase tracking-widest text-ink-2 hover:text-ink transition-colors">
                view all →
              </Link>
            </div>

            {recent && recent.length > 0 ? (
              <ul className="border-t border-rule">
                {recent.map((r: any, i: number) => (
                  <li key={r.id}>
                    <Link
                      href={`/history#log-${r.id}`}
                      className="row hover:bg-elevated transition-colors"
                    >
                      <div className="flex items-baseline gap-3 min-w-0">
                        <span className="font-mono text-[11px] tabular-nums text-ink-3 w-6 flex-none">
                          {(i + 1).toString().padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          <div className="font-sans text-[15px] text-ink truncate">
                            {r.bean?.name ?? "Brew"}
                          </div>
                          <div className="font-mono text-[11px] uppercase tracking-widest text-ink-2 mt-0.5">
                            <span className="num">{r.dose_g}g</span>
                            <span className="text-ink-3"> · </span>
                            <span className="num">{r.water_g}g</span>
                            <span className="text-ink-3"> · </span>
                            {new Date(r.brewed_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </div>
                        </div>
                      </div>
                      <TastePill rating={r.taste_rating as any} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="border-t border-rule pt-8 text-center">
                <p className="text-[15px] text-ink-2 italic">The page is blank. Pour your first brew.</p>
              </div>
            )}
          </section>
        </div>

        {/* Right column: ledger + footer marks */}
        <aside className="mt-6 md:mt-0 md:sticky md:top-24 md:self-start space-y-6">
          {/* Stats ledger */}
          <section className="grid grid-cols-2 border-y border-rule">
            <Link href="/beans" className="group p-4 md:p-5 border-r border-rule hover:bg-elevated transition-colors">
              <Eyebrow>Library</Eyebrow>
              <div className="flex items-baseline justify-between mt-3">
                <div className="num text-[40px] md:text-[48px] leading-none">{beanCount ?? 0}</div>
                <ArrowUpRight className="h-4 w-4 text-ink-3 group-hover:text-ink translate-y-2 transition-colors" />
              </div>
              <div className="text-[13px] text-ink-2 mt-2">beans in the cupboard</div>
            </Link>
            <Link href="/history" className="group p-4 md:p-5 hover:bg-elevated transition-colors">
              <Eyebrow>Journal</Eyebrow>
              <div className="flex items-baseline justify-between mt-3">
                <div className="num text-[40px] md:text-[48px] leading-none">{logCount ?? 0}</div>
                <ArrowUpRight className="h-4 w-4 text-ink-3 group-hover:text-ink translate-y-2 transition-colors" />
              </div>
              <div className="text-[13px] text-ink-2 mt-2">brews logged</div>
            </Link>
          </section>

          {/* Marginal note — desktop only */}
          <aside className="hidden md:block pt-6 border-t border-rule">
            <Eyebrow>colophon</Eyebrow>
            <p className="display text-xl leading-snug mt-3 italic text-ink-2">
              一杯一会
            </p>
            <p className="text-[13px] text-ink-2 mt-2 leading-relaxed">
              <i>ichi-go ichi-e</i> — one cup, one encounter.
              Each brew is its own; record it, learn from it, let it go.
            </p>
          </aside>
        </aside>
      </div>

      {/* Mobile footer mark */}
      <div className="md:hidden mt-10 pt-6 border-t border-rule text-center">
        <p className="font-mono text-[11px] uppercase tracking-kissaten text-ink-2">
          一杯一会
        </p>
      </div>
    </div>
  );
}

function dateStamp() {
  const d = new Date();
  return `vol ${d.getFullYear() % 100} · no ${String(getDOY(d)).padStart(3, "0")}`;
}
function getDOY(d: Date) {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}
