import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { buildBrewPrompt, parseSuggestions } from "@/lib/prompts/brew";
import { generateBrewSuggestion } from "@/lib/ai";
import { canUseAi } from "@/lib/features";
import { log } from "@/lib/log";

const DAILY_AI_LIMIT = 20;

const reqSchema = z.object({ brew_log_id: z.string().uuid() });

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (!canUseAi(user)) return NextResponse.json({ error: "feature_disabled" }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }
  const parsed = reqSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const supabase = createSupabaseServerClient();
  const { data: logRow } = await supabase.from("brew_logs").select("*").eq("id", parsed.data.brew_log_id).maybeSingle();
  if (!logRow) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { data: allowed, error: rlErr } = await supabase.rpc("check_and_increment_ai_usage", { daily_limit: DAILY_AI_LIMIT });
  if (rlErr) {
    log.error("api.suggest.rpc", rlErr, { user_id: user.id });
    return NextResponse.json({ error: "something_went_wrong" }, { status: 500 });
  }
  if (!allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const [{ data: bean }, { data: dripper }, { data: grinder }] = await Promise.all([
    supabase.from("beans").select("*").eq("id", logRow.bean_id).maybeSingle(),
    supabase.from("equipment").select("*").eq("id", logRow.dripper_id).maybeSingle(),
    logRow.grinder_id
      ? supabase.from("equipment").select("*").eq("id", logRow.grinder_id).maybeSingle()
      : Promise.resolve({ data: null } as any),
  ]);
  if (!bean || !dripper) return NextResponse.json({ error: "missing_refs" }, { status: 400 });

  try {
    const prompt = buildBrewPrompt({ bean: bean as any, dripper: dripper as any, grinder: (grinder as any) ?? null, log: logRow as any });
    const ai = await generateBrewSuggestion(prompt);
    const items = parseSuggestions(ai.text);
    const content = items ? items.map((s) => `${s.change} — ${s.why}`).join("\n") : ai.text.trim();

    await supabase
      .from("ai_suggestions")
      .upsert(
        {
          user_id: user.id,
          brew_log_id: logRow.id,
          content,
          model: ai.model,
          prompt_tokens: ai.promptTokens ?? null,
          completion_tokens: ai.completionTokens ?? null,
        },
        { onConflict: "brew_log_id" },
      );

    return NextResponse.json({ suggestion: { content, items } });
  } catch (e) {
    log.error("api.suggest.generate", e, { user_id: user.id });
    return NextResponse.json({ error: "something_went_wrong" }, { status: 500 });
  }
}
