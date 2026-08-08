const fs = require('fs');
const path = require('path');

const bannersDir = 'c:/Users/emirc/Desktop/telefoncum/telefoncum/telefoncum/frontend/public/banners';

function makeSVG(accentColor, secondaryColor, type) {
  let illustration = '';
  
  if (type === 'store') {
    // 3D Tatlı Esnaf & Mağaza İllüstrasyonu (Yazısız)
    illustration = `
      <g transform="translate(720, 140)">
        <!-- Soft Glow Base -->
        <ellipse cx="240" cy="400" rx="220" ry="40" fill="${accentColor}" opacity="0.15" filter="blur(20px)"/>
        
        <!-- 3D Phone Body -->
        <rect x="140" y="80" width="200" height="360" rx="36" fill="#1E293B" stroke="${accentColor}" stroke-width="6"/>
        <rect x="155" y="100" width="170" height="320" rx="24" fill="#0F172A"/>
        
        <!-- Screen Elements (No text) -->
        <rect x="175" y="140" width="130" height="60" rx="16" fill="${accentColor}" opacity="0.8"/>
        <rect x="175" y="220" width="130" height="20" rx="8" fill="#334155"/>
        <rect x="175" y="250" width="90" height="20" rx="8" fill="#334155"/>

        <!-- Floating Cute Store Badge -->
        <g transform="translate(40, 160)">
          <circle cx="60" cy="60" r="55" fill="${accentColor}"/>
          <path d="M35 75 L45 45 L75 45 L85 75 Z M40 75 V100 H80 V75 Z" fill="#FFFFFF"/>
        </g>

        <!-- Floating Star Ratings -->
        <circle cx="340" cy="120" r="28" fill="#F59E0B"/>
        <path d="M340 106 L344 116 L355 117 L347 124 L349 135 L340 129 L331 135 L333 124 L325 117 L336 116 Z" fill="#FFFFFF"/>
      </g>
    `;
  } else if (type === 'shield') {
    // 100% Orijinal & Güvence İllüstrasyonu (Yazısız)
    illustration = `
      <g transform="translate(720, 140)">
        <ellipse cx="240" cy="400" rx="220" ry="40" fill="#10B981" opacity="0.15" filter="blur(20px)"/>

        <!-- 3D Phone with Green Shield -->
        <rect x="140" y="80" width="200" height="360" rx="36" fill="#1E293B" stroke="#10B981" stroke-width="6"/>
        <rect x="155" y="100" width="170" height="320" rx="24" fill="#0F172A"/>

        <!-- Big Cute Emerald Shield -->
        <g transform="translate(140, 120)">
          <path d="M100 20 L180 50 V130 C180 190 140 230 100 250 C60 230 20 190 20 130 V50 Z" fill="#10B981"/>
          <path d="M70 130 L90 150 L135 95" fill="none" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      </g>
    `;
  } else if (type === 'auction') {
    // Canlı İhale & Ağ İllüstrasyonu (Yazısız)
    illustration = `
      <g transform="translate(720, 140)">
        <ellipse cx="240" cy="400" rx="220" ry="40" fill="${accentColor}" opacity="0.15" filter="blur(20px)"/>

        <!-- Network Pulse Circles -->
        <circle cx="240" cy="240" r="180" fill="none" stroke="${accentColor}" stroke-width="2" opacity="0.3" stroke-dasharray="8,8"/>
        <circle cx="240" cy="240" r="120" fill="none" stroke="${accentColor}" stroke-width="3" opacity="0.5"/>

        <!-- Center Phone -->
        <rect x="175" y="140" width="130" height="230" rx="28" fill="#1E293B" stroke="${accentColor}" stroke-width="5"/>
        <rect x="185" y="155" width="110" height="200" rx="18" fill="#0F172A"/>

        <!-- Floating Bidding Nodes -->
        <circle cx="90" cy="140" r="32" fill="${accentColor}"/>
        <path d="M90 125 L98 145 H82 Z" fill="#FFFFFF"/>

        <circle cx="390" cy="180" r="32" fill="${accentColor}"/>
        <path d="M390 165 L398 185 H382 Z" fill="#FFFFFF"/>

        <circle cx="340" cy="340" r="28" fill="#3B82F6"/>
      </g>
    `;
  } else if (type === 'card') {
    // 12 Taksit Kredi Kartı İllüstrasyonu (Yazısız)
    illustration = `
      <g transform="translate(700, 150)">
        <ellipse cx="260" cy="380" rx="220" ry="40" fill="${accentColor}" opacity="0.15" filter="blur(20px)"/>

        <!-- 3D Matte Black & Neon Orange Credit Card -->
        <g transform="rotate(-8 260 200)">
          <rect x="60" y="80" width="380" height="230" rx="28" fill="#1E293B" stroke="${accentColor}" stroke-width="6"/>
          <line x1="60" y1="140" x2="440" y2="140" stroke="${accentColor}" stroke-width="20"/>
          <rect x="100" y="190" width="80" height="50" rx="12" fill="#F59E0B"/>
          <circle cx="360" cy="240" r="24" fill="${accentColor}" opacity="0.8"/>
          <circle cx="390" cy="240" r="24" fill="#EF4444" opacity="0.8"/>
        </g>
      </g>
    `;
  } else if (type === 'escrow') {
    // %100 Escrow Kasası & Kilit İllüstrasyonu (Yazısız)
    illustration = `
      <g transform="translate(720, 130)">
        <ellipse cx="240" cy="400" rx="220" ry="40" fill="${accentColor}" opacity="0.15" filter="blur(20px)"/>

        <!-- 3D Cute Lock Vault -->
        <g transform="translate(100, 60)">
          <rect x="40" y="140" width="200" height="180" rx="32" fill="#1E293B" stroke="${accentColor}" stroke-width="8"/>
          <path d="M80 140 V90 C80 50 105 20 140 20 C175 20 200 50 200 90 V140" fill="none" stroke="${accentColor}" stroke-width="16" stroke-linecap="round"/>
          <circle cx="140" cy="220" r="24" fill="${accentColor}"/>
          <rect x="133" y="220" width="14" height="40" fill="${accentColor}"/>
        </g>
      </g>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#090D16"/>
        <stop offset="50%" stop-color="#111625"/>
        <stop offset="100%" stop-color="#0B0F19"/>
      </linearGradient>
      <radialGradient id="ambientGlow" cx="75%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.22"/>
        <stop offset="100%" stop-color="${accentColor}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1280" height="720" fill="url(#bgGrad)"/>
    <rect width="1280" height="720" fill="url(#ambientGlow)"/>
    ${illustration}
  </svg>`;
}

fs.writeFileSync(path.join(bannersDir, 'clean_hero_1.svg'), makeSVG('#FF6000', '#EA580C', 'store'));
fs.writeFileSync(path.join(bannersDir, 'clean_hero_2.svg'), makeSVG('#10B981', '#059669', 'shield'));
fs.writeFileSync(path.join(bannersDir, 'clean_hero_3.svg'), makeSVG('#FF6000', '#D97706', 'auction'));
fs.writeFileSync(path.join(bannersDir, 'clean_hero_4.svg'), makeSVG('#FF6000', '#F59E0B', 'card'));
fs.writeFileSync(path.join(bannersDir, 'clean_hero_5.svg'), makeSVG('#FF6000', '#10B981', 'escrow'));

console.log('5 Clean, 100% Textless Cute SVG Banners generated successfully!');
