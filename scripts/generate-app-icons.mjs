#!/usr/bin/env node
/**
 * Generate dock icons via Claude LLM as SVG code.
 * Simpler than Gemini approach: no image post-processing, semantic SVG generation.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import Anthropic from "@anthropic-ai/sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const envArgIdx = process.argv.indexOf("--env");
const envPath =
  (envArgIdx >= 0 && process.argv[envArgIdx + 1]) ||
  process.env.CLAUDE_ENV_PATH ||
  path.join(root, ".env.local");
loadEnv({ path: envPath });

const MODEL = "claude-3-5-sonnet-20241022";
const OUT_DIR = path.join(root, "public", "icons");

const ICONS = [
  {
    id: "about",
    prompt:
      "Generate a perfect SVG icon (256x256, viewBox='0 0 256 256'). Design: Colorful flower/rainbow petals - 6+ petals arranged in a circle around a central point, each petal a different vibrant color (red, orange, yellow, green, cyan, blue, purple). White background. Clean, bright, flat design. Return ONLY the raw SVG code, no markdown or explanation.",
  },
  {
    id: "projects",
    prompt:
      "Generate a perfect SVG icon (256x256, viewBox='0 0 256 256'). Design: Blue folder icon (#5B9FD1) on light blue background (#C5D9F0). Simple closed folder with small tab at top-left. Flat design with subtle drop shadow. Return ONLY the raw SVG code, no markdown or explanation.",
  },
  {
    id: "experience",
    prompt:
      "Generate a perfect SVG icon (256x256, viewBox='0 0 256 256'). Design: Terminal prompt symbol (greater-than > and underscore _) in white (#FFFFFF) on dark gray background (#4A4A4A). Minimal, clean design with subtle drop shadow. Return ONLY the raw SVG code, no markdown or explanation.",
  },
  {
    id: "contact",
    prompt:
      "Generate a perfect SVG icon (256x256, viewBox='0 0 256 256'). Design: White envelope (#FFFFFF) on light blue gradient background (top #A9D0F5 to bottom #5B9FD1). Simple closed envelope. Soft drop shadow. Return ONLY the raw SVG code, no markdown or explanation.",
  },
  {
    id: "browser",
    prompt:
      "Generate a perfect SVG icon (256x256, viewBox='0 0 256 256'). Design: Compass icon in white/light colors on green gradient background. Navigation/browser theme. Clean, modern, flat design. Return ONLY the raw SVG code, no markdown or explanation.",
  },
  {
    id: "qrcode",
    prompt:
      "Generate a perfect SVG icon (256x256, viewBox='0 0 256 256'). Design: QR code pattern in white/pearl on dark gradient background (charcoal to near-black). QR corner squares visible. Return ONLY the raw SVG code, no markdown or explanation.",
  },
  {
    id: "games",
    prompt:
      "Generate a perfect SVG icon (256x256, viewBox='0 0 256 256'). Design: Gamepad/controller icon in white on purple-to-blue gradient background. Gaming theme. Simple, clean, flat design. Return ONLY the raw SVG code, no markdown or explanation.",
  },
  {
    id: "utilities",
    prompt:
      "Generate a perfect SVG icon (256x256, viewBox='0 0 256 256'). Design: Crossed tools (wrench and screwdriver) in gray (#94A3B8) on white background. Utilities/tools theme. ~80% canvas size. Clean, flat design. Return ONLY the raw SVG code, no markdown or explanation.",
  },
  {
    id: "dino",
    prompt:
      "Generate a perfect SVG icon (256x256, viewBox='0 0 256 256'). Design: T-rex dinosaur silhouette in white/pearl on green gradient background. Simple, playful, flat design. Game theme. Return ONLY the raw SVG code, no markdown or explanation.",
  },
  {
    id: "minesweeper",
    prompt:
      "Generate a perfect SVG icon (256x256, viewBox='0 0 256 256'). Design: Spiked mine ball icon in white/pearl on gray gradient background. Game theme. Simple, flat design with subtle depth. Return ONLY the raw SVG code, no markdown or explanation.",
  },
  {
    id: "trash",
    prompt:
      "Generate a perfect SVG icon (256x256, viewBox='0 0 256 256'). Design: Wastebasket/trash can icon in pearl white on semi-transparent glass effect background with gradient. Frosted glass aesthetic. Liquid glass material. Return ONLY the raw SVG code, no markdown or explanation.",
  },
];

async function generateIcon(client, icon) {
  try {
    process.stdout.write(`Generating ${icon.id}... `);

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: icon.prompt,
        },
      ],
    });

    const svgCode = response.content[0].type === 'text' ? response.content[0].text : '';

    if (!svgCode.includes('<svg')) {
      console.error(`FAIL - No SVG generated for ${icon.id}`);
      return false;
    }

    // Clean up markdown code blocks if present
    const cleanSvg = svgCode
      .replace(/```svg\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const outputPath = path.join(OUT_DIR, `${icon.id}.svg`);
    await writeFile(outputPath, cleanSvg, 'utf-8');

    console.log(`✓ ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`✗ ${error.message}`);
    return false;
  }
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('Error: ANTHROPIC_API_KEY environment variable not set');
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  // Parse CLI args
  const onlyArg = process.argv.indexOf('--only');
  const iconsToGenerate =
    onlyArg >= 0 && process.argv[onlyArg + 1]
      ? ICONS.filter((icon) => icon.id === process.argv[onlyArg + 1])
      : ICONS;

  if (onlyArg >= 0 && iconsToGenerate.length === 0) {
    console.error(`Error: icon "${process.argv[onlyArg + 1]}" not found`);
    process.exit(1);
  }

  // Create output directory
  try {
    await mkdir(OUT_DIR, { recursive: true });
  } catch (error) {
    console.error(`Error creating output directory: ${error.message}`);
    process.exit(1);
  }

  console.log(`◇ Generating ${iconsToGenerate.length} icon(s)...\n`);

  let successCount = 0;
  for (const icon of iconsToGenerate) {
    const success = await generateIcon(client, icon);
    if (success) successCount++;
  }

  console.log(`\n✓ Generated ${successCount}/${iconsToGenerate.length} icons`);
  process.exit(successCount === iconsToGenerate.length ? 0 : 1);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
