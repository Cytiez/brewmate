import TastePill from "@/components/ui/TastePill";
import GetSuggestionButton from "./GetSuggestionButton";
import type { Pour, TasteRating } from "@/lib/db-types";

export interface HistoryRow {
  id: string;
  brewed_at: string;
  dose_g: number;
  water_g: number;
  water_temp_c: number | null;
  grind_size: string;
  brew_time_seconds: number;
  immersion: boolean;
  pours: Pour[];
  taste_rating: TasteRating;
  taste_note: string | null;
  bean: { name: string } | null;
  dripper: { name: string } | null;
  suggestion: string | null;
}

export interface VariableDiff {
  label: string;
  delta: string;
}

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const r = (s % 60).toString().padStart(2, "0");
  return `${m}:${r}`;
}

export default function HistoryItem({ row, diffs }: { row: HistoryRow; diffs: VariableDiff[]; index?: number }) {
  const ratio = Number(row.water_g) / Number(row.dose_g);
  const d = new Date(row.brewed_at);

  const dateLine = `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  const subInfo = [
    row.dripper?.name ?? null,
    row.immersion ? "immersion" : null,
    row.pours?.length ? `${row.pours.length} pours` : null,
  ].filter(Boolean).join(" · ");

  return (
    <article id={`log-${row.id}`} className="py-6 md:py-8 border-b border-rule">
      {/* Headline row */}
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <p className="sublabel">{dateLine}</p>
        <TastePill rating={row.taste_rating} />
      </div>

      <h3 className="display text-xl md:text-2xl leading-tight truncate">
        {row.bean?.name ?? "Brew"}
      </h3>
      {subInfo && <p className="text-[13px] text-ink-3 mt-1">{subInfo}</p>}

      {/* Compact summary line (mobile) + 6-cell grid (md+) */}
      <p className="num text-[13px] text-ink-2 mt-3 md:hidden">
        <span className="text-ink">{row.dose_g}g</span>
        <Sep />
        <span className="text-ink">{row.water_g}g</span>
        <Sep />
        <span className="text-ink">1∶{ratio.toFixed(1)}</span>
        <Sep />
        <span className="text-ink">{row.water_temp_c != null ? `${row.water_temp_c}°` : "—"}</span>
        <Sep />
        <span className="text-ink">{fmtTime(row.brew_time_seconds)}</span>
        <Sep />
        <span className="text-ink">{row.grind_size}</span>
      </p>
      <dl className="hidden md:grid grid-cols-6 gap-x-4 mt-4">
        <Metric label="Dose"  value={`${row.dose_g}g`} />
        <Metric label="Water" value={`${row.water_g}g`} />
        <Metric label="Ratio" value={`1∶${ratio.toFixed(1)}`} />
        <Metric label="Temp"  value={row.water_temp_c != null ? `${row.water_temp_c}°` : "—"} />
        <Metric label="Time"  value={fmtTime(row.brew_time_seconds)} />
        <Metric label="Grind" value={row.grind_size} />
      </dl>

      {/* Pour schedule */}
      {row.pours?.length ? (
        <div className="mt-4 pt-3 border-t border-rule">
          <p className="sublabel mb-2">Pour schedule</p>
          <ol className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-1.5">
            {row.pours.map((p, i) => (
              <li key={i} className="font-mono text-[12px] tabular-nums text-ink">
                <span className="text-ink-3">{(i + 1).toString().padStart(2, "0")}</span>{" "}
                <span>{fmtTime(p.time_seconds)}</span>
                <span className="text-ink-3"> · </span>
                <span>{p.water_g}g</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {/* Variable diffs vs previous brew of the same bean */}
      {diffs.length > 0 ? (
        <div className="mt-4 pt-3 border-t border-rule">
          <p className="sublabel mb-2">Changed</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1.5">
            {diffs.map((d, i) => (
              <span key={i} className="font-mono text-[11px] uppercase tracking-widest text-persimmon">
                {d.label} <span className="num">{d.delta}</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {row.taste_note ? (
        <blockquote className="font-serif italic text-[15px] md:text-[17px] leading-relaxed text-ink-2 border-l-2 border-rule-strong pl-3 mt-4">
          “{row.taste_note}”
        </blockquote>
      ) : null}

      {row.suggestion ? (
        <div className="mt-4 pt-4 border-t border-rule">
          <p className="text-[12px] uppercase tracking-widest text-persimmon mb-1.5">
            ✱ Master’s note
          </p>
          <p className="whitespace-pre-line text-[14px] md:text-[15px] leading-relaxed text-ink">
            {row.suggestion}
          </p>
        </div>
      ) : (
        <GetSuggestionButton brewLogId={row.id} />
      )}
    </article>
  );
}

function Sep() {
  return <span className="text-ink-3"> · </span>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[12px] text-ink-3">{label}</dt>
      <dd className="font-mono tabular-nums text-[15px] text-ink mt-0.5">{value}</dd>
    </div>
  );
}
