import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { Plus } from "lucide-react";
import type { Equipment, EquipmentKind } from "@/lib/db-types";

export const dynamic = "force-dynamic";

const LABEL: Record<EquipmentKind, string> = {
  grinder: "Grinders",
  dripper: "Drippers",
  kettle:  "Kettles",
};

export default async function EquipmentPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("equipment")
    .select("*")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  const all = (data ?? []) as Equipment[];
  const grouped: Record<EquipmentKind, Equipment[]> = { grinder: [], dripper: [], kettle: [] };
  for (const e of all) grouped[e.kind].push(e);

  return (
    <div>
      <PageHeader
        title="The bench"
        action={
          <Link
            href="/equipment/new"
            className="inline-flex items-center gap-1.5 text-[14px] text-ink hover:text-persimmon transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Link>
        }
      />

      {all.length === 0 ? (
        <EmptyState
          title="Bench is bare."
          body="Add at least one grinder and one dripper to start logging brews."
          ctaLabel="Add equipment"
          ctaHref="/equipment/new"
        />
      ) : (
        <div className="space-y-9">
          {(Object.keys(LABEL) as EquipmentKind[]).map((kind) => (
            <section key={kind}>
              <h2 className="display text-xl text-ink mb-3">{LABEL[kind]}</h2>
              {grouped[kind].length === 0 ? (
                <p className="text-[14px] text-ink-3 italic">None yet.</p>
              ) : (
                <ul className="border-t border-rule md:grid md:grid-cols-2 md:gap-x-8 md:border-t-0 lg:grid-cols-3">
                  {grouped[kind].map((e) => (
                    <li key={e.id} className="md:border-t md:border-rule">
                      <Link
                        href={`/equipment/${e.id}/edit`}
                        className="block py-3 md:py-4 border-b border-rule md:border-b-0 hover:bg-elevated transition-colors -mx-5 px-5 md:-mx-3 md:px-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-serif text-lg md:text-xl text-ink truncate">{e.name}</div>
                            <div className="text-[13px] text-ink-2 mt-0.5">
                              {e.kind === "grinder" && e.grind_unit ? `Unit: ${e.grind_unit}` : null}
                              {e.kind === "kettle" ? (e.temp_control ? "Temperature control" : "No temperature control") : null}
                              {!e.grind_unit && e.kind !== "kettle" ? "—" : null}
                            </div>
                          </div>
                          {e.is_default ? (
                            <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-ink-2" />
                              Default
                            </span>
                          ) : null}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
