import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the generate layout: header + balance chip, prompt field,
// button, two-column tile grid.
export default function GenerateLoading() {
  return (
    <div className="space-y-8" aria-busy>
      <div className="flex items-end justify-between gap-4">
        <div>
          <Skeleton className="h-3 w-10 rounded-full" />
          <Skeleton className="mt-2 h-8 w-40" />
        </div>
        <Skeleton className="h-7 w-28 rounded-full" />
      </div>
      <div className="max-w-xl space-y-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-11 w-48 rounded-lg" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-3 w-28 rounded-full" />
        <div className="grid max-w-2xl grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((tile) => (
            <Skeleton key={tile} className="aspect-square rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
