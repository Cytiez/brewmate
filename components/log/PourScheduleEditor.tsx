"use client";

import { Plus, X } from "lucide-react";
import { Label, NumInput } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { Pour } from "@/lib/db-types";

interface Props {
  pours: Pour[];
  onChange: (next: Pour[]) => void;
}

export default function PourScheduleEditor({ pours, onChange }: Props) {
  function update(i: number, patch: Partial<Pour>) {
    const next = pours.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }

  function addPour() {
    const last = pours[pours.length - 1];
    const next: Pour = {
      time_seconds: (last?.time_seconds ?? 0) + 30,
      water_g: last?.water_g ?? 50,
      // Default to "open" valve. Per-pour `immersion` is opt-in for users on
      // hybrid drippers (Hario Switch, Clever, Aeropress).
      immersion: false,
    };
    onChange([...pours, next]);
  }

  function remove(i: number) {
    onChange(pours.filter((_, idx) => idx !== i));
  }

  const totalWater = pours.reduce((sum, p) => sum + (Number(p.water_g) || 0), 0);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <Label className="mb-0">Pour schedule</Label>
        {pours.length > 0 ? (
          <span className="text-[12px] text-ink-2">
            <span className="num">{pours.length}</span> pour{pours.length === 1 ? "" : "s"} ·
            total <span className="num">{totalWater}g</span>
          </span>
        ) : null}
      </div>

      {pours.length === 0 ? (
        <p className="text-[13px] text-ink-3 mb-3">
          No pours added. For multi-pour V60, Tetsu Kasuya 4:6, hybrid switch brews, etc.
        </p>
      ) : (
        <ul className="space-y-3 mb-3">
          {pours.map((p, i) => (
            <li key={i} className="space-y-2">
              <div className="grid grid-cols-[28px_1fr_1fr_36px] items-end gap-2">
                <span className="font-mono text-[11px] tabular-nums text-ink-3 pb-3">
                  {(i + 1).toString().padStart(2, "0")}
                </span>
                <div>
                  <Label className="text-[10px] mb-1">at · s</Label>
                  <NumInput
                    value={p.time_seconds}
                    onChange={(e) => update(i, { time_seconds: Number(e.target.value) || 0 })}
                    step="5"
                    min="0"
                    className="text-xl text-left"
                  />
                </div>
                <div>
                  <Label className="text-[10px] mb-1">pour · g</Label>
                  <NumInput
                    value={p.water_g}
                    onChange={(e) => update(i, { water_g: Number(e.target.value) || 0 })}
                    step="5"
                    min="0"
                    className="text-xl text-left"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label={`Remove pour ${i + 1}`}
                  className="h-11 w-9 flex items-center justify-center text-ink-3 hover:text-persimmon transition-colors"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* Valve state pill — tap to toggle. For Hario Switch / Clever:
                  "Closed" = water steeps; "Open" = water drains through. */}
              <div className="pl-[36px] flex items-center gap-2">
                <ValvePill
                  immersion={!!p.immersion}
                  onClick={() => update(i, { immersion: !p.immersion })}
                />
                <span className="text-[12px] text-ink-3">
                  {p.immersion ? "Water steeps until next pour" : "Water drains through"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        onClick={addPour}
        variant="outline"
        size="sm"
        className="w-full"
        disabled={pours.length >= 12}
      >
        <Plus className="h-3 w-3" /> Add pour
      </Button>
    </div>
  );
}

// Small toggleable chip. Closed = filled ink (immersion); Open = hairline.
function ValvePill({ immersion, onClick }: { immersion: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={immersion}
      aria-label={immersion ? "Valve closed (steep)" : "Valve open (drain)"}
      className={cn(
        "inline-flex items-center gap-1.5 h-7 px-2.5 text-[11px] uppercase tracking-widest font-mono",
        "border-hairline transition-colors",
        immersion
          ? "bg-ink text-paper border-ink"
          : "bg-transparent text-ink-2 border-rule hover:border-ink hover:text-ink",
      )}
    >
      <ValveGlyph closed={immersion} />
      {immersion ? "Closed" : "Open"}
    </button>
  );
}

function ValveGlyph({ closed }: { closed: boolean }) {
  // Small visual cue: a water droplet plus a stop-bar (closed) or arrow (open).
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 1.5 C 3 5, 2.5 8, 6 10.5 C 9.5 8, 9 5, 6 1.5 Z" fill="currentColor" opacity="0.18" />
      {closed
        ? <path d="M2 11 L 10 11" />
        : <path d="M4 11 L 6 11 M 8 11 L 10 11" />}
    </svg>
  );
}
