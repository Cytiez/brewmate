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

export default function HistoryItem({ row, diffs, index }: { row: HistoryRow; diffs: VariableDiff[]; index: number }) {
  const ratio = Number(row.water_g) / Number(row.dose_g);
  const d = new Date(row.brewed_at);

  return (
    <article
      id={`log-${row.id}`}
      className="grid grid-cols-[64px_1fr] md:grid-cols-[88px_1fr] gap-4 md:gap-7 py-6 md:py-8 border-b border-rule"
    >
      {/* Date column (left rail) */}
      <div className="text-right pr-4 border-r border-rule">
        <div className="display text-3xl md:text-4xl leading-none num">
          {d.getDate().toString().padStart(2, "0")}
        </div>
        <div className="font-mono text-[11px] uppercase tracking-kissaten text-ink-2 mt-1">
          {d.toLocaleDateString(undefined, { month: "short" })}
        </div>
        <div className="font-mono text-[11px] tabular-nums text-ink-3 mt-0.5">
          {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
        <div className="font-mono text-[11px] tabular-nums text-ink-3 mt-3 pt-3 border-t border-rule">
          № {(index + 1).toString().padStart(3, "0")}
        </div>
      </div>

      {/* Content */}
      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-3 mb-3 md:mb-4">
          <div className="min-w-0">
            <div className="display text-xl md:text-2xl leading-tight truncate">{row.bean?.name ?? "Brew"}</div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-ink-2 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>on {row.dripper?.name ?? "—"}</span>
              {row.immersion ? (
                <span className="text-persimmon">· immersion</span>
              ) : null}
              {row.pours?.length ? (
                <span className="text-ink-3">· <span className="num">{row.pours.length}</span> pours</span>
              ) : null}
            </div>
          </div>
          <TastePill rating={row.taste_rating} />
        </div>

        {/* Spec table — like a tasting card */}
        <dl className="grid grid-cols-3 md:grid-cols-6 gap-x-3 gap-y-2 mb-3">
          <Metric label="Ratio" value={`1∶${ratio.toFixed(1)}`} />
          <Metric label="Temp" value={row.water_temp_c != null ? `${row.water_temp_c}°` : "—"} />
          <Metric label="Time" value={fmtTime(row.brew_time_seconds)} />
          <Metric label="Dose" value={`${row.dose_g}g`} />
          <Metric label="Water" value={`${row.water_g}g`} />
          <Metric label="Grind" value={row.grind_size} />
        </dl>

        {/* Pour schedule */}
        {row.pours?.length ? (
          <div className="mb-3 border-t border-rule pt-3">
            <div className="font-mono text-[10px] uppercase tracking-kissaten text-ink-2 mb-2">
              pour schedule
            </div>
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

        {/* Variable diffs */}
        {diffs.length > 0 ? (
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 mb-3 border-t border-rule pt-3">
            <span className="font-mono text-[10px] uppercase tracking-kissaten text-ink-2">
              changed →
            </span>
            {diffs.map((d, i) => (
              <span key={i} className="font-mono text-[11px] uppercase tracking-widest text-persimmon">
                {d.label} <span className="num">{d.delta}</span>
              </span>
            ))}
          </div>
        ) : null}

        {row.taste_note ? (
          <blockquote className="font-serif italic text-[15px] md:text-[17px] leading-relaxed text-ink-2 border-l-2 border-rule-strong pl-3 my-3">
            “{row.taste_note}”
          </blockquote>
        ) : null}

        {row.suggestion ? (
          <div className="mt-3 pt-3 border-t border-rule">
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="font-mono text-[10px] uppercase tracking-kissaten text-persimmon">
                ✱ master’s note
              </span>
              <span className="h-px flex-1 bg-rule" />
            </div>
            <p className="whitespace-pre-line text-[14px] md:text-[15px] leading-relaxed text-ink">
              {row.suggestion}
            </p>
          </div>
        ) : (
          <GetSuggestionButton brewLogId={row.id} />
        )}
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-kissaten text-ink-2">{label}</dt>
      <dd className="font-mono tabular-nums text-[14px] md:text-[15px] text-ink mt-0.5">{value}</dd>
    </div>
  );
}
