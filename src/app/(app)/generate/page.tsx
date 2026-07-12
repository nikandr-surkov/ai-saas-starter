import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GeneratePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">AI</p>
        <h2 className="mt-1 text-xl">Generate</h2>
      </div>
      <Card className="max-w-md">
        <CardHeader>
          <p className="eyebrow">Milestone</p>
          <CardTitle>Shell only</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          Prompt form, credit spend/refund flow, and generation history arrive
          in M5.
        </CardContent>
      </Card>
    </div>
  );
}
