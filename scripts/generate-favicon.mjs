#!/usr/bin/env node
/**
 * Generate portfolio favicon via Gemini (Vertex).
 * Post-process: remove white matte/corners, export App Router + public assets.
 */
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { GoogleGenAI } from "@google/genai";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const envArgIdx = process.argv.indexOf("--env");
const envPath =
  (envArgIdx >= 0 && process.argv[envArgIdx + 1]) ||
  process.env.GEMINI_ENV_PATH ||
  path.join(root, ".env.local");
loadEnv({ path: envPath });

const MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
const MASTER_SIZE = 512;
const CANDIDATES = Number(process.env.FAVICON_CANDIDATES || 2);
const project = process.env.GOOGLE_CLOUD_PROJECT || "";
const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
const useVertex =
  process.env.GOOGLE_GENAI_USE_VERTEXAI?.toLowerCase() === "true" ||
  process.env.GOOGLE_GENAI_USE_VERTEXAI === "1" ||
  Boolean(project);

const PROMPT = [
  "Premium web favicon / app mark, modern creative minimal, polished soft lighting.",
  "FULL-BLEED perfect hard square: gradient background covers every pixel including corners.",
  "NO white border, NO white frame, NO rounded-rect chrome drawn in the image, NO padding matte, NO squircle mask.",
  "Background ONLY deep teal → aqua (#0F766E → #22D3EE).",
  "Center a bold geometric monogram letters T and L interlocking or side-by-side (TL), ~65% of canvas,",
  "pearl #F8FAFC primary with mint #5EEAD4 accent on one stroke — readable at 16px, high contrast.",
  "No other text, no watermark, no photoreal details.",
].join(" ");

function createClient() {
  if (useVertex) {
    if (!project) throw new Error("Need GOOGLE_CLOUD_PROJECT");
    delete process.env.GEMINI_API_KEY;
    delete process.env.GOOGLE_CLOUD_API_KEY;
    delete process.env.GOOGLE_API_KEY;
    console.log(`Vertex project=${project} location=${location} model=${MODEL}`);
    return new GoogleGenAI({ vertexai: true, project, location });
  }
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_CLOUD_API_KEY ||
    process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("Missing API key");
  return new GoogleGenAI({ apiKey });
}

function extractImageBytes(response) {
  const parts =
    response?.candidates?.[0]?.content?.parts || response?.parts || [];
  for (const part of parts) {
    const inline = part.inlineData || part.inline_data;
    if (inline?.data) return Buffer.from(inline.data, "base64");
  }
  return null;
}

function isNearWhite(r, g, b, a = 255) {
  return a < 20 || (r > 235 && g > 235 && b > 235);
}

async function toRaw(pngBytes) {
  return sharp(pngBytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
}

async function fromRaw(px, w, h, ch) {
  return sharp(px, { raw: { width: w, height: h, channels: ch } }).png().toBuffer();
}

async function floodWhiteCorners(pngBytes) {
  const { data, info } = await toRaw(pngBytes);
  const { width: w, height: h, channels: ch } = info;
  const px = Buffer.from(data);
  const at = (x, y) => {
    const i = (y * w + x) * ch;
    return [px[i], px[i + 1], px[i + 2], px[i + 3]];
  };
  const set = (x, y, rgba) => {
    const i = (y * w + x) * ch;
    px[i] = rgba[0];
    px[i + 1] = rgba[1];
    px[i + 2] = rgba[2];
    px[i + 3] = rgba[3];
  };

  let bg = [15, 118, 110, 255];
  for (const [x, y] of [
    [Math.floor(w * 0.2), Math.floor(h * 0.2)],
    [Math.floor(w * 0.8), Math.floor(h * 0.2)],
    [Math.floor(w / 2), Math.floor(h * 0.15)],
  ]) {
    const c = at(x, y);
    if (!isNearWhite(...c)) {
      bg = c;
      break;
    }
  }

  const visited = new Uint8Array(w * h);
  const q = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
  ];
  while (q.length) {
    const [x, y] = q.pop();
    if (x < 0 || y < 0 || x >= w || y >= h) continue;
    const idx = y * w + x;
    if (visited[idx]) continue;
    visited[idx] = 1;
    const c = at(x, y);
    if (!isNearWhite(...c)) continue;
    set(x, y, bg);
    q.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return fromRaw(px, w, h, ch);
}

async function scoreFavicon(pngBytes) {
  const { data, info } = await toRaw(pngBytes);
  const { width: w, height: h, channels: ch } = info;
  let edgeBright = 0,
    edgeTotal = 0,
    bright = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * ch;
      const d = Math.min(x, y, w - 1 - x, h - 1 - y);
      if (d < 3) {
        edgeTotal++;
        if (data[i] > 230 && data[i + 1] > 230 && data[i + 2] > 230) edgeBright++;
      }
      if (data[i] > 200 && data[i + 1] > 200 && data[i + 2] > 200) bright++;
    }
  }
  const edgeBrightPct = edgeTotal ? edgeBright / edgeTotal : 1;
  const brightPct = bright / (w * h);
  // Prefer little white matte on edges and some bright monogram pixels
  return {
    score: 100 - edgeBrightPct * 80 + Math.min(brightPct, 0.25) * 40,
    edgeBrightPct,
    brightPct,
  };
}

async function postprocess(rawBytes) {
  let png = await sharp(rawBytes)
    .resize(MASTER_SIZE, MASTER_SIZE, { fit: "cover" })
    .png()
    .toBuffer();
  png = await floodWhiteCorners(png);
  return png;
}

async function generateCandidate(ai) {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: PROMPT,
    config: {
      responseModalities: ["IMAGE"],
      imageConfig: { aspectRatio: "1:1" },
    },
  });
  const bytes = extractImageBytes(response);
  if (!bytes) throw new Error("No image");
  return postprocess(bytes);
}

async function main() {
  const ai = createClient();
  console.log(`Generating favicon (${CANDIDATES} candidates)…`);

  let best = null;
  let bestMeta = null;
  for (let i = 0; i < CANDIDATES; i++) {
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        const png = await generateCandidate(ai);
        const meta = await scoreFavicon(png);
        console.log(
          `  cand ${i + 1}: score=${meta.score.toFixed(1)} edge%=${(meta.edgeBrightPct * 100).toFixed(1)} bright%=${(meta.brightPct * 100).toFixed(1)}`
        );
        if (!best || meta.score > bestMeta.score) {
          best = png;
          bestMeta = meta;
        }
        break;
      } catch (err) {
        console.warn(`  cand ${i + 1} try ${attempt}: ${String(err).slice(0, 120)}`);
        await new Promise((r) => setTimeout(r, attempt * 3000));
      }
    }
  }
  if (!best) throw new Error("Failed to generate favicon");

  const appDir = path.join(root, "src", "app");
  const publicDir = path.join(root, "public");
  await mkdir(appDir, { recursive: true });
  await mkdir(publicDir, { recursive: true });

  const masterPath = path.join(publicDir, "favicon.png");
  const iconPath = path.join(appDir, "icon.png");
  const applePath = path.join(appDir, "apple-icon.png");
  const legacyIco = path.join(appDir, "favicon.ico");

  await writeFile(masterPath, best);
  await sharp(best).resize(32, 32).png().toFile(iconPath);
  await sharp(best).resize(180, 180).png().toFile(applePath);

  try {
    await unlink(legacyIco);
    console.log(`  removed ${legacyIco}`);
  } catch {
    /* already gone */
  }

  console.log(`  → ${masterPath}`);
  console.log(`  → ${iconPath}`);
  console.log(`  → ${applePath}`);
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
