"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, RotateCw } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export default function GetSuggestionButton({
  brewLogId,
  existing,
}: {
  brewLogId: string;
  existing?: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Saved suggestion is the freshly generated `result` (post-click) or the
  // value passed in from the server-rendered parent (`existing`).
  const saved = result ?? existing ?? null;

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
      setConfirmOpen(false);
    }
  }

  if (saved) {
    return (
      <div className="mt-4 pt-4 border-t border-rule">
        <div className="flex items-baseline justify-between gap-3 mb-1.5">
          <span className="text-[12px] uppercase tracking-widest text-persimmon">
            ✱ Master&apos;s note
          </span>
          {result ? (
            <span className="text-[12px] text-matcha">✓ Saved</span>
          ) : null}
        </div>
        <p className="whitespace-pre-line text-[14px] md:text-[15px] leading-relaxed text-ink">
          {saved}
        </p>

        <div className="mt-3">
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={loading}
            className={cn(
              "inline-flex items-center gap-1.5 text-[12px] uppercase tracking-widest",
              loading ? "text-ink-3" : "text-ink-2 hover:text-persimmon transition-colors",
            )}
          >
            <RotateCw className={cn("h-3 w-3", loading && "animate-spin")} />
            {loading ? "Asking the master…" : "Regenerate"}
          </button>
        </div>

        <ConfirmRegenerateDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          onConfirm={run}
          loading={loading}
        />
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

function ConfirmRegenerateDialog({
  open,
  onOpenChange,
  onConfirm,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm bg-paper border-hairline border-rule-strong p-6 data-[state=open]:animate-fade-up">
          <DialogPrimitive.Title className="display text-xl mb-2">
            Generate a new suggestion?
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="text-sm text-ink-2 leading-relaxed mb-5">
            This replaces the saved note and uses 1 of your 20 daily AI calls.
          </DialogPrimitive.Description>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="ink"
              size="md"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Generating…" : "Regenerate"}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
