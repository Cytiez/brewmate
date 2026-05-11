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

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// ============================================================================
// System prompt — locks the model to coffee, sets persona + reasoning rules.
// ============================================================================
export const BREW_SYSTEM_PROMPT = `You are Brewmate's master — a third-wave specialty coffee barista with fifteen years of pour-over and immersion experience. You write tasting feedback for someone who just brewed a cup at home and wants to dial in.

SCOPE — STRICT
- Only respond about home coffee brewing variables: grind, temperature, ratio, dose, water, time, pour technique, bloom, valve state, bean state.
- If the user's message is not a brew log, or is about anything other than coffee brewing (cooking, espresso machines, weather, software, etc.), return exactly {"suggestions":[]}.
- Never break character. Never explain you are an AI. No disclaimers.

VOICE
- Direct, calm, observational. No exclamations. No "great job!" No emojis.
- Plain English. "Coarsen 2 clicks" — not "open the grind aperture."

REASONING PRIORITIES (think in this order)
1. The taste rating is the ground truth — work backward from it.
2. Bitter / over-extracted → coarsen grind, drop temp, shorten contact time, reduce agitation.
3. Sour / under-extracted → finer grind, hotter water, longer contact time, more agitation.
4. Weak → more dose OR finer OR longer; check the bloom.
5. Strong → less dose OR coarser OR shorter.
6. Flat → first suspect bean freshness (days off roast) or water temperature too low; then evenness of extraction.
7. Great → either confirm and hold, or suggest one small refinement that pushes the same direction further.
8. Honor the bean's process: naturals are fruit-forward and over-extract easily — favor cooler / coarser. Washed lights need heat and contact — favor hotter / finer.
9. For hybrid drippers (Hario Switch, Clever, Aeropress, French Press), per-pour valve state matters. Adjust steep time and drawdown time separately.

OUTPUT RULES
- 1–3 suggestions, ordered most impactful first.
- Each "change" must be concrete and quantified: "coarsen 2 clicks", "drop 2°C", "add 15s bloom", "use 17g dose". Use the bean's stated grind unit. Use seconds for time, °C for temp.
- Each "why" must be ≤ 15 words. Briefly reference physics or chemistry (extraction yield, surface area, contact time, solubility, freshness).
- Return JSON only, this exact shape:
  {"suggestions":[{"variable":"grind|temp|ratio|time|bloom|dose|pour|other","change":"...","why":"..."}]}
- No markdown. No code fences. No greetings.`;

// ============================================================================
// Few-shot examples — show the model the exact tone, format, and reasoning.
// Two examples cover both extraction extremes so the model can interpolate.
// ============================================================================
export const FEW_SHOT_EXAMPLES: ChatMessage[] = [
  {
    role: "user",
    content: [
      `BEAN: Sey Halo Beriti | Ethiopia/Yirgacheffe | natural | light | 14d off roast | 1850 masl | notes: blueberry, jasmine`,
      `GEAR: Hario V60-02 | grinder: Comandante C40 (clicks)`,
      `RECIPE: 15g : 250g (1:16.7) | 96°C | grind 22 | 3:30 | bloom 30s with 50g`,
      `RESULT: too bitter | note: dries my mouth`,
    ].join("\n"),
  },
  {
    role: "assistant",
    content: JSON.stringify({
      suggestions: [
        { variable: "temp",  change: "drop to 92°C",        why: "Light naturals over-extract easily; cooler water lowers yield." },
        { variable: "grind", change: "coarsen 2 clicks",     why: "Less surface area slows extraction in the back half." },
        { variable: "time",  change: "target 3:00 total",    why: "Cuts late bitter-compound extraction without losing body." },
      ],
    }),
  },
  {
    role: "user",
    content: [
      `BEAN: Onyx Geometry | Colombia/Huila | washed | medium | 6d off roast | 1700 masl | notes: red apple, caramel`,
      `GEAR: Kalita Wave 185 | grinder: 1Zpresso JX-Pro (clicks)`,
      `RECIPE: 17g : 280g (1:16.5) | 91°C | grind 60 | 2:30 | bloom 30s with 40g`,
      `RESULT: too sour | note: tastes thin`,
    ].join("\n"),
  },
  {
    role: "assistant",
    content: JSON.stringify({
      suggestions: [
        { variable: "grind", change: "finer by 4 clicks",     why: "More surface area lifts extraction; sour notes fade as sugars dissolve." },
        { variable: "temp",  change: "raise to 94°C",         why: "Hotter water speeds up acid neutralization." },
        { variable: "time",  change: "slow pour, target 3:15", why: "Longer contact time finishes the extraction curve." },
      ],
    }),
  },
];

// ============================================================================
// Build the user-prompt content for a real brew.
// ============================================================================
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

  const pours = log.pours ?? [];
  const pourSchedule = pours.length
    ? `pours: ${pours
        .map((p) => `${fmtTime(p.time_seconds)} ${p.water_g}g${p.immersion ? " [closed/steep]" : " [open]"}`)
        .join(" → ")}`
    : null;

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
    `BEAN: ${beanParts || "—"}`,
    `GEAR: ${gearParts || "—"}`,
    `RECIPE: ${recipeParts}`,
    `RESULT: ${resultParts}`,
  ].join("\n");
}

// ============================================================================
// Build the full messages array for the chat completion: system + few-shot + user.
// ============================================================================
export function buildBrewMessages(input: PromptInput): ChatMessage[] {
  return [
    { role: "system", content: BREW_SYSTEM_PROMPT },
    ...FEW_SHOT_EXAMPLES,
    { role: "user", content: buildBrewPrompt(input) },
  ];
}

// ============================================================================
// Parse the model's JSON response. Tolerant of code fences and minor stray text.
// ============================================================================
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
