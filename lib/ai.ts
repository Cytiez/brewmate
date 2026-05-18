import "server-only";
import { getSiteUrl } from "@/lib/site";
import type { ChatMessage } from "@/lib/prompts/brew";

// Primary model is configurable via env; fallbacks are tried in order when the
// primary returns 429 (shared free-tier rate limit) or empty content.
// Fallback order: Gemma MoE variant → gpt-oss-120b (different provider, rarely rate-limited).
const PRIMARY = process.env.OPENROUTER_MODEL || "google/gemma-4-31b-it:free";
const FALLBACKS = ["google/gemma-4-26b-a4b-it:free", "openai/gpt-oss-120b:free"];
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

export interface AiResult {
  text: string;
  promptTokens?: number;
  completionTokens?: number;
  model: string;
}

export async function generateBrewSuggestion(messages: ChatMessage[]): Promise<AiResult> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY missing");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
    "HTTP-Referer": getSiteUrl(),
    "X-Title": "Brewmate",
  };

  const models = [PRIMARY, ...FALLBACKS.filter((m) => m !== PRIMARY)];

  for (const model of models) {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 400,
        response_format: { type: "json_object" },
      }),
    });

    // 429 = upstream free-tier rate limit — try next model.
    if (res.status === 429) continue;

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`OpenRouter ${res.status}: ${errText.slice(0, 300)}`);
    }

    const json: any = await res.json();
    const text: string = json?.choices?.[0]?.message?.content ?? "";
    // Some routing models return empty content — treat as unavailable.
    if (!text) continue;

    const usage = json?.usage ?? {};
    return {
      text,
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      model: json?.model ?? model,
    };
  }

  // All models exhausted — surface as rate_limited so callers can 429 cleanly.
  throw Object.assign(new Error("All models rate-limited or unavailable"), {
    code: "rate_limited",
  });
}
