import { Skeleton } from "@/components/ui/skeleton";

// Route-level loading state for the app shell (DESIGN.md v3.1): the same
// calm layout rhythm as the pages — heading, two cards, ledger rows — in
// bordered skeleton blocks.
export default function AppLoading() {
  return (
    <div className="space-y-6" aria-busy>
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-40" />
      </div>
      <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
      </div>
      <div className="max-w-2xl space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
      </div>
    </div>
  );
}
