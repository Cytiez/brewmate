import "server-only";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { brewLogSchema } from "@/lib/validation/brew-log";
import { buildBrewPrompt, parseSuggestions, type SuggestionItem } from "@/lib/prompts/brew";
import { generateBrewSuggestion } from "@/lib/ai";
import { canUseAi } from "@/lib/features";
import { log } from "@/lib/log";

const DAILY_AI_LIMIT = 20;
const DAILY_LOG_LIMIT = 200;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = brewLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const input = parsed.data;

  const supabase = createSupabaseServerClient();

  // Per-user daily cap on log creation, separate from the AI limit. Stops a
  // stolen JWT from bulk-inserting rows.
  const { data: logAllowed, error: rlLogErr } = await supabase.rpc(
    "check_and_increment_log_creation",
    { daily_limit: DAILY_LOG_LIMIT },
  );
  if (rlLogErr) {
    log.error("api.logs.rpc.log_creation", rlLogErr, { user_id: user.id });
    return NextResponse.json({ error: "something_went_wrong" }, { status: 500 });
  }
  if (!logAllowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const { data: logRow, error: logErr } = await supabase
    .from("brew_logs")
    .insert({ ...input, user_id: user.id })
    .select("*")
    .single();

  if (logErr || !logRow) {
    log.error("api.logs.insert", logErr, { user_id: user.id });
    return NextResponse.json({ error: "could_not_save_log" }, { status: 500 });
  }

  let suggestion: { content: string; items: SuggestionItem[] | null } | null = null;
  let rateLimited = false;

  if (canUseAi(user)) {
    try {
      const [{ data: bean }, { data: dripper }, { data: grinder }] = await Promise.all([
        supabase.from("beans").select("*").eq("id", logRow.bean_id).maybeSingle(),
        supabase.from("equipment").select("*").eq("id", logRow.dripper_id).maybeSingle(),
        logRow.grinder_id
          ? supabase.from("equipment").select("*").eq("id", logRow.grinder_id).maybeSingle()
          : Promise.resolve({ data: null } as any),
      ]);

      if (bean && dripper) {
        const { data: aiAllowed, error: rlErr } = await supabase.rpc(
          "check_and_increment_ai_usage",
          { daily_limit: DAILY_AI_LIMIT },
        );
        if (rlErr) {
          log.error("api.logs.rpc.ai_usage", rlErr, { user_id: user.id });
        } else if (!aiAllowed) {
          rateLimited = true;
        } else {
          const prompt = buildBrewPrompt({
            bean: bean as any,
            dripper: dripper as any,
            grinder: (grinder as any) ?? null,
            log: logRow as any,
          });
          const ai = await generateBrewSuggestion(prompt);
          const items = parseSuggestions(ai.text);
          const content = items
            ? items.map((s) => `${s.change} — ${s.why}`).join("\n")
            : ai.text.trim();

          const { error: aiInsErr } = await supabase.from("ai_suggestions").insert({
            user_id: user.id,
            brew_log_id: logRow.id,
            content,
            model: ai.model,
            prompt_tokens: ai.promptTokens ?? null,
            completion_tokens: ai.completionTokens ?? null,
          });
          if (aiInsErr) log.error("api.logs.ai_suggestion.insert", aiInsErr, { user_id: user.id });
          suggestion = { content, items };
        }
      }
    } catch (e) {
      // OpenRouter 429s land here too — we deliberately don't surface them to
      // Sentry once it's wired (filter them out there). For now just log.
      log.error("api.logs.suggestion", e, { user_id: user.id });
    }
  }

  return NextResponse.json({
    ok: true,
    log_id: logRow.id,
    suggestion,
    rate_limited: rateLimited,
  });
}
