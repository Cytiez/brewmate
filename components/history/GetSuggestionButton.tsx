"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function GetSuggestionButton({ brewLogId }: { brewLogId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brew_log_id: brewLogId }),
      });
      const j = await res.json();
      if (!res.ok) {
        toast.error(
          j.error === "rate_limited"
            ? "Daily AI limit reached. Try again tomorrow."
            : "Couldn't generate. Model may be rate-limited — try again in a few.",
        );
        return;
      }
      setResult(j.suggestion?.content ?? null);
      router.refresh();
    } catch {
      toast.error("Network error.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="mt-4 pt-4 border-t border-rule">
        <div className="flex items-baseline gap-3 mb-1.5">
          <span className="text-[12px] uppercase tracking-widest text-persimmon">
            ✱ Master&apos;s note
          </span>
          <span className="text-[12px] text-matcha">✓ Saved</span>
        </div>
        <p className="whitespace-pre-line text-[14px] leading-relaxed text-ink">{result}</p>
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-rule">
      <Button
        type="button"
        onClick={run}
        disabled={loading}
        variant="ghost"
        size="sm"
        className="w-full justify-start text-ink-2 hover:text-ink"
      >
        <Sparkles className="h-3 w-3" />
        {loading ? "Asking the master…" : "Ask for a suggestion"}
      </Button>
    </div>
  );
}
