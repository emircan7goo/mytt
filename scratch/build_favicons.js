const path = require('path');
const sharp = require(path.join(__dirname, '../frontend/node_modules/sharp'));
const fs = require('fs');

const svgBuffer = fs.readFileSync(path.join(__dirname, '../frontend/public/favicon.svg'));

async function buildIcons() {
  console.log('Rendering high-res favicons with sharp...');

  // 1. 32x32 PNG
  const png32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(__dirname, '../frontend/public/favicon.png'), png32);
  fs.writeFileSync(path.join(__dirname, '../frontend/public/favicon.ico'), png32);
  fs.writeFileSync(path.join(__dirname, '../frontend/app/favicon.ico'), png32);

  // 2. 180x180 Apple Touch Icon
  const png180 = await sharp(svgBuffer).resize(180, 180).png().toBuffer();
  fs.writeFileSync(path.join(__dirname, '../frontend/public/apple-icon.png'), png180);

  // 3. 192x192 & 512x512 PWA Icons
  const png192 = await sharp(svgBuffer).resize(192, 192).png().toBuffer();
  fs.writeFileSync(path.join(__dirname, '../frontend/public/icon-192.png'), png192);

  const png512 = await sharp(svgBuffer).resize(512, 512).png().toBuffer();
  fs.writeFileSync(path.join(__dirname, '../frontend/public/icon-512.png'), png512);

  console.log('✅ All favicons successfully rendered!');
}

buildIcons().catch(console.error);
