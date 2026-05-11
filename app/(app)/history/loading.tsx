import { Skeleton } from "@/components/ui/Skeleton";

export default function HistoryLoading() {
  return (
    <div className="py-2">
      <div className="font-mono text-[10px] uppercase tracking-kissaten text-ink-3 mb-3">
        日録 · brew log
      </div>
      <Skeleton className="h-12 w-1/2 mb-6" />
      <div className="border-t border-rule">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="grid grid-cols-[64px_1fr] md:grid-cols-[88px_1fr] gap-4 py-6 border-b border-rule">
            <div className="space-y-2">
              <Skeleton className="h-8 w-10" />
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-5 w-1/2" />
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
              </div>
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
