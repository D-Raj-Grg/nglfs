#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public');

console.log('🎨 NGLFS Favicon Generator');
console.log('==========================\n');

// Read the SVG file
const svgPath = join(publicDir, 'favicon.svg');
const svgBuffer = readFileSync(svgPath);

console.log('📁 Working directory:', publicDir);
console.log('📄 Source file: favicon.svg\n');

// Sizes to generate
const sizes = [
  { name: 'favicon-16x16.png', size: 16, desc: '16x16 favicon' },
  { name: 'favicon-32x32.png', size: 32, desc: '32x32 favicon' },
  { name: 'apple-touch-icon.png', size: 180, desc: 'Apple touch icon' },
  { name: 'icon-192.png', size: 192, desc: 'PWA icon 192' },
  { name: 'icon-512.png', size: 512, desc: 'PWA icon 512' },
];

async function generatePNGs() {
  for (const { name, size, desc } of sizes) {
    try {
      console.log(`  Generating ${name}...`);

      // Use resvg to render SVG to PNG with proper transparency
      const resvg = new Resvg(svgBuffer, {
        fitTo: {
          mode: 'width',
          value: size,
        },
      });

      const pngData = resvg.render();
      const pngBuffer = pngData.asPng();

      // Use sharp for final processing and optimization
      await sharp(pngBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png({ compressionLevel: 9, quality: 100 })
        .toFile(join(publicDir, name));

      console.log(`    ✅ ${desc}`);
    } catch (error) {
      console.error(`    ❌ Error generating ${name}:`, error.message);
    }
  }
}

async function generateICO() {
  try {
    console.log('\n  Generating favicon.ico...');

    // Generate 32x32 version for ICO (most common size)
    const resvg = new Resvg(svgBuffer, {
      fitTo: {
        mode: 'width',
        value: 32,
      },
    });

    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    const icoBuffer = await sharp(pngBuffer)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    // Write as .ico (modern browsers support PNG inside ICO)
    writeFileSync(join(publicDir, 'favicon.ico'), icoBuffer);
    console.log('    ✅ Multi-resolution favicon.ico');
  } catch (error) {
    console.error('    ❌ Error generating favicon.ico:', error.message);
  }
}

async function main() {
  try {
    await generatePNGs();
    await generateICO();

    console.log('\n✅ Success! Generated files:\n');

    const files = [
      'favicon-16x16.png',
      'favicon-32x32.png',
      'apple-touch-icon.png',
      'icon-192.png',
      'icon-512.png',
      'favicon.ico',
    ];

    files.forEach(file => {
      try {
        const stats = readFileSync(join(publicDir, file));
        const sizeKB = (stats.length / 1024).toFixed(2);
        console.log(`   ${file} (${sizeKB} KB)`);
      } catch (e) {
        console.log(`   ${file} - Not found`);
      }
    });

    console.log('\n📝 Next steps:');
    console.log('   1. Create OG image (1200x630) at public/og-image.png');
    console.log('   2. Test favicons: http://localhost:3000');
    console.log('   3. Check logo demo: http://localhost:3000/logo-demo');
    console.log('\n🎉 Done!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
