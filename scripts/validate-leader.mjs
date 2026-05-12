// Stress-test the leader (gpt-oss-120b:free) against three scenarios:
//   1. A "great" brew → expect a refinement
//   2. Off-topic input → expect {"suggestions":[]}
//   3. A bitter brew → expect coarsen/cooler/shorter

const OR_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.MODEL || "openai/gpt-oss-120b:free";

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
  const t = Date.now();
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
  const ms = Date.now() - t;
  const j = await r.json();
  console.log(`\n=== ${label} (${ms}ms) ===`);
  if (j.error) {
    console.log("ERROR:", j.error?.metadata?.raw || j.error?.message);
    return;
  }
  console.log(j.choices?.[0]?.message?.content);
}

await call(
  "BEAN: La Cabra Kayon | Ethiopia/Kayon Mountain | natural | light | 10d off roast\nGEAR: Kalita Wave 185 | grinder: Comandante C40 (clicks)\nRECIPE: 18g : 300g (1:16.7) | 93°C | grind 24 | 3:00 | bloom 30s with 50g\nRESULT: great | note: jammy, balanced",
  "1. Great brew (expect a small refinement OR confirm)",
);

await call("What is the capital of France?", "2. Off-topic (expect empty array)");

await call(
  "BEAN: Heart Stereo | Brazil/Mogiana | natural | medium-dark | 18d off roast\nGEAR: Aeropress (inverted) | grinder: Baratza Encore (numbers)\nRECIPE: 17g : 230g (1:13.5) | 88°C | grind 12 | 1:45 | bloom 30s with 40g\nRESULT: too bitter | note: ashy finish, heavy",
  "3. Bitter darker brew (expect coarsen/cooler/shorter)",
);

await call(
  "BEAN: Onyx Geometry | Colombia/Huila | washed | light | 8d off roast\nGEAR: Hario Switch | grinder: 1Zpresso JX-Pro (clicks)\nRECIPE: 15g : 240g (1:16.0) | 94°C | grind 65 | 3:30 | bloom 30s with 40g | hybrid: steep then drain | pours: 0:30 60g [closed/steep] → 2:00 140g [open]\nRESULT: too weak | note: hollow body",
  "4. Hario Switch hybrid weak brew (expect per-pour aware advice)",
);
