import "server-only";

// OpenRouter (OpenAI-compatible) — free Gemma 2 9B by default.
// Override via OPENROUTER_MODEL if you want to try other free models.
const MODEL = process.env.OPENROUTER_MODEL || "google/gemma-4-31b-it:free";
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

export interface AiResult {
  text: string;
  promptTokens?: number;
  completionTokens?: number;
  model: string;
}

export async function generateBrewSuggestion(prompt: string): Promise<AiResult> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY missing");

  const body = {
    model: MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are a coffee brewing coach. Respond with JSON only matching the schema requested by the user. No prose, no markdown, no code fences.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.4,
    max_tokens: 256,
    response_format: { type: "json_object" },
  };

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      // Optional but recommended by OpenRouter for free-tier attribution.
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://brewmate.local",
      "X-Title": "Brewmate",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${errText.slice(0, 300)}`);
  }

  const json: any = await res.json();
  const text: string = json?.choices?.[0]?.message?.content ?? "";
  const usage = json?.usage ?? {};
  return {
    text,
    promptTokens: usage.prompt_tokens,
    completionTokens: usage.completion_tokens,
    model: json?.model ?? MODEL,
  };
}
