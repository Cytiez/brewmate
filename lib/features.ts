import "server-only";
import type { User } from "@supabase/supabase-js";

// Single gate for any feature that might one day be subscription-gated.
// Today everyone is on the "free" plan and the AI feature is free for all
// (subject to the daily rate limit). When billing arrives, this is the
// single place to wire it in.

export type Plan = "free" | "pro";

export function planFor(_user: User | null | undefined): Plan {
  return "free";
}

export function canUseAi(user: User | null | undefined): boolean {
  // Future: return planFor(user) === "pro" || dailyFreeAllowanceRemaining(user) > 0
  return !!user;
}
