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
  // v4.1 gallery: full-bleed square mini-posters in the SAME world as
  // the landscape painting on the robot's easel — opaque, framed in the
  // UI, so no transparency pass.
  ...[
    ["gallery-01", "a sunset over mountains"],
    ["gallery-02", "a retro city skyline"],
    ["gallery-03", "an ocean wave with the sun"],
    ["gallery-04", "outer space with planets and stars"],
    ["gallery-05", "a forest with a river"],
    ["gallery-06", "a hot-air balloon over fields"],
  ].map(([name, scene]) => ({
    name,
    width: 512,
    maxKB: 120,
    opaque: true,
    subject:
      `a retro cartoon landscape mini-poster of ${scene}, in the same ` +
      "world as the small landscape painting on a cartoon robot artist's " +
      "easel — halftone sun rays and clouds",
  })),
];

const CONCURRENCY = 4;

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

function buildInput(schema, set, transparent) {
  const props = schema.properties ?? {};
  const prompt = set.opaque
    ? `${set.subject}, full-bleed square composition, color to every edge, ${STYLE}`
    : transparent
      ? `${set.subject}, centered square composition with generous empty margins, ${STYLE}`
      : `${set.subject}, centered square composition with generous empty margins, ${STYLE}, on a solid flat pure green #00FF00 background — the color green appears nowhere in the subject itself`;
  const input = { prompt };
  if (!set.opaque && transparent && props.background)
    input.background = "transparent";
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

function finalizeImage(source, destination, width, maxKB = 150) {
  const code = `
import os, sys
from PIL import Image
src, dst, width, max_kb = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
img = Image.open(src).convert("RGBA")
if img.width > width:
    img = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
img.save(dst, optimize=True)
if os.path.getsize(dst) > max_kb * 1024:
    img.quantize(colors=256, method=Image.FASTOCTREE).save(dst, optimize=True)
print(f"{dst}: {img.size[0]}x{img.size[1]}, {os.path.getsize(dst)} bytes")
`;
  execFileSync(
    "python",
    ["-c", code, source, destination, String(width), String(maxKB)],
    { stdio: "inherit" },
  );
}

// Shared transparency mode for the non-opaque sets. Workers flip it to
// green-screen on the first rejection; in-flight siblings that also fail
// retry individually (single-threaded JS — no real race).
const mode = { transparent: false };

async function createPrediction(slug, schema, set, label) {
  const input = buildInput(schema, set, mode.transparent);
  const create = await api(`/models/${slug}/predictions`, {
    method: "POST",
    body: JSON.stringify({ input }),
  });
  if (!create.ok) {
    const body = await create.text();
    throw new Error(
      `${label}: create failed HTTP ${create.status}: ${body.slice(0, 400)}`,
    );
  }
  const created = await create.json();
  console.log(`${label}: prediction ${created.id}`);
  return poll(created.id);
}

async function generateOne(slug, schema, set, candidate) {
  const label = `${set.name}-${candidate}`;
  const file = path.join(CAND_DIR, `${label}.png`);
  if (existsSync(file)) {
    console.log(`${label}: exists, skipping`);
    return;
  }
  let prediction = await createPrediction(slug, schema, set, label);
  if (
    prediction.status === "failed" &&
    !set.opaque &&
    mode.transparent &&
    /transparent|background/i.test(String(prediction.error))
  ) {
    // gpt-image-2's schema advertises `background`, but the provider
    // rejects "transparent" at run time — fall back to green-screen.
    console.log(`${label}: transparency rejected, switching to green-screen`);
    mode.transparent = false;
    prediction = await createPrediction(slug, schema, set, label);
  }
  if (prediction.status !== "succeeded") {
    throw new Error(
      `${label}: ${prediction.status} — ${String(prediction.error).slice(0, 400)}`,
    );
  }
  const url = firstUrl(prediction.output);
  if (!url) throw new Error(`${label}: no output URL`);
  const image = await fetch(url);
  if (!image.ok) throw new Error(`${label}: download HTTP ${image.status}`);
  writeFileSync(file, Buffer.from(await image.arrayBuffer()));
  if (!set.opaque && !mode.transparent) chromaKey(file);
  console.log(`${label}: saved ${file}`);
}

async function generate(only) {
  const sets = only
    ? SETS.filter((s) => s.name === only || s.name.startsWith(only))
    : SETS;
  if (sets.length === 0) {
    console.error(`Unknown set "${only}".`);
    process.exit(1);
  }
  mkdirSync(CAND_DIR, { recursive: true });
  const { slug, schema } = await resolveModel();
  mode.transparent = Boolean(schema.properties?.background);
  console.log(
    mode.transparent
      ? "transparency: native (background=transparent) for non-opaque sets"
      : "transparency: green-screen + chroma-key (schema has no background input)",
  );

  // Task pool: every set x candidate, CONCURRENCY workers pull from it.
  const tasks = sets.flatMap((set) =>
    CANDIDATES.map((candidate) => ({ set, candidate })),
  );
  let next = 0;
  async function worker() {
    while (next < tasks.length) {
      const task = tasks[next++];
      await generateOne(slug, schema, task.set, task.candidate);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, tasks.length) }, worker),
  );
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
    finalizeImage(
      source,
      path.join(OUT_DIR, `${set.name}.png`),
      set.width,
      set.maxKB,
    );
  }
  rmSync(CAND_DIR, { recursive: true });
  console.log("Finalized; candidates deleted.");
}

const argv = process.argv.slice(2);
if (argv[0] === "--finalize") await finalize(argv.slice(1));
else if (argv[0] === "--only") await generate(argv[1]);
else await generate();
