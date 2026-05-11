import { Skeleton } from "@/components/ui/Skeleton";

export default function HistoryLoading() {
  return (
    <div className="py-2">
      <Skeleton className="h-12 w-1/2 mb-6" />
      <div className="border-t border-rule">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="py-6 border-b border-rule space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-3/4 mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
