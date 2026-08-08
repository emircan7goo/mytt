const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (!full.includes('.next') && !full.includes('node_modules')) {
        searchDir(full);
      }
    } else if (f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.jsx') || f.endsWith('.js')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes('/sell') || content.includes('Cihazını') || content.includes('Cihaz Sat')) {
        console.log(`FOUND IN: ${full}`);
        const lines = content.split('\n');
        lines.forEach((l, idx) => {
          if (l.includes('/sell') || l.includes('Cihazı') || l.includes('Sat')) {
            if (l.toLowerCase().includes('cihaz') || l.includes('/sell')) {
              console.log(`  Line ${idx+1}: ${l.trim()}`);
            }
          }
        });
      }
    }
  }
}

searchDir('c:\\Users\\emirc\\Desktop\\telefoncum\\telefoncum\\telefoncum\\frontend');
