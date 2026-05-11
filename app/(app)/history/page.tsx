import { createSupabaseServerClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import HistoryItem, { type HistoryRow } from "@/components/history/HistoryItem";
import { computeDiffsForList } from "@/components/history/computeDiffs";
import FilterSheet from "@/components/history/FilterSheet";

export const dynamic = "force-dynamic";

type Search = {
  bean?: string;
  dripper?: string;
  taste?: string;
  from?: string;
  to?: string;
};

export default async function HistoryPage({ searchParams }: { searchParams: Search }) {
  const supabase = createSupabaseServerClient();

  const [{ data: beans }, { data: drippers }] = await Promise.all([
    supabase.from("beans").select("id, name").order("name"),
    supabase.from("equipment").select("id, name").eq("kind", "dripper").order("name"),
  ]);

  let q = supabase
    .from("brew_logs")
    .select(`
      id, brewed_at, dose_g, water_g, water_temp_c, grind_size, brew_time_seconds,
      taste_rating, taste_note, bean_id, dripper_id,
      bean:beans!brew_logs_bean_id_fkey(name),
      dripper:equipment!brew_logs_dripper_id_fkey(name),
      ai_suggestions(content)
    `)
    .order("brewed_at", { ascending: false })
    .limit(100);

  if (searchParams.bean)    q = q.eq("bean_id", searchParams.bean);
  if (searchParams.dripper) q = q.eq("dripper_id", searchParams.dripper);
  if (searchParams.taste)   q = q.eq("taste_rating", searchParams.taste);
  if (searchParams.from)    q = q.gte("brewed_at", searchParams.from);
  if (searchParams.to)      q = q.lte("brewed_at", searchParams.to);

  const { data } = await q;

  const rows: HistoryRow[] = (data ?? []).map((r: any) => ({
    id: r.id,
    brewed_at: r.brewed_at,
    dose_g: r.dose_g,
    water_g: r.water_g,
    water_temp_c: r.water_temp_c,
    grind_size: r.grind_size,
    brew_time_seconds: r.brew_time_seconds,
    taste_rating: r.taste_rating,
    taste_note: r.taste_note,
    bean: r.bean ? { name: r.bean.name } : null,
    dripper: r.dripper ? { name: r.dripper.name } : null,
    suggestion: r.ai_suggestions?.[0]?.content ?? null,
  }));

  const diffs = computeDiffsForList(rows);

  return (
    <div>
      <PageHeader
        title="The journal"
        eyebrow="日録 · brew log"
        action={
          <FilterSheet
            beans={(beans as any) ?? []}
            drippers={(drippers as any) ?? []}
            current={searchParams}
          />
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          title="The page is blank."
          body="Log a brew to begin keeping the journal."
          ctaLabel="Log a brew"
          ctaHref="/log"
        />
      ) : (
        <>
          <div className="flex items-baseline justify-between mb-3">
            <span className="font-mono text-[10px] uppercase tracking-kissaten text-ink-3">
              entries · <span className="num">{rows.length.toString().padStart(3, "0")}</span>
            </span>
            <span className="h-px flex-1 ml-4 bg-rule" />
          </div>
          <ul className="border-t border-rule">
            {rows.map((r, i) => (
              <li key={r.id}>
                <HistoryItem row={r} diffs={diffs.get(r.id) ?? []} index={i} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
