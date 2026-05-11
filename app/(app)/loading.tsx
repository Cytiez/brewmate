import { Skeleton } from "@/components/ui/Skeleton";

// Default loading state shown while any (app) segment resolves on the server.
// Kept stylistically inert — same hairline + eyebrow grammar as real pages.
export default function AppLoading() {
  return (
    <div className="py-2">
      <p className="sublabel mb-3">Brewing…</p>
      <Skeleton className="h-10 w-2/3 mb-3" />
      <Skeleton className="h-4 w-1/3 mb-8" />
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}
