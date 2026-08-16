const sharp = require('sharp');
const svgBuffer = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#800000" rx="100" ry="100"/><text x="50%" y="50%" font-family="Arial, sans-serif" font-size="280" font-weight="bold" fill="#ffffff" text-anchor="middle" dy=".35em">A</text></svg>');

sharp(svgBuffer).resize(192, 192).png().toFile('public/icon-192x192.png').then(() => console.log('192 created'));
sharp(svgBuffer).resize(512, 512).png().toFile('public/icon-512x512.png').then(() => console.log('512 created'));
