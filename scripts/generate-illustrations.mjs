#!/usr/bin/env node
/**
 * Illustration pipeline (DESIGN.md v3.1, Stage 2) — plain node, no deps.
 *
 *   node scripts/generate-illustrations.mjs            # generate 2 candidates per set
 *   node scripts/generate-illustrations.mjs --finalize hero-cluster=a mascot-hello=b ...
 *
 * Generates the five-illustration set on Replicate (openai/gpt-image-2,
 * falling back to openai/gpt-image-1), preferring native transparency and
 * dropping to a #00FF00 green-screen + PIL chroma-key when the model's
 * schema has no transparent-background input. `--finalize` resizes the
 * kept candidates to 2x display size, recompresses to <150KB, and deletes
 * the rest.
 *
 * SECURITY: the Replicate token comes from process.env or ./.env and is
 * only ever placed in the Authorization header — never log the token, the
 * header, or the .env contents. Log request URLs and prediction IDs only.
 */
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const API = "https://api.replicate.com/v1";
const OUT_DIR = path.join("public", "illustrations");
const CAND_DIR = path.join(OUT_DIR, "candidates");
const CANDIDATES = ["a", "b"];

const STYLE =
  "flat vector sticker illustration, neo-brutalist style, thick black " +
  "outline (uniform weight), flat color fills only — cream #FFFDF5, " +
  "yellow #FFD23F, mint green, sky blue #74B9FF, coral pink — halftone " +
  "dot shading, retro cartoon mascot energy, no gradients, no soft " +
  "shadows, no text";

// Prompts 2–4 describe the coin character IDENTICALLY for consistency.
// Owner-locked model: entirely gold-yellow — bare stubby arms AND bare
// stubby feet, no shoes, no gloves; coral only in floating accents.
const COIN =
  "a round gold coin character with a thick outline, simple dot eyes, " +
  "a small smile, bare stubby yellow arms, and bare stubby yellow feet " +
  "with no shoes and no gloves — the character itself is entirely " +
  "gold-yellow; coral pink may appear only in small floating accent " +
  "shapes, never on the character";

const SETS = [
  {
    name: "hero-cluster",
    width: 1040,
    subject:
      "a retro cartoon robot artist standing at an easel, painting a " +
      "landscape that sparkles, with floating 4-point stars and one " +
      "lightning bolt around it",
  },
  {
    name: "mascot-hello",
    width: 320,
    subject: `${COIN}, with a simple smiley face and sunglasses pushed up on its forehead, waving hello with one stubby arm`,
  },
  {
    name: "mascot-paint",
    width: 320,
    subject: `${COIN}, holding a paintbrush and dabbing paint at a tiny canvas on an easel`,
  },
  {
    name: "mascot-lost",
    width: 320,
    subject: `${COIN}, shrugging with both stubby arms raised, a big black ink question mark floating beside it`,
  },
  {
    name: "sticker-stack",
    width: 400,
    subject:
      "a neat stack of gold coins with one coin spinning off the top, " +
      "with simple motion lines",
  },
];

