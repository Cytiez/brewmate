"use client";

import { useMemo } from "react";
import { useTempUnit, celsiusToFahrenheit } from "@/lib/units";
import { cn } from "@/lib/cn";
import type { InsightRow } from "@/app/(app)/insights/page";

type Rating = InsightRow["taste_rating"];

// Numeric mapping used for the off-roast trend. Great = good, flat = bad-ish,
// other off-taste readings are roughly neutral (the brewer noticed something).
const RATING_SCORE: Record<Rating, number> = {
  great: 2,
  too_bitter: 0,
  too_sour: 0,
  too_weak: 0,
  too_strong: 0,
  flat: -1,
};

const RATING_LABEL: Record<Rating, string> = {
  great: "great",
  too_bitter: "bitter",
  too_sour: "sour",
  too_weak: "weak",
  too_strong: "strong",
  flat: "flat",
};

const RATING_COLOR: Record<Rating, string> = {
  great: "var(--color-matcha, #6b8e23)",
  too_bitter: "var(--color-persimmon, #d2691e)",
  too_sour: "var(--color-persimmon, #d2691e)",
  too_weak: "var(--color-ink-2, #888)",
  too_strong: "var(--color-persimmon, #d2691e)",
  flat: "var(--color-ink-3, #aaa)",
};

