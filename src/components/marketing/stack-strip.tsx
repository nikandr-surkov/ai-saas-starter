const stack = [
  ["Next.js 16", "App Router"],
  ["Better Auth 1.5", "own your users"],
  ["Drizzle", "Postgres"],
  ["Stripe", "checkout+portal"],
  ["AI SDK 6", "gateway"],
  ["Tailwind v4", "shadcn/ui"],
] as const;

export function StackStrip() {
  return (
    <div className="border-t-[3px]">
      <div className="mx-auto flex w-full max-w-[1160px] flex-wrap justify-between gap-x-6 gap-y-3 px-6 py-4.5 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
        {stack.map(([tech, detail]) => (
          <span key={tech}>
            <span className="text-foreground">{tech}</span>·{detail}
          </span>
        ))}
      </div>
    </div>
  );
}
