import { createSupabaseServerClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import BrewLogForm from "@/components/log/BrewLogForm";
import type { Bean, BrewLog, Equipment } from "@/lib/db-types";

export const dynamic = "force-dynamic";

export default async function LogPage() {
  const supabase = createSupabaseServerClient();
  const [{ data: beans }, { data: equipment }, { data: lastLogs }] = await Promise.all([
    supabase.from("beans").select("*").order("is_active", { ascending: false }).order("created_at", { ascending: false }),
    supabase.from("equipment").select("*").order("is_default", { ascending: false }).order("created_at", { ascending: false }),
    supabase.from("brew_logs").select("*").order("brewed_at", { ascending: false }).limit(50),
  ]);

  const allBeans = (beans ?? []) as Bean[];
  const allEquipment = (equipment ?? []) as Equipment[];
  const allLogs = (lastLogs ?? []) as BrewLog[];

  const hasMinimal = allBeans.length > 0 && allEquipment.some((e) => e.kind === "dripper");

  if (!hasMinimal) {
    return (
      <div>
        <PageHeader title="New brew" />
        {allBeans.length === 0 ? (
          <EmptyState
            title="No beans, no brew."
            body="Add a bag to the cupboard before recording your first pour."
            ctaLabel="Add a bean"
            ctaHref="/beans/new"
          />
        ) : (
          <EmptyState
            title="Need a dripper."
            body="Tell us what you brew on so we can pre-fill the recipe."
            ctaLabel="Add equipment"
            ctaHref="/equipment/new"
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="New brew" />
      <BrewLogForm beans={allBeans} equipment={allEquipment} recentLogs={allLogs} />
    </div>
  );
}
