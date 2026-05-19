import "server-only";
import * as Sentry from "@sentry/nextjs";

// Tiny structured logger. JSON to stdout — Vercel ingests it directly.
// In dev, keep it human-readable so it doesn't drown the terminal.
type Level = "info" | "warn" | "error";

interface LogFields {
  scope: string;
  code?: string;
  message?: string;
  user_id?: string;
  [k: string]: unknown;
}

function emit(level: Level, fields: LogFields) {
  if (process.env.NODE_ENV !== "production") {
    const { scope, message, code, ...rest } = fields;
    // eslint-disable-next-line no-console
    console[level === "error" ? "error" : "log"](
      `[${level}] ${scope}${code ? ` (${code})` : ""}${message ? `: ${message}` : ""}`,
      Object.keys(rest).length ? rest : "",
    );
    return;
  }
  const line = JSON.stringify({ ts: new Date().toISOString(), level, ...fields });
  // eslint-disable-next-line no-console
  (level === "error" ? console.error : console.log)(line);
}

// Sanitize a Supabase / arbitrary error into safe fields. Never log raw `details`
// or `hint` from Postgres errors — those can include row data.
function safeErr(err: unknown): { code?: string; message?: string } {
  if (!err) return {};
  if (typeof err === "string") return { message: err };
  const e = err as { code?: string; message?: string; status?: string | number };
  return { code: e.code ?? (e.status != null ? String(e.status) : undefined), message: e.message };
}

export const log = {
  info:  (fields: LogFields) => emit("info", fields),
  warn:  (fields: LogFields) => emit("warn", fields),
  error: (scope: string, err: unknown, extra: Omit<LogFields, "scope"> = {}) => {
    emit("error", { scope, ...safeErr(err), ...extra });
    // Sentry's `beforeSend` filters expected codes (e.g., rate_limited). The
    // SDK is a no-op when NEXT_PUBLIC_SENTRY_DSN is unset, so this is safe
    // even before the DSN env var lands.
    if (process.env.NODE_ENV === "production") {
      Sentry.captureException(err, { tags: { scope }, extra });
    }
  },
};
