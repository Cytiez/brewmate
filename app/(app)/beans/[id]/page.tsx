import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import TastePill from "@/components/ui/TastePill";
import Eyebrow from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { toggleBeanActive } from "../actions";
import type { Bean } from "@/lib/db-types";

export const dynamic = "force-dynamic";

export default async function BeanDetail({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: bean } = await supabase.from("beans").select("*").eq("id", params.id).maybeSingle();
  if (!bean) notFound();
  const b = bean as Bean;

  const { data: logs } = await supabase
    .from("brew_logs")
    .select("id, brewed_at, dose_g, water_g, taste_rating, water_temp_c, grind_size, brew_time_seconds")
    .eq("bean_id", b.id)
    .order("brewed_at", { ascending: false })
    .limit(20);

  const days = b.roast_date ? Math.floor((Date.now() - new Date(b.roast_date).getTime()) / 86400000) : null;

  return (
    <div>
      <PageHeader
        title={b.name}
        back="/beans"
        eyebrow={b.is_active ? "● active bean" : "bean"}
        action={
          <Link href={`/beans/${b.id}/edit`} className="font-mono text-[11px] uppercase tracking-widest text-ink-2 hover:text-ink transition-colors">
            Edit
          </Link>
        }
      />

      <div className="md:grid md:grid-cols-[1.1fr_1fr] md:gap-10 lg:gap-14">
        {/* Left: spec sheet + status */}
        <div>
          {/* Coffee-bag spec table */}
          <dl className="grid grid-cols-2 border-y border-rule mb-6 md:mb-8">
            <Spec label="Roaster" value={b.roaster ?? "—"} />
            <Spec label="Process" value={b.process ?? "—"} />
            <Spec label="Origin" value={[b.origin_country, b.origin_region].filter(Boolean).join(" / ") || "—"} />
            <Spec label="Roast" value={b.roast_level ?? "—"} />
            <Spec label="Altitude" value={b.altitude_masl ? `${b.altitude_masl} masl` : "—"} />
            <Spec label="Density" value={b.density ?? "—"} />
            <Spec label="Roast date" value={b.roast_date ?? "—"} />
            <Spec label="Off roast" value={days != null ? `${days} days` : "—"} />
          </dl>

          {b.flavor_notes?.length ? (
            <section className="mb-6 md:mb-8">
              <Eyebrow>Cupping notes</Eyebrow>
              <p className="display text-2xl md:text-3xl leading-snug mt-3 italic">
                {b.flavor_notes.join(" · ")}
              </p>
            </section>
          ) : null}

          <form
            action={async () => {
              "use server";
              await toggleBeanActive(b.id, !b.is_active);
            }}
            className="mb-8"
          >
            <Button variant={b.is_active ? "outline" : "ink"} size="lg" className="w-full md:w-auto md:min-w-[240px]">
              {b.is_active ? "Mark inactive" : "Mark active"}
            </Button>
          </form>
        </div>

        {/* Right: brews list */}
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <Eyebrow index="brews">recorded</Eyebrow>
            <span className="font-mono text-[11px] uppercase tracking-widest text-ink-2 num">
              {logs?.length ?? 0} entries
            </span>
          </div>

          {logs && logs.length > 0 ? (
            <ul className="border-t border-rule">
              {logs.map((l, i) => (
                <li key={l.id}>
                  <Link
                    href={`/history#log-${l.id}`}
                    className="block py-3 border-b border-rule hover:bg-elevated transition-colors -mx-5 px-5 md:-mx-6 md:px-6"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-mono text-[11px] uppercase tracking-widest text-ink-2 mb-0.5">
                          {(i + 1).toString().padStart(3, "0")} · {new Date(l.brewed_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                        <div className="text-[14px] md:text-[15px]">
                          <span className="num">{l.dose_g}g</span>
                          <span className="text-ink-3"> ／ </span>
                          <span className="num">{l.water_g}g</span>
                          <span className="text-ink-3"> · 1∶</span>
                          <span className="num">{(Number(l.water_g) / Number(l.dose_g)).toFixed(1)}</span>
                        </div>
                      </div>
                      <TastePill rating={l.taste_rating as any} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[15px] text-ink-2 italic border-t border-rule pt-6">No brews recorded with this bean yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3 md:py-4 px-4 md:px-5 odd:border-r border-rule border-b last:border-b-0 [&:nth-last-child(-n+2)]:border-b-0">
      <div className="font-mono text-[11px] uppercase tracking-kissaten text-ink-2 mb-1">{label}</div>
      <div className="text-[14px] md:text-[15px] text-ink truncate">{value}</div>
    </div>
  );
}
