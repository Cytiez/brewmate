// Next.js instrumentation hook — runs once per server runtime to register
// observability tooling. Loads the matching Sentry config based on the
// runtime so edge functions don't drag in the Node SDK.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}
