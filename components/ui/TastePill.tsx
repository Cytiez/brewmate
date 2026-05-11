import type { TasteRating } from "@/lib/db-types";
import { cn } from "@/lib/cn";

const MAP: Record<TasteRating, { label: string; tone: "good" | "warm" | "cool" | "neutral" }> = {
  great:      { label: "great",  tone: "good" },
  too_bitter: { label: "bitter", tone: "warm" },
  too_sour:   { label: "sour",   tone: "warm" },
  too_weak:   { label: "weak",   tone: "cool" },
  too_strong: { label: "strong", tone: "warm" },
  flat:       { label: "flat",   tone: "neutral" },
};

export default function TastePill({ rating, className }: { rating: TasteRating; className?: string }) {
  const m = MAP[rating];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest",
        m.tone === "good"    && "text-matcha",
        m.tone === "warm"    && "text-persimmon",
        m.tone === "cool"    && "text-ink-2",
        m.tone === "neutral" && "text-ink-3",
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          m.tone === "good"    && "bg-matcha",
          m.tone === "warm"    && "bg-persimmon",
          m.tone === "cool"    && "bg-ink-2",
          m.tone === "neutral" && "bg-ink-3",
        )}
      />
      {m.label}
    </span>
  );
}
