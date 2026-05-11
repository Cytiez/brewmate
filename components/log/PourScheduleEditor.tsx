"use client";

import { Plus, X } from "lucide-react";
import { Label, NumInput } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
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
    // Sensible defaults: continue the cadence — +30s after last, same water as last (or 50g if first).
    const next: Pour = {
      time_seconds: (last?.time_seconds ?? 0) + 30,
      water_g: last?.water_g ?? 50,
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
          <span className="font-mono text-[11px] uppercase tracking-widest text-ink-2">
            <span className="num">{pours.length}</span> pour{pours.length === 1 ? "" : "s"} ·
            total <span className="num">{totalWater}g</span>
          </span>
        ) : null}
      </div>

      {pours.length === 0 ? (
        <p className="font-mono text-[11px] uppercase tracking-widest text-ink-3 mb-3">
          No pours added — multi-pour V60, 4:6 method, etc.
        </p>
      ) : (
        <ul className="space-y-2 mb-3">
          {pours.map((p, i) => (
            <li key={i} className="grid grid-cols-[28px_1fr_1fr_36px] items-end gap-2">
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
