import Image from "next/image";

import { cn } from "@/lib/utils";

// v4.1 gallery (replaces the code exhibit): six sample generations in
// bordered frames with alternating tilts that straighten on hover.
// Same illustrated world as the hero robot's easel painting.
const tiles = [
  { file: "gallery-01", caption: "sunset over mountains" },
  { file: "gallery-02", caption: "retro city skyline" },
  { file: "gallery-03", caption: "ocean wave with sun" },
  { file: "gallery-04", caption: "space with planets" },
  { file: "gallery-05", caption: "forest with a river" },
  { file: "gallery-06", caption: "hot-air balloon over fields" },
] as const;

export function Gallery() {
  return (
    <section id="gallery" className="scroll-mt-16 border-t-[3px]">
      <div className="mx-auto w-full max-w-[1160px] px-6 py-20">
        <div className="pop-in mb-12">
          <p className="eyebrow">Sample generations</p>
          <h2 className="text-title mt-4">Made with it.</h2>
          <p className="mt-4 max-w-[52ch]">
            Six prompts through the same pipeline you get —{" "}
            <span className="chip-mono text-foreground">1 credit</span> each.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-3">
          {tiles.map((tile, i) => (
            <figure
              key={tile.file}
              className={cn(
                "pop-in transition-[rotate,translate] duration-150",
                i % 2 === 0 ? "rotate-[1.5deg]" : "-rotate-[1.5deg]",
                "motion-safe:hover:-translate-y-1 motion-safe:hover:rotate-0",
              )}
            >
              <div className="border-hard overflow-hidden rounded-md shadow-hard">
                <Image
                  src={`/illustrations/${tile.file}.png`}
                  alt={`AI-generated retro poster: ${tile.caption}`}
                  width={512}
                  height={512}
                  className="h-auto w-full"
                />
              </div>
              <figcaption className="mt-3">
                <span className="inline-block rounded-full border-2 bg-background px-2.5 py-0.5 font-mono text-[11px]">
                  {tile.caption}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
