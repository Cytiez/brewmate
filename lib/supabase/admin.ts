import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db-types";

// Service-role client — bypasses RLS. ONLY use in tightly scoped API routes
// for admin-only operations (e.g., auth.admin.deleteUser). Never expose to
// the browser, never use for ordinary user-scoped reads/writes.
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing");

  return createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
