import type { Bean, BrewLog, Equipment, TasteRating } from "@/lib/db-types";

const TASTE_LABEL: Record<TasteRating, string> = {
  too_bitter: "too bitter",
  too_sour: "too sour",
  too_weak: "too weak / under-extracted",
  too_strong: "too strong / over-extracted",
  flat: "flat / muted",
  great: "great",
};

export interface PromptInput {
  bean: Bean;
  dripper: Equipment;
  grinder: Equipment | null;
  log: Pick<
    BrewLog,
    | "dose_g" | "water_g" | "water_temp_c" | "grind_size"
    | "brew_time_seconds" | "bloom_time_seconds" | "bloom_water_g"
    | "immersion" | "pours"
    | "taste_rating" | "taste_note"
  >;
}

function fmtTime(s: number) {
  const m = Math.floor(s / 60).toString();
  const r = (s % 60).toString().padStart(2, "0");
  return `${m}:${r}`;
}

function daysOffRoast(roastDate: string | null): number | null {
  if (!roastDate) return null;
  return Math.max(0, Math.floor((Date.now() - new Date(roastDate).getTime()) / 86400000));
}

export function buildBrewPrompt({ bean, dripper, grinder, log }: PromptInput): string {
  const ratio = Number(log.water_g) / Number(log.dose_g);
  const off = daysOffRoast(bean.roast_date);
  const beanParts = [
    [bean.roaster, bean.name].filter(Boolean).join(" "),
    [bean.origin_country, bean.origin_region].filter(Boolean).join("/"),
    bean.process,
    bean.roast_level,
    off != null ? `${off}d off roast` : null,
    bean.altitude_masl ? `${bean.altitude_masl} masl` : null,
    bean.density ? `${bean.density} density` : null,
    bean.flavor_notes?.length ? `notes: ${bean.flavor_notes.join(", ")}` : null,
  ].filter(Boolean).join(" | ");

  const gearParts = [
    dripper.name,
    grinder ? `grinder: ${grinder.name}${grinder.grind_unit ? ` (${grinder.grind_unit})` : ""}` : null,
  ].filter(Boolean).join(" | ");

  // Per-pour schedule with valve state — critical context for hybrid drippers
  // (Hario Switch / Clever) where immersion vs drawdown shifts mid-recipe.
  // "closed" means water steeps; "open" means water drains through.
  const pours = log.pours ?? [];
  const pourSchedule = pours.length
    ? `pours: ${pours
        .map((p) => {
          const valve = p.immersion ? " [closed/steep]" : " [open]";
          return `${fmtTime(p.time_seconds)} ${p.water_g}g${valve}`;
        })
        .join(" → ")}`
    : null;

  // Aggregate hint: helps the model if it doesn't fully parse the per-pour list.
  const anySteep = pours.some((p) => p.immersion);
  const anyDrain = pours.some((p) => !p.immersion);
  const styleHint =
    anySteep && anyDrain ? "hybrid: steep then drain"
    : anySteep ? "full immersion (valve closed throughout)"
    : null;

  const recipeParts = [
    `${log.dose_g}g : ${log.water_g}g (1:${ratio.toFixed(1)})`,
    log.water_temp_c != null ? `${log.water_temp_c}°C` : null,
    `grind ${log.grind_size}`,
    fmtTime(log.brew_time_seconds),
    log.bloom_time_seconds && log.bloom_water_g
      ? `bloom ${log.bloom_time_seconds}s with ${log.bloom_water_g}g`
      : null,
    styleHint,
    pourSchedule,
  ].filter(Boolean).join(" | ");

  const resultParts = [
    TASTE_LABEL[log.taste_rating as TasteRating],
    log.taste_note ? `note: ${log.taste_note}` : null,
  ].filter(Boolean).join(" | ");

  return [
    `You are a coffee brewing coach. Given a single brew, suggest 1–3 specific, actionable variable adjustments for the next brew.`,
    ``,
    `BEAN: ${beanParts || "—"}`,
    `GEAR: ${gearParts || "—"}`,
    `RECIPE: ${recipeParts}`,
    `RESULT: ${resultParts}`,
    ``,
    `Return JSON only:`,
    `{"suggestions":[{"variable":"grind|temp|ratio|time|bloom|dose|other","change":"e.g. coarsen 2 clicks","why":"<=15 words"}]}`,
    `Rules: max 3 items; use the bean's own grind unit; no greetings; no markdown.`,
  ].join("\n");
}

export interface SuggestionItem {
  variable: string;
  change: string;
  why: string;
}

export function parseSuggestions(text: string): SuggestionItem[] | null {
  if (!text) return null;
  const trimmed = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    const json = JSON.parse(trimmed);
    if (Array.isArray(json?.suggestions)) {
      return json.suggestions
        .slice(0, 3)
        .map((s: any) => ({
          variable: String(s.variable ?? "other"),
          change: String(s.change ?? "").trim(),
          why: String(s.why ?? "").trim(),
        }))
        .filter((s: SuggestionItem) => s.change.length > 0);
    }
  } catch {
    // fall through
  }
  return null;
}