export default function InsightsView({ rows }: { rows: InsightRow[] }) {
  const m = useMemo(() => computeMetrics(rows), [rows]);

  return (
    <div className="space-y-10">
      {/* Top stats — three big numbers */}
      <section className="grid grid-cols-3 gap-3 md:gap-6 border-y border-rule py-5 md:py-7">
        <BigStat label="This week" value={m.thisWeek} unit={m.thisWeek === 1 ? "brew" : "brews"} />
        <BigStat label="Streak" value={m.streakDays} unit={m.streakDays === 1 ? "day" : "days"} />
        <BigStat label="Great rate" value={`${m.greatPct}%`} />
      </section>

      {/* Taste distribution — horizontal bar */}
      <section>
        <h2 className="sublabel mb-3">Taste distribution</h2>
        <div className="space-y-2.5">
          {m.distribution.map(({ rating, count, pct }) => (
            <div key={rating} className="flex items-center gap-3">
              <span className="w-16 shrink-0 font-mono text-[10px] uppercase tracking-widest text-ink-2">
                {RATING_LABEL[rating]}
              </span>
              <div className="flex-1 h-2 bg-rule/40 relative">
                <div
                  className="absolute inset-y-0 left-0"
                  style={{ width: `${pct}%`, background: RATING_COLOR[rating] }}
                />
              </div>
              <span className="w-12 shrink-0 text-right font-mono tabular-nums text-[12px] text-ink">
                {count}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Top beans by great count */}
      {m.topBeans.length > 0 ? (
        <section>
          <h2 className="sublabel mb-3">Top beans by great brews</h2>
          <ul className="border-y border-rule divide-y divide-rule">
            {m.topBeans.map((b) => (
              <li key={b.name} className="flex items-center justify-between gap-3 py-3">
                <span className="text-[14px] text-ink truncate">{b.name}</span>
                <span className="font-mono tabular-nums text-[12px] text-matcha shrink-0">
                  {b.greatCount} / {b.total} great
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Off-roast trend */}
      {m.offRoastBuckets.some((b) => b.count > 0) ? (
        <section>
          <h2 className="sublabel mb-3">Days off roast vs. result</h2>
          <div className="grid grid-cols-5 gap-1.5">
            {m.offRoastBuckets.map((b) => (
              <div key={b.label} className="text-center">
                <div className="relative h-24 bg-rule/30 flex items-end justify-center mb-1.5">
                  <div
                    className="w-full transition-all"
                    style={{
                      height: `${b.fillPct}%`,
                      background:
                        b.avgScore > 0.8 ? "var(--color-matcha, #6b8e23)"
                        : b.avgScore < -0.3 ? "var(--color-ink-3, #aaa)"
                        : "var(--color-ink-2, #888)",
                    }}
                  />
                </div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-ink-3">{b.label}</div>
                <div className="font-mono tabular-nums text-[10px] text-ink-2 mt-0.5">{b.count}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Ratio × temp scatter */}
      <RatioTempScatter rows={rows} />
    </div>
  );
}

function BigStat({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="text-center">
      <div className="display text-[44px] md:text-[56px] leading-none tabular-nums">{value}</div>
      <div className="sublabel mt-2">
        {label}
        {unit ? <span className="text-ink-3"> · {unit}</span> : null}
      </div>
    </div>
  );
}

function RatioTempScatter({ rows }: { rows: InsightRow[] }) {
  const [unit] = useTempUnit();
  const points = rows
    .filter((r) => r.water_temp_c != null && r.dose_g > 0 && r.water_g > 0)
    .slice(0, 80)
    .map((r) => ({
      ratio: r.water_g / r.dose_g,
      temp: unit === "F" ? celsiusToFahrenheit(r.water_temp_c!) : r.water_temp_c!,
      rating: r.taste_rating,
    }));

  if (points.length === 0) return null;

  const ratios = points.map((p) => p.ratio);
  const temps = points.map((p) => p.temp);
  const ratioMin = Math.min(...ratios);
  const ratioMax = Math.max(...ratios);
  const tempMin = Math.min(...temps);
  const tempMax = Math.max(...temps);
  // Pad the axes so dots never sit on the edge.
  const ratioPad = (ratioMax - ratioMin) * 0.08 || 0.5;
  const tempPad = (tempMax - tempMin) * 0.08 || 1;
  const xMin = ratioMin - ratioPad;
  const xMax = ratioMax + ratioPad;
  const yMin = tempMin - tempPad;
  const yMax = tempMax + tempPad;

  const W = 400;
  const H = 240;
  const PAD_L = 28;
  const PAD_R = 8;
  const PAD_T = 8;
  const PAD_B = 28;

  function x(v: number) {
    return PAD_L + ((v - xMin) / (xMax - xMin)) * (W - PAD_L - PAD_R);
  }
  function y(v: number) {
    return PAD_T + (1 - (v - yMin) / (yMax - yMin)) * (H - PAD_T - PAD_B);
  }

  return (
    <section>
      <h2 className="sublabel mb-3">Ratio × temperature</h2>
      <p className="text-[12px] text-ink-3 mb-2">
        Each dot is one brew. <span className="text-matcha">Great</span> brews vs.{" "}
        <span className="text-persimmon">off-taste</span> brews.
      </p>
      <div className="border border-rule p-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Ratio vs temperature scatter plot">
          {/* Axis labels */}
          <text x={PAD_L} y={H - 8} className="font-mono fill-ink-3" fontSize="9">
            ratio {ratioMin.toFixed(1)}–{ratioMax.toFixed(1)}
          </text>
          <text
            x={6}
            y={PAD_T + 4}
            className="font-mono fill-ink-3"
            fontSize="9"
            transform={`rotate(-90, 12, ${PAD_T + 4})`}
            textAnchor="end"
          >
            °{unit} {Math.round(tempMin)}–{Math.round(tempMax)}
          </text>

          {/* Frame */}
          <rect
            x={PAD_L}
            y={PAD_T}
            width={W - PAD_L - PAD_R}
            height={H - PAD_T - PAD_B}
            fill="none"
            className="stroke-rule"
            strokeWidth="0.5"
          />

          {points.map((p, i) => (
            <circle
              key={i}
              cx={x(p.ratio)}
              cy={y(p.temp)}
              r={3.5}
              fill={RATING_COLOR[p.rating]}
              opacity={0.7}
            />
          ))}
        </svg>
      </div>
    </section>
  );
}

// ----- Metrics computation -----

interface Metrics {
  thisWeek: number;
  streakDays: number;
  greatPct: number;
  distribution: { rating: Rating; count: number; pct: number }[];
  topBeans: { name: string; greatCount: number; total: number }[];
  offRoastBuckets: { label: string; count: number; avgScore: number; fillPct: number }[];
}

function computeMetrics(rows: InsightRow[]): Metrics {
  const now = Date.now();
  const weekAgo = now - 7 * 86400000;

  const thisWeek = rows.filter((r) => new Date(r.brewed_at).getTime() >= weekAgo).length;

  // Streak: count consecutive days back from today that have ≥1 brew.
  const brewDays = new Set(
    rows.map((r) => new Date(r.brewed_at).toISOString().slice(0, 10)),
  );
  let streakDays = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(now - i * 86400000).toISOString().slice(0, 10);
    if (brewDays.has(d)) streakDays += 1;
    else if (i > 0) break;     // gap → stop. Day 0 (today) is allowed to be empty.
  }

  // Distribution
  const counts: Record<Rating, number> = {
    great: 0, too_bitter: 0, too_sour: 0, too_weak: 0, too_strong: 0, flat: 0,
  };
  for (const r of rows) counts[r.taste_rating]++;
  const total = rows.length;
  const orderedRatings: Rating[] = ["great", "too_bitter", "too_sour", "too_weak", "too_strong", "flat"];
  const distribution = orderedRatings.map((rating) => ({
    rating,
    count: counts[rating],
    pct: total > 0 ? (counts[rating] / total) * 100 : 0,
  }));

  const greatPct = total > 0 ? Math.round((counts.great / total) * 100) : 0;

  // Top beans by great count (ignore beans with <2 total brews to avoid noise).
  const beanMap = new Map<string, { greatCount: number; total: number }>();
  for (const r of rows) {
    if (!r.beans?.name) continue;
    const entry = beanMap.get(r.beans.name) ?? { greatCount: 0, total: 0 };
    entry.total += 1;
    if (r.taste_rating === "great") entry.greatCount += 1;
    beanMap.set(r.beans.name, entry);
  }
  const topBeans = Array.from(beanMap.entries())
    .filter(([, v]) => v.total >= 2)
    .sort((a, b) => b[1].greatCount - a[1].greatCount || b[1].total - a[1].total)
    .slice(0, 5)
    .map(([name, v]) => ({ name, greatCount: v.greatCount, total: v.total }));

  // Off-roast buckets
  const bucketDefs = [
    { label: "0-5d",   min: 0,  max: 5 },
    { label: "6-10d",  min: 6,  max: 10 },
    { label: "11-15d", min: 11, max: 15 },
    { label: "16-25d", min: 16, max: 25 },
    { label: "25d+",   min: 26, max: 365 },
  ];
  const buckets = bucketDefs.map((b) => ({ ...b, scores: [] as number[] }));
  for (const r of rows) {
    if (!r.beans?.roast_date) continue;
    const days = Math.floor((new Date(r.brewed_at).getTime() - new Date(r.beans.roast_date).getTime()) / 86400000);
    if (days < 0) continue;
    const bucket = buckets.find((b) => days >= b.min && days <= b.max);
    if (bucket) bucket.scores.push(RATING_SCORE[r.taste_rating]);
  }
  const maxBucketCount = Math.max(1, ...buckets.map((b) => b.scores.length));
  const offRoastBuckets = buckets.map((b) => ({
    label: b.label,
    count: b.scores.length,
    avgScore: b.scores.length ? b.scores.reduce((s, x) => s + x, 0) / b.scores.length : 0,
    fillPct: (b.scores.length / maxBucketCount) * 100,
  }));

  return { thisWeek, streakDays, greatPct, distribution, topBeans, offRoastBuckets };
}
