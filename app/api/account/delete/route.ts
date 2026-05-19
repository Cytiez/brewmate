import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { log } from "@/lib/log";

// Require an explicit confirmation string in the body to prevent any
// accidental CSRF-style invocation. The client must literally send `"DELETE"`.
const reqSchema = z.object({ confirm: z.literal("DELETE") });

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }
  const parsed = reqSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "confirmation_required" }, { status: 400 });

  // ON DELETE CASCADE on every FK to auth.users(id) takes care of the data
  // wipe; the admin call below is the only thing that triggers it.
  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch (e) {
    log.error("api.account.delete.admin_init", e, { user_id: user.id });
    return NextResponse.json({ error: "server_misconfigured" }, { status: 500 });
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    log.error("api.account.delete", error, { user_id: user.id });
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
