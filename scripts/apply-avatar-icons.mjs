#!/usr/bin/env node
/**
 * Apply portrait artwork to About dock icon + favicon set.
 * White bg kept as solid white square with centered portrait.
 */
import { mkdir, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const DEFAULT_SRC = path.join(
  homedir(),
  "Downloads",
  "ChatGPT Image 21_42_02 21 thg 8, 2026.png"
);

const srcArg = process.argv[2];
const SRC = srcArg ? path.resolve(srcArg) : DEFAULT_SRC;

const MASTER = 512;
const GLYPH_SCALE = 0.7;
const WHITE_THRESHOLD = 245;

async function makeBackground(size) {
  const svg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <rect width="100%" height="100%" fill="#FFFFFF"/>
    </svg>
  `);
  return sharp(svg).png().toBuffer();
}

async function portraitOnBackground(size) {
  const trimmed = await sharp(SRC).trim({ threshold: 20 }).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });

  const { data, info } = trimmed;
  const { width: w, height: h, channels: ch } = info;
  const px = Buffer.from(data);

  for (let i = 0; i < px.length; i += ch) {
    const r = px[i];
    const g = px[i + 1];
    const b = px[i + 2];
    if (r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD) {
      px[i + 3] = 0;
    }
  }

  const glyphMax = Math.round(size * GLYPH_SCALE);
  const glyphPng = await sharp(px, { raw: { width: w, height: h, channels: ch } })
    .resize(glyphMax, glyphMax, {
      fit: "inside",
      withoutEnlargement: false,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const meta = await sharp(glyphPng).metadata();
  const gw = meta.width ?? glyphMax;
  const gh = meta.height ?? glyphMax;
  const left = Math.round((size - gw) / 2);
  const top = Math.round((size - gh) / 2);

  const bg = await makeBackground(size);
  return sharp(bg)
    .composite([{ input: glyphPng, left, top }])
    .png()
    .toBuffer();
}

async function main() {
  await access(SRC);
  console.log(`Source: ${SRC}`);

  const master = await portraitOnBackground(MASTER);

  const brandDir = path.join(root, "public", "brand");
  const iconsDir = path.join(root, "public", "icons");
  const appDir = path.join(root, "src", "app");
  await mkdir(brandDir, { recursive: true });
  await mkdir(iconsDir, { recursive: true });
  await mkdir(appDir, { recursive: true });

  const brandPath = path.join(brandDir, "avatar-icon.png");
  const aboutPath = path.join(iconsDir, "about.png");
  const faviconPath = path.join(root, "public", "favicon.png");
  const iconPath = path.join(appDir, "icon.png");
  const applePath = path.join(appDir, "apple-icon.png");

  await sharp(master).png().toFile(brandPath);
  await sharp(master).resize(MASTER, MASTER).png().toFile(faviconPath);
  await sharp(master).resize(256, 256).png().toFile(aboutPath);
  await sharp(master).resize(32, 32).png().toFile(iconPath);
  await sharp(master).resize(180, 180).png().toFile(applePath);

  console.log(`  → ${brandPath}`);
  console.log(`  → ${aboutPath}`);
  console.log(`  → ${faviconPath}`);
  console.log(`  → ${iconPath}`);
  console.log(`  → ${applePath}`);
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
