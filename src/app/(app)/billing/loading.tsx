import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the billing layout: header + plan card (tinted header strip,
// three content rows).
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
          <Skeleton className="h-11 w-52 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
