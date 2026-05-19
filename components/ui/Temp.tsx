"use client";

import { formatTemp, useTempUnit } from "@/lib/units";

// Display a temperature stored as Celsius using the user's preferred unit.
// Reads from localStorage on the client; safe to render inside server
// components (it's a client island).
export default function Temp({
  celsius,
  withUnit = true,
  fallback = "—",
}: {
  celsius: number | null | undefined;
  withUnit?: boolean;
  fallback?: string;
}) {
  const [unit] = useTempUnit();
  if (celsius == null) return <>{fallback}</>;
  return <>{formatTemp(celsius, unit, { withUnit })}</>;
}
