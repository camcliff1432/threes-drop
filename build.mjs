/**
 * Build script for Threes-Drop
 *
 * Parses index.html to find all local <script src="js/..."> tags,
 * concatenates them into bundle.js, and generates index.prod.html.
 *
 * Usage:
 *   node build.mjs           - concatenate only (bundle.js)
 *   node build.mjs --minify  - concatenate + minify (bundle.min.js, requires esbuild)
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const shouldMinify = process.argv.includes('--minify');

// Read index.html
const indexPath = resolve(__dirname, 'index.html');
const html = readFileSync(indexPath, 'utf-8');

// Extract local script src paths (js/...) in order
const scriptRegex = /<script\s+src="(js\/[^"]+)">\s*<\/script>/g;
const scripts = [];
let match;
while ((match = scriptRegex.exec(html)) !== null) {
  scripts.push(match[1]);
}

console.log(`Found ${scripts.length} local scripts to bundle:`);
scripts.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));

// Concatenate all scripts
let bundle = '';
for (const script of scripts) {
  const filePath = resolve(__dirname, script);
  const content = readFileSync(filePath, 'utf-8');
  bundle += `// === ${script} ===\n${content}\n\n`;
}

// Write bundle.js
const bundlePath = resolve(__dirname, 'bundle.js');
writeFileSync(bundlePath, bundle, 'utf-8');
console.log(`\nWritten bundle.js (${(bundle.length / 1024).toFixed(1)} KB)`);

// Optionally minify
let bundleFileName = 'bundle.js';
if (shouldMinify) {
  try {
    const { transformSync } = await import('esbuild');
    const result = transformSync(bundle, { minify: true });
    const minPath = resolve(__dirname, 'bundle.min.js');
    writeFileSync(minPath, result.code, 'utf-8');
    bundleFileName = 'bundle.min.js';
    console.log(`Written bundle.min.js (${(result.code.length / 1024).toFixed(1)} KB)`);
  } catch (e) {
    console.warn('\nesbuild not found. Install it to enable minification:');
    console.warn('  npm install --save-dev esbuild');
    console.warn('\nFalling back to unminified bundle.js');
  }
}

// Generate index.prod.html
// Replace all local script tags with single bundle reference
let prodHtml = html;

// Remove all individual local script tags
const allLocalScripts = /<\s*script\s+src="js\/[^"]+"\s*>\s*<\/script>\s*\n?/g;
prodHtml = prodHtml.replace(allLocalScripts, '');

// Insert bundle script before the service worker registration or closing body tag
const insertPoint = prodHtml.indexOf('<!-- Service Worker');
if (insertPoint !== -1) {
  prodHtml = prodHtml.slice(0, insertPoint) +
    `<script src="${bundleFileName}"></script>\n\n  ` +
    prodHtml.slice(insertPoint);
} else {
  prodHtml = prodHtml.replace('</body>', `  <script src="${bundleFileName}"></script>\n</body>`);
}

const prodPath = resolve(__dirname, 'index.prod.html');
writeFileSync(prodPath, prodHtml, 'utf-8');
console.log(`Written index.prod.html`);
console.log('\nDone!');
