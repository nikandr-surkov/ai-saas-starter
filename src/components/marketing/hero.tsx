import Image from "next/image";
import Link from "next/link";
import { StarIcon } from "lucide-react";

import { siteConfig } from "@/config/site";

import { Sparkle, Squiggle } from "@/components/doodads";
import { Sticker } from "@/components/sticker";

import { CopyInstall } from "./copy-install";

// v4 LOUD hero: full-bleed pop-yellow, Archivo H1 (word budget: <=8),
// canvas-colored title shadow, illustration cluster right.
export function Hero() {
  return (
    <header className="bg-pop-yellow [--chip-hover:var(--pop-sky)] [--marker-color:var(--canvas)] [--title-shadow:var(--canvas)]">
      <div className="mx-auto grid w-full max-w-[1160px] items-center gap-16 px-6 pt-16 pb-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="flex items-center gap-3">
            <Sticker color="mint" className="rotate-2">
              MIT · Open source
            </Sticker>
            <Sparkle className="text-foreground" />
          </div>
          {/* Entrance: words pop in staggered (motion kit). Spaces live
              between the spans so textContent stays a normal sentence. */}
          <h1 className="text-display mt-6 mb-5">
            {["A", "complete", "AI", "SaaS.", "Free."].map((word, i) => (
              <span key={word} className="contents">
                <span
                  className="hero-word inline-block"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  {word}
                </span>{" "}
              </span>
            ))}
          </h1>
          <p className="max-w-[46ch] text-lg font-medium">
            Auth, Stripe subscriptions, credits, AI images —{" "}
            <span className="marker">working, tested, MIT</span>. Clone it and
            build YOUR product.
          </p>
          <p className="mt-3 mb-7 font-mono text-xs">
            Open-source GitHub repo by{" "}
            <a
              href="https://nikandr.com"
              target="_blank"
              rel="noreferrer"
              className="marker-hover font-medium underline underline-offset-4"
            >
              Nikandr Surkov
            </a>
          </p>
          <div className="mb-7 flex flex-wrap items-center gap-6">
            <Link
              href="/signup"
              className="border-emph press inline-flex items-center rounded-md bg-background px-5 py-3 text-[15px] font-semibold text-foreground"
            >
              Start free — 10 credits
            </Link>
            <a
              href={siteConfig.github}
              target="_blank"
              rel="noreferrer"
              className="chip inline-flex items-center gap-2 px-3.5 py-1.5 font-mono text-xs tracking-wider uppercase"
            >
              <StarIcon className="size-3.5" aria-hidden />
              Star on GitHub →
            </a>
          </div>
          <CopyInstall command={`git clone ${siteConfig.github}.git`} />
          <Squiggle className="mt-6 text-pop-pink" />
        </div>
        <div className="hero-art relative">
          <Sticker
            color="pink"
            className="hero-sticker absolute top-4 right-4 z-10"
          >
            10 free credits
          </Sticker>
          <Image
            src="/illustrations/hero-cluster.png"
            alt="A retro cartoon robot painting a sparkling landscape at an easel"
            width={520}
            height={520}
            priority
            className="float-idle mx-auto h-auto w-full max-w-[520px]"
          />
        </div>
      </div>
    </header>
  );
}
