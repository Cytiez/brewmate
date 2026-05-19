"use client";

import { useEffect, useState } from "react";

export type TempUnit = "C" | "F";

const STORAGE_KEY = "brewmate:temp_unit";

export function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32;
}

export function fahrenheitToCelsius(f: number): number {
  return ((f - 32) * 5) / 9;
}

// Display a Celsius value in the user's chosen unit. Always rounds to integer.
// Pass `withUnit: false` to get just the number (for form inputs).
export function formatTemp(celsius: number | null | undefined, unit: TempUnit, opts?: { withUnit?: boolean }): string {
  if (celsius == null) return "—";
  const value = unit === "F" ? celsiusToFahrenheit(celsius) : celsius;
  const rounded = Math.round(value);
  return opts?.withUnit === false ? String(rounded) : `${rounded}°${unit}`;
}

// React hook — reads from localStorage on mount, persists changes.
// Returns "C" on the server and during the first render to avoid hydration
// mismatch; the real preference is applied in an effect.
export function useTempUnit(): [TempUnit, (u: TempUnit) => void] {
  const [unit, setUnit] = useState<TempUnit>("C");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "C" || stored === "F") setUnit(stored);
  }, []);

  function update(u: TempUnit) {
    setUnit(u);
    window.localStorage.setItem(STORAGE_KEY, u);
  }

  return [unit, update];
}
