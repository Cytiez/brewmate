"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

export default function BrewTimeInput({
  seconds,
  onChange,
}: {
  seconds: number;
  onChange: (s: number) => void;
}) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  function step(delta: number) {
    onChange(Math.max(0, Math.min(3599, seconds + delta)));
  }

  return (
    <div className="flex items-center gap-3">
      <Stepper onClick={() => step(-15)} icon={Minus} aria-label="−15 seconds" />
      <div className="flex-1 flex items-baseline justify-center gap-1.5 num text-4xl tracking-tight">
        <span className="tabular-nums">{m.toString().padStart(2, "0")}</span>
        <span className="text-ink-3 -translate-y-1.5">:</span>
        <span className="tabular-nums">{s.toString().padStart(2, "0")}</span>
      </div>
      <Stepper onClick={() => step(15)} icon={Plus} aria-label="+15 seconds" />
    </div>
  );
}

function Stepper({
  onClick,
  icon: Icon,
  ...props
}: { onClick: () => void; icon: any } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-11 w-11 flex items-center justify-center border-hairline border-rule-strong",
        "text-ink-2 hover:text-ink hover:border-ink active:scale-95 transition-all",
      )}
      {...props}
    >
      <Icon className="h-4 w-4" strokeWidth={1.5} />
    </button>
  );
}
