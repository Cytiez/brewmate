import "server-only";
import { getSiteUrl } from "@/lib/site";
import type { ChatMessage } from "@/lib/prompts/brew";

const MODEL = process.env.OPENROUTER_MODEL || "google/gemma-4-31b-it:free";
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

export interface AiResult {
  text: string;
  promptTokens?: number;
  completionTokens?: number;
  model: string;
}

/**
 * Generate a brewing suggestion via OpenRouter chat completion.
 * Caller passes the full messages array (system + few-shot + user) built in
 * lib/prompts/brew.ts so persona, scope-lock, and reasoning rules ship with
 * every request.
 */
export async function generateBrewSuggestion(messages: ChatMessage[]): Promise<AiResult> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY missing");

  const body = {
    model: MODEL,
    messages,
    // Lower temp → more consistent adherence to the persona + format. Few-shot
    // examples already showed the model the exact tone; we don't need
    // creativity, we need reliability.
    temperature: 0.3,
    // Room for ~3 well-reasoned suggestions, each with a 15-word "why".
    max_tokens: 400,
    response_format: { type: "json_object" },
  };

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      // Recommended by OpenRouter for attribution / abuse handling.
      "HTTP-Referer": getSiteUrl(),
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