function token() {
  if (process.env.REPLICATE_API_TOKEN) return process.env.REPLICATE_API_TOKEN;
  try {
    // Tolerate `KEY=v`, `KEY = v`, `export KEY=v`, and quoted values.
    for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
      const match = line.match(
        /^\s*(?:export\s+)?REPLICATE_API_TOKEN\s*=\s*(.*)$/,
      );
      if (match) {
        const value = match[1].trim().replace(/^["']|["']$/g, "");
        if (value) return value;
      }
    }
  } catch {
    // fall through to the error below
  }
  console.error(
    "REPLICATE_API_TOKEN not found in the environment or ./.env — aborting.",
  );
  process.exit(1);
}

const TOKEN = token();

async function api(pathname, init = {}) {
  const url = pathname.startsWith("http") ? pathname : `${API}${pathname}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  return response;
}

async function resolveModel() {
  for (const slug of ["openai/gpt-image-2", "openai/gpt-image-1"]) {
    const response = await api(`/models/${slug}`);
    if (response.ok) {
      const model = await response.json();
      const schema =
        model.latest_version?.openapi_schema?.components?.schemas?.Input ?? {};
      console.log(`model: ${slug}`);
      return { slug, schema };
    }
    console.log(`model: ${slug} -> HTTP ${response.status}, trying fallback`);
  }
  console.error("No usable openai/gpt-image model found on Replicate.");
  process.exit(1);
}

function buildInput(schema, subject, transparent) {
  const props = schema.properties ?? {};
  const prompt = transparent
    ? `${subject}, centered square composition with generous empty margins, ${STYLE}`
    : `${subject}, centered square composition with generous empty margins, ${STYLE}, on a solid flat pure green #00FF00 background — the color green appears nowhere in the subject itself`;
  const input = { prompt };
  if (transparent && props.background) input.background = "transparent";
  if (props.output_format) input.output_format = "png";
  if (props.quality) input.quality = "high";
  if (props.aspect_ratio) input.aspect_ratio = "1:1";
  else if (props.size) input.size = "1024x1024";
  if (props.number_of_images) input.number_of_images = 1;
  return input;
}

function firstUrl(output) {
  if (typeof output === "string") return output;
  if (Array.isArray(output)) return firstUrl(output[0]);
  if (output && typeof output === "object" && "url" in output)
    return output.url;
  return null;
}

async function poll(id) {
  for (let i = 0; i < 200; i++) {
    const response = await api(`/predictions/${id}`);
    if (!response.ok) throw new Error(`poll ${id}: HTTP ${response.status}`);
    const prediction = await response.json();
    if (["succeeded", "failed", "canceled"].includes(prediction.status))
      return prediction;
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  throw new Error(`poll ${id}: timed out`);
}

function chromaKey(file) {
  // Per spec: alpha=0 where g>150 and g>1.35*r and g>1.35*b, then a 1px
  // despill pass on edge pixels.
  const code = `
import sys
from PIL import Image
img = Image.open(sys.argv[1]).convert("RGBA")
px = img.load()
w, h = img.size
for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        if g > 150 and g > 1.35 * r and g > 1.35 * b:
            px[x, y] = (r, g, b, 0)
for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        if a == 0:
            continue
        edge = False
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and px[nx, ny][3] == 0:
                edge = True
                break
        if edge and g > max(r, b):
            px[x, y] = (r, min(g, (r + b) // 2), b, a)
img.save(sys.argv[1])
`;
  execFileSync("python", ["-c", code, file], { stdio: "inherit" });
}

function finalizeImage(source, destination, width) {
  const code = `
import os, sys
from PIL import Image
src, dst, width = sys.argv[1], sys.argv[2], int(sys.argv[3])
img = Image.open(src).convert("RGBA")
if img.width > width:
    img = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
img.save(dst, optimize=True)
if os.path.getsize(dst) > 150 * 1024:
    img.quantize(colors=256, method=Image.FASTOCTREE).save(dst, optimize=True)
print(f"{dst}: {img.size[0]}x{img.size[1]}, {os.path.getsize(dst)} bytes")
`;
  execFileSync("python", ["-c", code, source, destination, String(width)], {
    stdio: "inherit",
  });
}

async function generate(only) {
  const sets = only ? SETS.filter((s) => s.name === only) : SETS;
  if (sets.length === 0) {
    console.error(`Unknown set "${only}".`);
    process.exit(1);
  }
  mkdirSync(CAND_DIR, { recursive: true });
  const { slug, schema } = await resolveModel();
  let transparent = Boolean(schema.properties?.background);
  console.log(
    transparent
      ? "transparency: native (background=transparent)"
      : "transparency: green-screen + chroma-key (schema has no background input)",
  );

  for (const set of sets) {
    for (const candidate of CANDIDATES) {
      const file = path.join(CAND_DIR, `${set.name}-${candidate}.png`);
      if (existsSync(file)) {
        console.log(`${set.name}-${candidate}: exists, skipping`);
        continue;
      }
      let input = buildInput(schema, set.subject, transparent);
      let create = await api(`/models/${slug}/predictions`, {
        method: "POST",
        body: JSON.stringify({ input }),
      });
      if (create.status === 422 && transparent) {
        // The live schema rejected the transparency input — regenerate
        // everything from here on green screen.
        console.log(
          `${set.name}-${candidate}: transparency rejected (422), switching to green-screen`,
        );
        transparent = false;
        input = buildInput(schema, set.subject, transparent);
        create = await api(`/models/${slug}/predictions`, {
          method: "POST",
          body: JSON.stringify({ input }),
        });
      }
      if (!create.ok) {
        const body = await create.text();
        throw new Error(
          `${set.name}-${candidate}: create failed HTTP ${create.status}: ${body.slice(0, 400)}`,
        );
      }
      const created = await create.json();
      console.log(`${set.name}-${candidate}: prediction ${created.id}`);
      let prediction = await poll(created.id);
      if (
        prediction.status === "failed" &&
        transparent &&
        /transparent|background/i.test(String(prediction.error))
      ) {
        // gpt-image-2's schema advertises `background`, but the provider
        // rejects "transparent" at run time — fall back to green-screen.
        console.log(
          `${set.name}-${candidate}: transparency rejected at run time, switching to green-screen`,
        );
        transparent = false;
        input = buildInput(schema, set.subject, transparent);
        create = await api(`/models/${slug}/predictions`, {
          method: "POST",
          body: JSON.stringify({ input }),
        });
        if (!create.ok) {
          const body = await create.text();
          throw new Error(
            `${set.name}-${candidate}: retry create failed HTTP ${create.status}: ${body.slice(0, 400)}`,
          );
        }
        const retried = await create.json();
        console.log(`${set.name}-${candidate}: prediction ${retried.id}`);
        prediction = await poll(retried.id);
      }
      if (prediction.status !== "succeeded") {
        throw new Error(
          `${set.name}-${candidate}: ${prediction.status} — ${String(prediction.error).slice(0, 400)}`,
        );
      }
      const url = firstUrl(prediction.output);
      if (!url) throw new Error(`${set.name}-${candidate}: no output URL`);
      const image = await fetch(url);
      if (!image.ok)
        throw new Error(
          `${set.name}-${candidate}: download HTTP ${image.status}`,
        );
      writeFileSync(file, Buffer.from(await image.arrayBuffer()));
      if (!transparent) chromaKey(file);
      console.log(`${set.name}-${candidate}: saved ${file}`);
    }
  }
  console.log(
    "Done. Review the candidates, then run --finalize name=a|b for each.",
  );
}

function finalize(args) {
  // Only the sets named in the args are (re)finalized — already-approved
  // finals for other sets stay untouched.
  const picks = Object.fromEntries(args.map((a) => a.split("=")));
  for (const set of SETS) {
    const pick = picks[set.name];
    if (pick === undefined) continue;
    if (!CANDIDATES.includes(pick)) {
      console.error(`Invalid pick for ${set.name} (want a or b).`);
      process.exit(1);
    }
    const source = path.join(CAND_DIR, `${set.name}-${pick}.png`);
    if (!existsSync(source)) {
      console.error(`${source} does not exist.`);
      process.exit(1);
    }
    finalizeImage(source, path.join(OUT_DIR, `${set.name}.png`), set.width);
  }
  rmSync(CAND_DIR, { recursive: true });
  console.log("Finalized; candidates deleted.");
}

const argv = process.argv.slice(2);
if (argv[0] === "--finalize") await finalize(argv.slice(1));
else if (argv[0] === "--only") await generate(argv[1]);
else await generate();
