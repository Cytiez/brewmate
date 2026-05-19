import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn && process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    // Skip expected, user-visible errors that already surface via UI toasts.
    beforeSend(event, hint) {
      const err = hint.originalException as { code?: string } | undefined;
      if (err?.code === "rate_limited") return null;
      return event;
    },
  });
}
