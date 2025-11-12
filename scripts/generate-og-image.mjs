#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public');

console.log('🎨 NGLFS OG Image Generator');
console.log('===========================\n');

async function generateOGImage() {
  const width = 1200;
  const height = 630;

  try {
    // Read the logo SVG
    const logoSvgPath = join(publicDir, 'logo-dark.svg');
    const logoSvgBuffer = readFileSync(logoSvgPath);

    // Render logo to PNG at appropriate size
    const resvg = new Resvg(logoSvgBuffer, {
      fitTo: {
        mode: 'width',
        value: 400, // Logo width on OG image
      },
    });

    const logoPngData = resvg.render();
    const logoPngBuffer = logoPngData.asPng();

    // Create a gradient background using SVG
    const backgroundSvg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0A0A0A;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#1A1A1A;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#0A0A0A;stop-opacity:1" />
          </linearGradient>

          <linearGradient id="accent-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:#EC4899;stop-opacity:0.3" />
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <!-- Background -->
        <rect width="${width}" height="${height}" fill="url(#bg-gradient)"/>

        <!-- Decorative circles with glassmorphism -->
        <circle cx="200" cy="150" r="150" fill="url(#accent-gradient)" opacity="0.2" filter="url(#glow)"/>
        <circle cx="1000" cy="480" r="180" fill="url(#accent-gradient)" opacity="0.15" filter="url(#glow)"/>

        <!-- Title -->
        <text x="600" y="220" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="700" text-anchor="middle" fill="url(#accent-gradient)" filter="url(#glow)">
          <tspan fill="#8B5CF6">NGL</tspan><tspan fill="#EC4899">FS</tspan>
        </text>

        <!-- Subtitle -->
        <text x="600" y="290" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="600" text-anchor="middle" fill="#E5E5E5">
          Anonymous Messaging Made Beautiful
        </text>

        <!-- Description -->
        <text x="600" y="360" font-family="system-ui, -apple-system, sans-serif" font-size="24" text-anchor="middle" fill="#A3A3A3">
          Create your profile. Share your link. Get honest feedback.
        </text>

        <!-- Bottom accent line -->
        <line x1="300" y1="480" x2="900" y2="480" stroke="url(#accent-gradient)" stroke-width="3" opacity="0.5"/>

        <!-- Privacy badge -->
        <rect x="480" y="510" width="240" height="60" rx="30" fill="#1A1A1A" stroke="url(#accent-gradient)" stroke-width="2" opacity="0.8"/>
        <text x="600" y="548" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600" text-anchor="middle" fill="#E5E5E5">
          🔒 Privacy First
        </text>
      </svg>
    `;

    console.log('  Creating OG image background...');

    // Render background SVG to PNG
    const bgResvg = new Resvg(Buffer.from(backgroundSvg), {
      fitTo: {
        mode: 'width',
        value: width,
      },
    });

    const bgPngData = bgResvg.render();
    const bgPngBuffer = bgPngData.asPng();

    console.log('  Compositing final image...');

    // Composite the logo onto the background
    const finalImage = await sharp(bgPngBuffer)
      .composite([
        {
          input: logoPngBuffer,
          top: 400,
          left: 400,
          blend: 'over',
        },
      ])
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(join(publicDir, 'og-image.png'));

    console.log('  ✅ Generated og-image.png');
    console.log(`     Size: ${(finalImage.size / 1024).toFixed(2)} KB`);
    console.log(`     Dimensions: ${finalImage.width}x${finalImage.height}`);

    console.log('\n✅ Success!');
    console.log('\n📝 Next steps:');
    console.log('   1. Test OG preview: https://www.opengraph.xyz/');
    console.log('   2. View in browser: http://localhost:3000');
    console.log('\n🎉 Done!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

generateOGImage();
