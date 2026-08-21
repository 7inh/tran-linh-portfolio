#!/usr/bin/env node
/**
 * Generate dock icons via Gemini (Vertex).
 * Post-process: remove white matte/corners,
 * optically center foreground glyph by translating the full image (keeps gradient).
 */
import { mkdir, writeFile } from "node:fs/promises";
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
const OUT_DIR = path.join(root, "public", "icons");
const SIZE = 256;
const CANDIDATES = Number(process.env.ICON_CANDIDATES || 2);
const project = process.env.GOOGLE_CLOUD_PROJECT || "";
const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
const useVertex =
  process.env.GOOGLE_GENAI_USE_VERTEXAI?.toLowerCase() === "true" ||
  process.env.GOOGLE_GENAI_USE_VERTEXAI === "1" ||
  Boolean(project);

const SHARED = [
  "Premium macOS app icon, modern creative minimal, polished soft lighting.",
  "FULL-BLEED perfect square: gradient background covers every pixel including corners.",
  "NO white border, NO white frame, NO rounded-rect chrome drawn in the image, NO padding matte.",
  "Hard square canvas (UI clips corners). Symbol MUST be optically centered both horizontally and vertically.",
  "Symbol ~55% of canvas: modern layered duotone glyph using EXACTLY two colors — pearl #F8FAFC primary fill plus ONE accent color.",
  "Soft depth (subtle inner highlight or secondary shape), not thin outlines, not photoreal, not flat monochrome white silhouette.",
  "No text, no letters, no watermark.",
].join(" ");

const ICONS = [
  {
    id: "about",
    prompt: `${SHARED} Match the same layered soft-3D paper style as a modern folder/briefcase/envelope dock icon. Person/profile mark: head and shoulders as separate soft rounded plates (NOT a flat silhouette cutout). Pearl #F8FAFC primary plates plus SUBSTANTIAL mint #5EEAD4 accent regions (wide collar band AND shoulder plate or hair highlight — accent must be clearly visible, not a thin hairline). Soft drop shadow under the whole figure, rounded forms, soft inner layer shadows. Background ONLY deep teal → aqua (#0F766E → #22D3EE). Stay in teal/cyan family.`,
  },
  {
    id: "projects",
    prompt: `${SHARED} Creative modern folder symbol: pearl #F8FAFC body with soft gold #FDE68A accent (tab or inner paper). Background ONLY amber → tangerine (#F59E0B → #EA580C). Do NOT use teal, cyan, green, blue, purple, or pink.`,
  },
  {
    id: "experience",
    prompt: `${SHARED} Creative modern briefcase symbol: pearl #F8FAFC body with soft lilac #C4B5FD accent (handle or latches). Background ONLY deep violet → indigo (#5B21B6 → #4338CA). Do NOT use teal, cyan, green, blue-gray, amber, or pink.`,
  },
  {
    id: "contact",
    prompt: `${SHARED} Creative modern envelope symbol: pearl #F8FAFC body with soft blush #FDA4AF accent (flap or seal). Background ONLY rose → magenta (#F43F5E → #D946EF). Do NOT use teal, cyan, green, blue, amber, or violet.`,
  },
  {
    id: "dino",
    prompt: `${SHARED} Creative modern cute T-rex / dinosaur silhouette: pearl #F8FAFC body with lime #A3E635 accent (belly or eye spot). Soft drop shadow, rounded forms. Background ONLY lime → forest green (#84CC16 → #166534). Do NOT use teal, cyan, blue, amber, violet, rose, or pink.`,
  },
  {
    id: "minesweeper",
    prompt: `${SHARED} Creative modern minesweeper mine glyph: pearl #F8FAFC spiked mine ball with red #F87171 accent (center fuse or flag tip). Soft drop shadow, rounded forms. Background ONLY slate → steel gray (#475569 → #1E293B). Do NOT use teal, cyan, lime, amber, violet, rose, or pink.`,
  },
  {
    id: "games",
    prompt: [
      "Premium macOS app icon, modern creative minimal, polished soft lighting.",
      "FULL-BLEED perfect square: gradient background covers every pixel including corners.",
      "NO white border, NO white frame, NO rounded-rect chrome drawn in the image, NO padding matte.",
      "Hard square canvas (UI clips corners). Symbol MUST be optically centered both horizontally and vertically.",
      "IGNORE two-tone-only rule for buttons: gamepad BODY must be clean white/pearl #FFFFFF with soft gray shading;",
      "buttons and sticks MUST be vividly colorful and high saturation (not white, not gray).",
      "Centered soft-3D gamepad ~55% of canvas: white body,",
      "face buttons neon hot-pink #FF2D55, neon yellow #FFE566, neon lime #39FF14, neon cyan #00E5FF;",
      "bright orange D-pad #FF9F1C; sticks neon magenta #FF4D6D and neon turquoise #2EE6D6.",
      "Background ONLY bright indigo → vivid sky blue (#818CF8 → #38BDF8).",
      "Soft drop shadow under the gamepad. No text, no letters, no watermark.",
    ].join(" "),
  },
  {
    id: "utilities",
    prompt: [
      "Premium macOS app icon, modern creative minimal, polished soft lighting.",
      "FULL-BLEED perfect square: gradient background covers every pixel including corners.",
      "NO white border, NO white frame, NO rounded-rect chrome drawn in the image, NO padding matte.",
      "Hard square canvas (UI clips corners). Symbol MUST be optically centered both horizontally and vertically.",
      "IGNORE two-tone-only rule: wrench and accents MUST be vividly colorful and high saturation (not plain white).",
      "Centered soft-3D crossed tools ~55% of canvas: stylized wrench and screwdriver/gear combo,",
      "wrench body neon amber #FBBF24 with hot coral #FB7185 handle accents,",
      "screwdriver/gear neon cyan #22D3EE and vivid violet #A78BFA accents,",
      "soft layered depth, rounded forms, soft drop shadow under the tools.",
      "Background ONLY soft grey → steel grey (#94A3B8 → #475569). Do NOT use purple, pink, blue, teal, amber, or green in the background.",
      "No text, no letters, no watermark. Do NOT use flat monochrome white silhouette.",
    ].join(" "),
  },
  {
    id: "trash",
    prompt: `${SHARED} Creative modern wastebasket / trash can symbol ONLY on a fully TRANSPARENT background (no square plate, no gradient fill behind the can). Pearl #F8FAFC body with soft gray #94A3B8 accent (lid rim or handle). Soft drop shadow under the can only. Isolated object, centered. Do NOT draw any background shape or color field.`,
  },
];

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

