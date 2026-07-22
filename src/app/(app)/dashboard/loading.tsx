import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the dashboard layout (header, digit-box row inside the credits
// card, two tinted card headers, five table rows) so nothing jumps.
export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-busy>
      <div>
        <Skeleton className="h-3 w-20 rounded-full" />
        <Skeleton className="mt-2 h-8 w-44" />
      </div>
      <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
        {[0, 1].map((card) => (
          <div key={card} className="overflow-hidden rounded-lg border-2">
            <Skeleton className="h-16 rounded-none border-0 border-b-2" />
            <div className="space-y-3 p-4">
              {card === 0 ? (
                <div className="flex gap-1.5">
                  {[0, 1].map((box) => (
                    <Skeleton key={box} className="size-10 sm:size-12" />
                  ))}
                </div>
              ) : (
                <Skeleton className="h-7 w-24" />
              )}
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
      <div className="max-w-2xl space-y-3">
        <Skeleton className="h-3 w-36 rounded-full" />
        {[0, 1, 2, 3, 4].map((row) => (
          <Skeleton key={row} className="h-10" />
        ))}
      </div>
    </div>
  );
}
