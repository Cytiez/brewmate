import { Skeleton } from "@/components/ui/Skeleton";

export default function LogLoading() {
  return (
    <div className="py-2">
      <p className="sublabel mb-3">Loading…</p>
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
