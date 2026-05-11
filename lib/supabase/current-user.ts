import "server-only";
import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "./server";

// React's `cache()` dedupes calls within a single server render-tree.
// Without it: middleware + (app)/layout + each page hit Supabase Auth separately.
// With it: one network round-trip per request — even if 10 components want the user.
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

// Convenience: throw to 401 if there's no user. Use inside API routes / actions.
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}
