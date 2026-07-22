const fs = require('fs');
const content = fs.readFileSync('prisma/seed.ts', 'utf8');
const replaced = content.replace(
  /title: 'Galaxy S24 Ultra',\s*subtitle: 'Galaxy AI ile desteklenen en güçlü Samsung deneyimi.',\s*btnLeftText: 'Samsung Keşfet',/g,
  `title: 'Galaxy S24 Ultra',
        subtitle: 'Titanyum zırh, devasa batarya ve devrim niteliğindeki Galaxy AI ile geleceği avuçlarınızın içine alın.',
        btnLeftText: 'Titanyum Gücünü Keşfet',`
);
fs.writeFileSync('prisma/seed.ts', replaced, 'utf8');
console.log('Seed updated!');
