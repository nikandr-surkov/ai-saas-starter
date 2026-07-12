export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <p className="font-mono text-xs uppercase tracking-widest">
        ai-saas-starter
      </p>
      <h1 className="text-center text-3xl font-semibold tracking-tight">
        M0 scaffold. The landing page ships in M6.
      </h1>
      <p className="text-center text-sm">
        Auth, Stripe subscriptions, and a credits ledger that survives webhook
        retries.
      </p>
    </main>
  );
}
