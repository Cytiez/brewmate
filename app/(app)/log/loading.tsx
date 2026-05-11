import { Skeleton } from "@/components/ui/Skeleton";

export default function LogLoading() {
  return (
    <div className="py-2">
      <div className="font-mono text-[10px] uppercase tracking-kissaten text-ink-3 mb-3">
        log · 記録
      </div>
      <Skeleton className="h-12 w-1/2 mb-8" />
      <div className="space-y-7">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
