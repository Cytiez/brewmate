import { cn } from "@/lib/cn";

// Lightweight skeleton — gentle pulse, paper-toned. No layout shift.
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-rule/60 animate-pulse",
        className,
      )}
      aria-hidden="true"
    />
  );
}
