// One-off live test of the new coffee-locked prompt. Run with:
//   node --env-file=.env.local scripts/test-prompt.mjs

const OR_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.OPENROUTER_MODEL || "google/gemma-4-31b-it:free";

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

async function call(userPrompt, label) {
  console.log(`\n=== ${label} ===`);
  const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + OR_KEY,
      "HTTP-Referer": "https://brewmate-zeta.vercel.app",
      "X-Title": "Brewmate",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.3,
      max_tokens: 400,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        ...FEW_SHOT,
        { role: "user", content: userPrompt },
      ],
    }),
  });
  const j = await r.json();
  if (j.error) {
    console.log("ERROR:", j.error?.metadata?.raw || j.error?.message);
    return;
  }
  console.log("model:", j.model);
  console.log("content:", j.choices?.[0]?.message?.content);
}

await call(
  "BEAN: Onyx Geometry | Colombia/Huila | washed | medium | 8d off roast\nGEAR: Hario V60-02 | grinder: 1Zpresso JX-Pro (clicks)\nRECIPE: 16g : 256g (1:16.0) | 90°C | grind 80 | 2:45 | bloom 30s with 40g\nRESULT: too sour | note: thin, citrusy in a bad way",
  "Sour washed Colombian — expect finer/hotter/longer",
);

await call(
  "What is the capital of France?",
  "Off-topic — expect empty suggestions array",
);

await call(
  "BEAN: La Cabra Kayon | Ethiopia/Kayon Mountain | natural | light | 10d off roast\nGEAR: Kalita Wave 185 | grinder: Comandante C40 (clicks)\nRECIPE: 18g : 300g (1:16.7) | 93°C | grind 24 | 3:00 | bloom 30s with 50g\nRESULT: great | note: jammy, balanced",
  "Great brew — expect a small refinement",
);
