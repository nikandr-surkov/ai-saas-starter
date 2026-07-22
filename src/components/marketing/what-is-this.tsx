// v4.3 clarity section: three huge plain-words statements, each with a
// mono chip pointing at the proof. A visitor who reads only this block
// must fully understand the product.
const statements = [
  { line: "This website is the demo.", chip: "sign up, everything works" },
  { line: "The code is a free GitHub repo.", chip: "MIT · clone it" },
  { line: "You build YOUR product on top.", chip: "auth + payments done" },
] as const;

export function WhatIsThis() {
  return (
    <section id="what" className="scroll-mt-16">
      <div className="mx-auto w-full max-w-[1160px] px-6 py-20">
        <div className="pop-in mb-10">
          <p className="eyebrow">Plain words</p>
          <h2 className="text-title mt-4">What is this?</h2>
        </div>
        <ul className="space-y-7">
          {statements.map((statement) => (
            <li
              key={statement.line}
              className="pop-in flex flex-wrap items-center gap-x-5 gap-y-2"
            >
              <span className="font-heading text-[1.75rem] leading-tight font-extrabold">
                {statement.line}
              </span>
              <span className="chip-mono">{statement.chip}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
