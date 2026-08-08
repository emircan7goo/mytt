const path = require('path');
const sharp = require(path.join(__dirname, '../frontend/node_modules/sharp'));
const fs = require('fs');

const svgBuffer = fs.readFileSync(path.join(__dirname, '../frontend/public/favicon.svg'));

async function buildIcons() {
  console.log('Rendering high-res favicons with sharp...');

  // 1. 32x32, 48x48, 96x96 PNGs (Google Search Favicon Standards)
  const png32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  const png48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();
  const png96 = await sharp(svgBuffer).resize(96, 96).png().toBuffer();

  fs.writeFileSync(path.join(__dirname, '../frontend/public/favicon.png'), png32);
  fs.writeFileSync(path.join(__dirname, '../frontend/public/favicon-48x48.png'), png48);
  fs.writeFileSync(path.join(__dirname, '../frontend/public/favicon-96x96.png'), png96);
  fs.writeFileSync(path.join(__dirname, '../frontend/public/favicon.ico'), png48);
  fs.writeFileSync(path.join(__dirname, '../frontend/app/favicon.ico'), png48);

  // 2. 180x180 Apple Touch Icon
  const png180 = await sharp(svgBuffer).resize(180, 180).png().toBuffer();
  fs.writeFileSync(path.join(__dirname, '../frontend/public/apple-icon.png'), png180);

  // 3. 192x192 & 512x512 PWA & Google Knowledge Graph Icons
  const png192 = await sharp(svgBuffer).resize(192, 192).png().toBuffer();
  fs.writeFileSync(path.join(__dirname, '../frontend/public/icon-192.png'), png192);

  const png512 = await sharp(svgBuffer).resize(512, 512).png().toBuffer();
  fs.writeFileSync(path.join(__dirname, '../frontend/public/icon-512.png'), png512);

  console.log('✅ All 48x48, 96x96, 192x192, 512x512 favicons successfully rendered!');
}

buildIcons().catch(console.error);
