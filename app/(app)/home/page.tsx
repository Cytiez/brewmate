import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import TastePill from "@/components/ui/TastePill";
import { Plus, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

function greeting() {
  const h = new Date().getHours();
  if (h < 5)  return "Late night";
  if (h < 11) return "Good morning";
  if (h < 14) return "Midday";
  if (h < 18) return "Good afternoon";
  return        "Good evening";
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

  const lastBrewDate = lastLog?.brewed_at ? new Date(lastLog.brewed_at) : null;
  const daysSince = lastBrewDate ? Math.floor((Date.now() - lastBrewDate.getTime()) / 86400000) : null;
  const subline = lastBrewDate
    ? daysSince === 0
      ? "Brewed today."
      : `${daysSince} day${daysSince === 1 ? "" : "s"} since your last brew.`
    : "Ready when you are.";

  return (
    <div>
      {/* Headline + single sub-label. No date stamp eyebrow. */}
      <header className="pt-2 pb-6 md:pb-8 mb-6 md:mb-9 border-b border-rule">
        <h1 className="display text-[40px] sm:text-[52px] md:text-[64px] lg:text-[76px] leading-[0.98]">
          {greeting()},
          <br />
          <span className="italic">{firstName}.</span>
        </h1>
        <p className="sublabel mt-3 md:mt-4">{subline}</p>
      </header>

      <div className="md:grid md:grid-cols-[1.2fr_1fr] md:gap-10 lg:gap-14">
        {/* Left: primary action + recent */}
        <div className="space-y-8 md:space-y-10">
          <Link
            href="/log"
            className="group block border-hairline border-ink transition-colors hover:bg-ink hover:text-paper"
          >
            <div className="flex items-center justify-between p-5 md:p-7">
              <div>
                <div className="display text-2xl md:text-3xl leading-tight">
                  Pour a new brew
                </div>
                <div className="sublabel mt-1 group-hover:text-paper/70 transition-colors">
                  Quick log under thirty seconds.
                </div>
              </div>
              <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center border-hairline border-ink group-hover:border-paper">
                <Plus className="h-5 w-5" strokeWidth={1.5} />
              </div>
            </div>
          </Link>

          <section>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="display text-xl text-ink">Recent</h2>
              <Link href="/history" className="sublabel hover:text-ink transition-colors">
                View all →
              </Link>
            </div>

            {recent && recent.length > 0 ? (
              <ul className="border-t border-rule">
                {recent.map((r: any) => (
                  <li key={r.id}>
                    <Link
                      href={`/history#log-${r.id}`}
                      className="flex items-baseline justify-between gap-4 py-3 border-b border-rule hover:bg-elevated transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="font-sans text-[15px] text-ink truncate">
                          {r.bean?.name ?? "Brew"}
                        </div>
                        <div className="sublabel mt-0.5">
                          <span className="num">{r.dose_g}g</span> · <span className="num">{r.water_g}g</span>
                          {" · "}
                          {new Date(r.brewed_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
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

        {/* Right: two-cell ledger + insights link */}
        <aside className="mt-8 md:mt-0 md:sticky md:top-24 md:self-start">
          <section className="grid grid-cols-2 border-y border-rule">
            <Link href="/beans" className="p-4 md:p-5 border-r border-rule hover:bg-elevated transition-colors">
              <div className="num text-[40px] md:text-[48px] leading-none">{beanCount ?? 0}</div>
              <div className="sublabel mt-2">Beans in the cupboard</div>
            </Link>
            <Link href="/history" className="p-4 md:p-5 hover:bg-elevated transition-colors">
              <div className="num text-[40px] md:text-[48px] leading-none">{logCount ?? 0}</div>
              <div className="sublabel mt-2">Brews logged</div>
            </Link>
          </section>

          {(logCount ?? 0) >= 5 ? (
            <Link
              href="/insights"
              className="mt-3 flex items-center justify-between p-4 md:p-5 border-hairline border-rule hover:bg-elevated transition-colors"
            >
              <div>
                <div className="display text-lg">Insights</div>
                <div className="sublabel mt-1">Patterns across your brews</div>
              </div>
              <ChevronRight className="h-4 w-4 text-ink-3" />
            </Link>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
