import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Overview</p>
        <h2 className="mt-1 text-xl">Dashboard</h2>
      </div>
      <Card className="max-w-md">
        <CardHeader>
          <p className="eyebrow">Milestone</p>
          <CardTitle>Shell only</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          Balance card, recent generations, subscription status, and the ledger
          table arrive with auth and billing (M2–M4).
        </CardContent>
      </Card>
    </div>
  );
}
