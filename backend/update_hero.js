const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const slide = await prisma.heroSlide.findFirst({
    where: { title: 'Galaxy S24 Ultra' }
  });

  if (slide) {
    await prisma.heroSlide.update({
      where: { id: slide.id },
      data: {
        subtitle: 'Titanyum zırh, devasa batarya ve devrim niteliğindeki Galaxy AI ile geleceği avuçlarınızın içine alın.',
        btnLeftText: 'Titanyum Gücünü Keşfet',
        textAlignment: 'center',
        overlayOpacity: 50
      }
    });
    console.log('Slide updated successfully!');
  } else {
    console.log('Slide not found.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
