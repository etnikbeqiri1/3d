#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Use the converter from ttf-to-json
const { convert } = require('/opt/homebrew/lib/node_modules/ttf-to-json/converter');

const FONTS_JSON = '/tmp/google-fonts.json';
const OUTPUT_DIR = path.join(__dirname, '../public/fonts');
const TEMP_DIR = '/tmp/font-downloads';

// Create directories
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

// Download file helper
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// Sanitize font name for filename
function sanitizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
}

// Convert TTF to JSON
function convertFont(ttfPath, jsonPath) {
  return new Promise((resolve, reject) => {
    fs.readFile(ttfPath, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      try {
        const json = convert(data.buffer);
        fs.writeFile(jsonPath, json, (error) => {
          if (error) reject(error);
          else resolve();
        });
      } catch (e) {
        reject(e);
      }
    });
  });
}

async function main() {
  // Read fonts JSON
  const fontsData = JSON.parse(fs.readFileSync(FONTS_JSON, 'utf8'));
  const fonts = fontsData.items;

  console.log(`Found ${fonts.length} fonts to process`);

  const fontConfigs = [];
  let processed = 0;
  let failed = 0;
  let skipped = 0;

  for (const font of fonts) {
    const family = font.family;
    const category = font.category;
    const safeName = sanitizeName(family);

    // Get regular variant URL (prefer 'regular', fallback to first available)
    let ttfUrl = font.files?.regular || font.files?.['400'] || Object.values(font.files || {})[0];

    if (!ttfUrl) {
      console.log(`⚠ No TTF URL for ${family}, skipping`);
      failed++;
      continue;
    }

    // Fix http to https
    ttfUrl = ttfUrl.replace('http://', 'https://');

    const ttfPath = path.join(TEMP_DIR, `${safeName}.ttf`);
    const jsonPath = path.join(OUTPUT_DIR, `${safeName}.typeface.json`);

    // Skip if already converted
    if (fs.existsSync(jsonPath)) {
      fontConfigs.push({
        name: safeName,
        displayName: family,
        path: `/fonts/${safeName}.typeface.json`,
        category: category === 'handwriting' ? 'script' : category,
      });
      skipped++;
      continue;
    }

    try {
      // Download TTF
      process.stdout.write(`[${processed + failed + skipped + 1}/${fonts.length}] ${family}... `);
      await downloadFile(ttfUrl, ttfPath);

      // Convert to JSON
      await convertFont(ttfPath, jsonPath);

      // Add to configs
      fontConfigs.push({
        name: safeName,
        displayName: family,
        path: `/fonts/${safeName}.typeface.json`,
        category: category === 'handwriting' ? 'script' : category,
      });

      processed++;
      console.log('✓');

      // Clean up TTF
      fs.unlinkSync(ttfPath);

    } catch (err) {
      console.log(`✗ ${err.message}`);
      failed++;
      // Clean up on error
      if (fs.existsSync(ttfPath)) fs.unlinkSync(ttfPath);
      if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath);
    }
  }

  // Generate fonts.ts
  const fontsTs = `export interface FontConfig {
  name: string;
  displayName: string;
  path: string;
  category: 'sans-serif' | 'serif' | 'script' | 'display' | 'monospace';
}

export const FONTS: FontConfig[] = ${JSON.stringify(fontConfigs, null, 2)};

export const getFontByName = (name: string): FontConfig | undefined => {
  return FONTS.find((f) => f.name === name);
};
`;

  fs.writeFileSync(path.join(__dirname, '../lib/fonts.ts'), fontsTs);

  console.log(`\n========================================`);
  console.log(`✓ Converted: ${processed} fonts`);
  console.log(`⊘ Skipped (existing): ${skipped} fonts`);
  console.log(`✗ Failed: ${failed} fonts`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
  console.log(`📝 Config: lib/fonts.ts updated with ${fontConfigs.length} fonts`);
}

main().catch(console.error);
