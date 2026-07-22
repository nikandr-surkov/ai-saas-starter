import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the settings layout: header + four form rows (label + input).
export default function SettingsLoading() {
  return (
    <div className="space-y-6" aria-busy>
      <div>
        <Skeleton className="h-3 w-20 rounded-full" />
        <Skeleton className="mt-2 h-8 w-36" />
      </div>
      <div className="max-w-2xl space-y-5 rounded-lg border-2 p-5">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="max-w-sm space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8" />
          </div>
        ))}
      </div>
    </div>
  );
}
