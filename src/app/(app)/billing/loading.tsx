import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the billing layout: header, current-plan card (tinted header
// strip), the two plan cards, and the top-up row.
export default function BillingLoading() {
  return (
    <div className="space-y-6" aria-busy>
      <div>
        <Skeleton className="h-3 w-20 rounded-full" />
        <Skeleton className="mt-2 h-8 w-32" />
      </div>
      <div className="max-w-xl overflow-hidden rounded-lg border-2">
        <Skeleton className="h-16 rounded-none border-0 border-b-2" />
        <div className="space-y-3 p-4">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="grid max-w-xl gap-4 sm:grid-cols-2">
        <Skeleton className="h-72 rounded-lg" />
        <Skeleton className="h-72 rounded-lg" />
      </div>
      <Skeleton className="h-24 max-w-xl rounded-lg" />
    </div>
  );
}
