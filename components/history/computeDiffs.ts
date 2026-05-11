import type { HistoryRow, VariableDiff } from "./HistoryItem";

// Diff vs the immediately previous log for the same bean (any dripper).
// Newest first ordering is assumed (matches the query).
export function computeDiffsForList(rows: HistoryRow[]): Map<string, VariableDiff[]> {
  const map = new Map<string, VariableDiff[]>();
  // Walk by bean groupings preserving order.
  const byBean = new Map<string, HistoryRow[]>();
  for (const r of rows) {
    const k = r.bean?.name ?? "_";
    const list = byBean.get(k) ?? [];
    list.push(r);
    byBean.set(k, list);
  }
  for (const list of byBean.values()) {
    // list is newest-first: compare each with list[i+1] (the previous, older brew)
    for (let i = 0; i < list.length; i++) {
      const cur = list[i];
      const prev = list[i + 1];
      if (!prev) {
        map.set(cur.id, []);
        continue;
      }
      const diffs: VariableDiff[] = [];

      const dDose = Number(cur.dose_g) - Number(prev.dose_g);
      if (dDose !== 0) diffs.push({ label: "dose", delta: fmtDelta(dDose, "g") });

      const dWater = Number(cur.water_g) - Number(prev.water_g);
      if (dWater !== 0) diffs.push({ label: "water", delta: fmtDelta(dWater, "g") });

      const curRatio = Number(cur.water_g) / Number(cur.dose_g);
      const prevRatio = Number(prev.water_g) / Number(prev.dose_g);
      if (Math.abs(curRatio - prevRatio) >= 0.1) {
        diffs.push({ label: "ratio", delta: `→1:${curRatio.toFixed(1)}` });
      }

      if (cur.water_temp_c != null && prev.water_temp_c != null) {
        const dT = Number(cur.water_temp_c) - Number(prev.water_temp_c);
        if (dT !== 0) diffs.push({ label: "temp", delta: fmtDelta(dT, "°") });
      }

      if (cur.grind_size !== prev.grind_size) {
        diffs.push({ label: "grind", delta: `${prev.grind_size}→${cur.grind_size}` });
      }

      const dTime = cur.brew_time_seconds - prev.brew_time_seconds;
      if (dTime !== 0) diffs.push({ label: "time", delta: fmtDelta(Math.round(dTime), "s") });

      map.set(cur.id, diffs);
    }
  }
  return map;
}

function fmtDelta(n: number, unit: string) {
  const sign = n > 0 ? "+" : "−";
  return `${sign}${Math.abs(n).toString()}${unit}`;
}
