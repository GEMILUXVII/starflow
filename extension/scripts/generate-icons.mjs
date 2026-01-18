import { readFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Dynamic import sharp from the pnpm store
const sharp = (await import('file:///D:/codeplay/githubstar/starflow/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/lib/index.js')).default;

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, '..', 'public');

// Read the SVG and inline the CSS variables
const svgContent = readFileSync(join(publicDir, 'favicon.svg'), 'utf-8')
  .replace(/var\(--sf-accent\)/g, '#0f766e')
  .replace(/var\(--sf-paper\)/g, '#f8fafc');

const sizes = [16, 32, 48, 96, 128];
const outputDir = join(rootDir, 'public', 'icon');

// Ensure output directory exists
mkdirSync(outputDir, { recursive: true });

for (const size of sizes) {
  await sharp(Buffer.from(svgContent))
    .resize(size, size)
    .png()
    .toFile(join(outputDir, `${size}.png`));

  console.log(`Generated ${size}x${size} icon`);
}

console.log('All icons generated successfully!');
