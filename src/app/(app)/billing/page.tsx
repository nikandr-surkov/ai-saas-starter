import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";

export default async function BillingPage() {
  await requireSession();
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Account</p>
        <h2 className="mt-1 text-xl">Billing</h2>
      </div>
      <Card className="max-w-md">
        <CardHeader>
          <p className="eyebrow">Milestone</p>
          <CardTitle>Shell only</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          Plan status, renewal date, credit balance, portal, and top-up arrive
          with Stripe in M3.
        </CardContent>
      </Card>
    </div>
  );
}