function rgbDist(a, b) {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/** Sample corner/edge background color (skip white matte). */
function sampleBg(px, w, h, ch) {
  let bg = [40, 100, 120];
  for (const [x, y] of [
    [Math.floor(w * 0.08), Math.floor(h * 0.08)],
    [Math.floor(w * 0.92), Math.floor(h * 0.08)],
    [Math.floor(w * 0.08), Math.floor(h * 0.92)],
    [Math.floor(w * 0.92), Math.floor(h * 0.92)],
    [Math.floor(w * 0.5), Math.floor(h * 0.06)],
  ]) {
    const i = (y * w + x) * ch;
    const c = [px[i], px[i + 1], px[i + 2]];
    if (!isNearWhite(c[0], c[1], c[2], px[i + 3])) {
      bg = c;
      break;
    }
  }
  return bg;
}

/**
 * Foreground = not near-white matte AND far enough from sampled bg.
 * Catches pearl + accent two-tone glyphs (not only strict white).
 */
function isForeground(r, g, b, a, bg, threshold = 48) {
  if (a < 20) return false;
  if (isNearWhite(r, g, b, a) && rgbDist([r, g, b], bg) < 30) return false;
  return rgbDist([r, g, b], bg) >= threshold;
}

function foregroundBBox(px, w, h, ch) {
  const bg = sampleBg(px, w, h, ch);
  let minX = w,
    minY = h,
    maxX = -1,
    maxY = -1,
    n = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * ch;
      if (!isForeground(px[i], px[i + 1], px[i + 2], px[i + 3], bg)) continue;
      n++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  return { minX, minY, maxX, maxY, n, bg };
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

  let bg = [40, 100, 120, 255];
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

/** Translate whole image so foreground-glyph bbox is optically centered. Keeps gradient. */
async function opticalCenter(pngBytes) {
  const { data, info } = await toRaw(pngBytes);
  const { width: w, height: h, channels: ch } = info;
  const px = Buffer.from(data);

  const { minX, minY, maxX, maxY, n } = foregroundBBox(px, w, h, ch);
  if (n < 40 || maxY < 0) return pngBytes;

  const symW = maxX - minX + 1;
  const symH = maxY - minY + 1;
  const dx = Math.round((w - symW) / 2) - minX;
  const dy = Math.round((h - symH) / 2) - minY;
  if (dx === 0 && dy === 0) return pngBytes;

  const out = Buffer.alloc(w * h * ch);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const srcX = x - dx;
      const srcY = y - dy;
      const useX = srcX < 0 ? 0 : srcX >= w ? w - 1 : srcX;
      const useY = srcY < 0 ? 0 : srcY >= h ? h - 1 : srcY;
      const si = (useY * w + useX) * ch;
      const di = (y * w + x) * ch;
      if (srcX >= 0 && srcX < w && srcY >= 0 && srcY < h) {
        out[di] = px[si];
        out[di + 1] = px[si + 1];
        out[di + 2] = px[si + 2];
        out[di + 3] = px[si + 3];
      } else {
        out[di] = px[si];
        out[di + 1] = px[si + 1];
        out[di + 2] = px[si + 2];
        out[di + 3] = 255;
      }
    }
  }
  return fromRaw(out, w, h, ch);
}

