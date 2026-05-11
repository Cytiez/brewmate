"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export default function LoginButton({ next }: { next: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) {
      setError("Sign-in failed. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full space-y-3">
      <Button onClick={signIn} disabled={loading} variant="ink" size="xl" className="w-full">
        {loading ? "Redirecting…" : "Continue with Google"}
      </Button>
      {error ? (
        <p className="font-mono text-[10px] uppercase tracking-widest text-persimmon text-center">
          {error}
        </p>
      ) : null}
    </div>
  );
}
