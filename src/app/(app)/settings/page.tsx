import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Account</p>
        <h2 className="mt-1 text-xl">Settings</h2>
      </div>
      <Card className="max-w-md">
        <CardHeader>
          <p className="eyebrow">Milestone</p>
          <CardTitle>Shell only</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          Profile, linked providers, password, and account deletion arrive with
          auth in M2.
        </CardContent>
      </Card>
    </div>
  );
}