async function postprocessIcon(rawBytes) {
  let png = await sharp(rawBytes)
    .resize(SIZE, SIZE, { fit: "cover" })
    .png()
    .toBuffer();
  png = await floodWhiteCorners(png);
  png = await opticalCenter(png);
  png = await floodWhiteCorners(png);
  return png;
}

async function scoreIcon(pngBytes) {
  const { data, info } = await toRaw(pngBytes);
  const { width: w, height: h, channels: ch } = info;
  const { minY, maxY, n } = foregroundBBox(data, w, h, ch);
  let edgeBright = 0,
    edgeTotal = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const d = Math.min(x, y, w - 1 - x, h - 1 - y);
      if (d >= 3) continue;
      edgeTotal++;
      const i = (y * w + x) * ch;
      if (data[i] > 230 && data[i + 1] > 230 && data[i + 2] > 230) edgeBright++;
    }
  }
  const padDelta = n ? Math.abs(h - 1 - maxY - minY) : 99;
  const edgeBrightPct = edgeTotal ? edgeBright / edgeTotal : 1;
  return {
    score: 100 - padDelta * 2 - edgeBrightPct * 80,
    padDelta,
    edgeBrightPct,
  };
}

async function generateCandidate(ai, prompt) {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseModalities: ["IMAGE"],
      imageConfig: { aspectRatio: "1:1" },
    },
  });
  const bytes = extractImageBytes(response);
  if (!bytes) throw new Error("No image");
  return postprocessIcon(bytes);
}

async function generateOne(ai, icon) {
  console.log(`Generating ${icon.id} (${CANDIDATES} candidates)…`);
  let best = null;
  let bestMeta = null;
  for (let i = 0; i < CANDIDATES; i++) {
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        const png = await generateCandidate(ai, icon.prompt);
        const meta = await scoreIcon(png);
        console.log(
          `  cand ${i + 1}: score=${meta.score.toFixed(1)} padΔ=${meta.padDelta} edge%=${(meta.edgeBrightPct * 100).toFixed(1)}`
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
  if (!best) throw new Error(`Failed ${icon.id}`);
  const dest = path.join(OUT_DIR, `${icon.id}.png`);
  await writeFile(dest, best);
  console.log(`  → ${dest}`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const onlyIdx = process.argv.indexOf("--only");
  const onlyId = onlyIdx >= 0 ? process.argv[onlyIdx + 1] : null;
  const list = onlyId ? ICONS.filter((i) => i.id === onlyId) : ICONS;
  if (onlyId && !list.length) {
    throw new Error(`Unknown --only id "${onlyId}". Valid: ${ICONS.map((i) => i.id).join(", ")}`);
  }
  const ai = createClient();
  for (const icon of list) await generateOne(ai, icon);
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
