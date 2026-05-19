import "server-only";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { log } from "@/lib/log";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const supabase = createSupabaseServerClient();

  const [beans, equipment, brewLogs, aiSuggestions, aiUsage] = await Promise.all([
    supabase.from("beans").select("*"),
    supabase.from("equipment").select("*"),
    supabase.from("brew_logs").select("*"),
    supabase.from("ai_suggestions").select("*"),
    supabase.from("ai_usage").select("*"),
  ]);

  const errs = [beans, equipment, brewLogs, aiSuggestions, aiUsage].filter((r) => r.error);
  if (errs.length > 0) {
    log.error("api.account.export", errs[0].error, { user_id: user.id });
    return NextResponse.json({ error: "export_failed" }, { status: 500 });
  }

  const payload = {
    exported_at: new Date().toISOString(),
    user: { id: user.id, email: user.email },
    beans: beans.data ?? [],
    equipment: equipment.data ?? [],
    brew_logs: brewLogs.data ?? [],
    ai_suggestions: aiSuggestions.data ?? [],
    ai_usage: aiUsage.data ?? [],
  };

  const filename = `brewmate-export-${new Date().toISOString().slice(0, 10)}.json`;
  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
