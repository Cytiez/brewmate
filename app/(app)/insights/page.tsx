import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import InsightsView from "@/components/insights/InsightsView";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createSupabaseServerClient();

  // One query gets us everything we need — RLS confines results to the user.
  // We compute the metrics in JS (a few hundred brews max per user).
  const { data: logs } = await supabase
    .from("brew_logs")
    .select(
      "id, brewed_at, dose_g, water_g, water_temp_c, grind_size, taste_rating, bean_id, bean:beans!brew_logs_bean_id_fkey(name, roast_date)",
    )
    .order("brewed_at", { ascending: false })
    .limit(500);

  // Supabase types embedded relations as arrays even when 1:1 via FK; normalize
  // to the InsightRow shape and drop the type-narrowing cast in one pass.
  const rows: InsightRow[] = ((logs ?? []) as any[]).map((r) => ({
    id: r.id,
    brewed_at: r.brewed_at,
    dose_g: r.dose_g,
    water_g: r.water_g,
    water_temp_c: r.water_temp_c,
    grind_size: r.grind_size,
    taste_rating: r.taste_rating,
    bean_id: r.bean_id,
    beans: r.bean ? { name: r.bean.name, roast_date: r.bean.roast_date ?? null } : null,
  }));

  if (rows.length < 5) {
    return (
      <div>
        <PageHeader title="Insights" sublabel="Patterns across your brews" />
        <EmptyState
          title="Not enough brews yet."
          body="Log at least 5 brews to start seeing patterns — streaks, taste trends, the bean that's working for you."
          ctaLabel="Log a brew"
          ctaHref="/log"
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Insights" sublabel={`Patterns across ${rows.length} brew${rows.length === 1 ? "" : "s"}`} />
      <InsightsView rows={rows} />
    </div>
  );
}

// Exported shape so InsightsView can stay typed without importing Supabase types.
export interface InsightRow {
  id: string;
  brewed_at: string;
  dose_g: number;
  water_g: number;
  water_temp_c: number | null;
  grind_size: string;
  taste_rating: "great" | "too_bitter" | "too_sour" | "too_weak" | "too_strong" | "flat";
  bean_id: string | null;
  beans: { name: string; roast_date: string | null } | null;
}
