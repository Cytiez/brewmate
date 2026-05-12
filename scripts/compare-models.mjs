// Compare candidate free models on the actual Brewmate prompt.
// Usage: node --env-file=.env.local scripts/compare-models.mjs
//
// Each model gets ONE call with the production system prompt + the same
// representative sour brew so we can compare:
//   - HTTP status / availability right now
//   - Latency (warm vs cold provider)
//   - Whether response_format:json_object is honored
//   - Number of structured suggestions returned
//   - Surface quality (manual scan after run)

const OR_KEY = process.env.OPENROUTER_API_KEY;

// Curated list — skips tiny (<10B), code-only, OCR-only, and audio-only models.
const CANDIDATES = [
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
  "openai/gpt-oss-120b:free",
  "openai/gpt-oss-20b:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "z-ai/glm-4.5-air:free",
  "minimax/minimax-m2.5:free",
  "arcee-ai/trinity-large-thinking:free",
  "inclusionai/ring-2.6-1t:free",
];

const SYSTEM = `You are Brewmate's master — a third-wave specialty coffee barista with fifteen years of pour-over and immersion experience.

SCOPE — STRICT
- Only respond about home coffee brewing variables.
- If the user's message is not a brew log, return exactly {"suggestions":[]}.
- No disclaimers, no greetings, no markdown.

OUTPUT RULES
- 1–3 suggestions, most impactful first.
- "change" must be concrete and quantified.
- "why" ≤ 15 words.
- Return JSON only: {"suggestions":[{"variable":"grind|temp|ratio|time|bloom|dose|pour|other","change":"...","why":"..."}]}`;

const FEW_SHOT = [
  {
    role: "user",
    content:
      "BEAN: Sey Halo Beriti | Ethiopia/Yirgacheffe | natural | light | 14d off roast\nGEAR: Hario V60-02 | grinder: Comandante C40 (clicks)\nRECIPE: 15g : 250g (1:16.7) | 96°C | grind 22 | 3:30\nRESULT: too bitter | note: dries my mouth",
  },
  {
    role: "assistant",
    content: JSON.stringify({
      suggestions: [
        { variable: "temp",  change: "drop to 92°C",     why: "Light naturals over-extract easily; cooler water lowers yield." },
        { variable: "grind", change: "coarsen 2 clicks", why: "Less surface area slows extraction in the back half." },
      ],
    }),
  },
];

const TEST_PROMPT =
  "BEAN: Onyx Geometry | Colombia/Huila | washed | medium | 8d off roast\nGEAR: Hario V60-02 | grinder: 1Zpresso JX-Pro (clicks)\nRECIPE: 16g : 256g (1:16.0) | 90°C | grind 80 | 2:45 | bloom 30s with 40g\nRESULT: too sour | note: thin, citrusy in a bad way";

function tryParse(text) {
  if (!text) return null;
  const trimmed = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    const j = JSON.parse(trimmed);
    if (Array.isArray(j?.suggestions)) return j.suggestions;
  } catch {}
  return null;
}

async function run(model) {
  const start = Date.now();
  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + OR_KEY,
        "HTTP-Referer": "https://brewmate-zeta.vercel.app",
        "X-Title": "Brewmate",
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 400,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          ...FEW_SHOT,
          { role: "user", content: TEST_PROMPT },
        ],
      }),
    });
    const ms = Date.now() - start;
    const j = await r.json();
    if (j.error) {
      return { model, status: r.status, ms, ok: false, reason: (j.error.metadata?.raw || j.error.message || "").slice(0, 100) };
    }
    const text = j.choices?.[0]?.message?.content ?? "";
    const parsed = tryParse(text);
    return {
      model,
      status: r.status,
      ms,
      ok: !!parsed,
      count: parsed?.length ?? 0,
      raw: text,
      actualModel: j.model,
      tokens: j.usage,
    };
  } catch (e) {
    return { model, status: 0, ms: Date.now() - start, ok: false, reason: e.message };
  }
}

const results = [];
for (const m of CANDIDATES) {
  process.stdout.write(`testing ${m} ... `);
  const r = await run(m);
  results.push(r);
  if (r.ok) {
    console.log(`✓ ${r.count} suggestions in ${r.ms}ms`);
  } else {
    console.log(`✗ ${r.status} ${r.reason ?? "(no parse)"}`);
  }
}

console.log("\n\n=================== SUMMARY ===================");
console.log("model".padEnd(50), "status".padEnd(7), "ms".padStart(6), "items", "ok");
console.log("-".repeat(80));
for (const r of results) {
  console.log(
    r.model.padEnd(50),
    String(r.status).padEnd(7),
    String(r.ms).padStart(6),
    String(r.count ?? "-").padStart(5),
    r.ok ? "✓" : "✗",
  );
}

console.log("\n\n=================== OUTPUTS (successful) ===================");
for (const r of results.filter((r) => r.ok)) {
  console.log("\n--- " + r.model + " ---");
  console.log(r.raw);
}
