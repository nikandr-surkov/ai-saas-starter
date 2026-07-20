import { readFile } from "node:fs/promises";
import path from "node:path";

// "Real code is the testimonial" — renders the ACTUAL spendCredits function
// from src/lib/credits/index.ts, extracted at build time so the exhibit can
// never drift from the shipped implementation. The landing page is static:
// this read happens during `next build`, not per request.

async function spendCreditsSource(): Promise<string> {
  try {
    const file = await readFile(
      path.join(process.cwd(), "src", "lib", "credits", "index.ts"),
      "utf8",
    );
    const start = file.indexOf("export async function spendCredits");
    if (start === -1) throw new Error("spendCredits not found");
    // The body brace, not the destructured-params brace: it is the first
    // "{" after the params list closes.
    const paramsClose = file.indexOf(")", start);
    const openBrace = file.indexOf("{", paramsClose);
    let depth = 0;
    for (let i = openBrace; i < file.length; i++) {
      if (file[i] === "{") depth++;
      if (file[i] === "}") depth--;
      if (depth === 0) return file.slice(start, i + 1);
    }
    throw new Error("unbalanced braces");
  } catch {
    return "// Read the real thing: src/lib/credits/index.ts";
  }
}

export async function CodeExhibit() {
  const source = await spendCreditsSource();

  return (
    <section id="code" className="scroll-mt-16 border-t-[3px]">
      <div className="mx-auto w-full max-w-[1160px] px-6 py-20">
        <div className="fade-up mb-11">
          <p className="eyebrow">Exhibit A</p>
          <h2 className="text-title mt-4">Real code. Tested.</h2>
          <p className="mt-4 max-w-[52ch] text-muted-foreground">
            The actual spendCredits function, rendered from source at build — it
            cannot drift from the shipped implementation.
          </p>
        </div>
        <div className="border-hard overflow-hidden rounded-md bg-secondary shadow-hard">
          <div className="flex justify-between border-b-2 px-4.5 py-2.5 font-mono text-[10.5px] tracking-wider text-muted-foreground uppercase">
            <span>src/lib/credits/index.ts · spendCredits</span>
            <span>rendered from source at build</span>
          </div>
          <pre className="overflow-x-auto px-4.5 py-5 font-mono text-xs leading-[1.75] font-light">
            {source.split("\n").map((line, i) => (
              <span
                key={i}
                className={
                  line.trim().startsWith("//") ? "text-muted-foreground" : ""
                }
              >
                {line}
                {"\n"}
              </span>
            ))}
          </pre>
        </div>
      </div>
    </section>
  );
}
