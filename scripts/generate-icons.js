// Simple script to generate placeholder PWA icons
// Run with: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

// Create a simple 192x192 PNG (minimal valid PNG)
function createPNG(size, filename) {
  // This is a minimal valid PNG - 1x1 pixel, but we'll create a proper one
  // For now, we'll create a simple colored square PNG using base64
  // Note: This creates a very basic icon. Replace with proper design later.
  
  const canvas = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.15}"/>
      <text x="${size/2}" y="${size/2 + size/8}" font-family="Arial, sans-serif" font-size="${size/3}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">சொல்</text>
    </svg>
  `;
  
  // Save as SVG for now (browsers can use SVG icons)
  const svgPath = path.join(__dirname, '..', 'public', filename.replace('.png', '.svg'));
  fs.writeFileSync(svgPath, canvas);
  console.log(`Created ${filename.replace('.png', '.svg')}`);
}

// Create icons
console.log('Generating PWA icons...');
createPNG(192, 'icon-192.png');
createPNG(512, 'icon-512.png');

console.log('\nNote: SVG icons created. For best PWA support, convert these to PNG:');
console.log('You can use online tools like:');
console.log('  - https://cloudconvert.com/svg-to-png');
console.log('  - https://realfavicongenerator.net/');
console.log('  - Or design tools like Figma, Canva');
