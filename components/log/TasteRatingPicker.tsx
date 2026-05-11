"use client";

import { cn } from "@/lib/cn";
import type { TasteRating } from "@/lib/db-types";

// Six tiles in a 2x3 grid. Each carries a Japanese tasting descriptor + English subtitle.
// Single-select. Generous tap target. Hairline frame; selected fills ink.
const OPTIONS: Array<{
  value: TasteRating;
  jp: string;
  en: string;
  glyph: string;
}> = [
  { value: "great",      jp: "美味", en: "Great",      glyph: "◯" },
  { value: "too_bitter", jp: "苦い", en: "Too bitter", glyph: "▲" },
  { value: "too_sour",   jp: "酸い", en: "Too sour",   glyph: "◇" },
  { value: "too_weak",   jp: "薄い", en: "Too weak",   glyph: "△" },
  { value: "too_strong", jp: "強い", en: "Too strong", glyph: "■" },
  { value: "flat",       jp: "平坦", en: "Flat",       glyph: "—" },
];

export default function TasteRatingPicker({
  value,
  onChange,
}: {
  value: TasteRating | null;
  onChange: (v: TasteRating) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-px bg-rule-strong border-hairline border-rule-strong">
      {OPTIONS.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "flex flex-col items-start justify-between min-h-[88px] p-3 text-left",
              "transition-colors",
              active
                ? "bg-ink text-paper"
                : "bg-paper text-ink hover:bg-elevated",
            )}
          >
            <span className={cn("text-xl leading-none", active ? "text-persimmon-soft" : "text-ink-3")}>
              {o.glyph}
            </span>
            <div>
              <div className={cn("font-mono text-[9px] uppercase tracking-kissaten", active ? "text-paper/60" : "text-ink-3")}>
                {o.jp}
              </div>
              <div className="font-sans text-[13px] mt-0.5 leading-tight">
                {o.en}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
