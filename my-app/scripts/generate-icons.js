// Script to generate PNG icons from SVG
// Run with: node scripts/generate-icons.js
// Requires: npm install sharp (or use online converter)

const fs = require('fs');
const path = require('path');

// For now, create a simple instruction file
// The SVG can be converted to PNG using:
// 1. Online tool: https://convertio.co/svg-png/
// 2. Or install sharp: npm install sharp
// 3. Then run this script

const svgPath = path.join(__dirname, '../public/fly-icon.svg');
const outputDir = path.join(__dirname, '../public');

console.log('To generate PNG icons:');
console.log('1. Open fly-icon.svg in a browser or image editor');
console.log('2. Export as PNG at these sizes:');
console.log('   - fly-icon.png: 512x512px');
console.log('   - apple-touch-icon.png: 180x180px');
console.log('3. Place them in the public/ directory');
console.log('');
console.log('Or use an online SVG to PNG converter:');
console.log('https://convertio.co/svg-png/');
console.log('https://cloudconvert.com/svg-to-png');

