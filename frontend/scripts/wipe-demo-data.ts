import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function wipeDemoData() {
  console.log('🧹 Wiping all demo products, dealer stocks, orders, and requests from Neon DB...');

  // Delete dependent child records first
  await prisma.wishlist.deleteMany();
  await prisma.order.deleteMany();
  await prisma.sellRequestBid.deleteMany();
  await prisma.sellRequest.deleteMany();
  await prisma.dealerMarketBid.deleteMany();
  await prisma.dealerMarketItem.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.stockRequest.deleteMany();

  // Delete all dealer stocks & products
  const deletedStocks = await prisma.dealerStock.deleteMany();
  const deletedProducts = await prisma.product.deleteMany();

  console.log(`✅ Cleared ${deletedStocks.count} DealerStock items.`);
  console.log(`✅ Cleared ${deletedProducts.count} Product items.`);

  console.log('🎉 Database is now 100% clean of demo products! Ready for real product entry.');
}

wipeDemoData().catch(console.error).finally(() => process.exit(0));
