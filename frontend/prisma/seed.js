require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clear existing info if needed
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.variant.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()

  // 1. Create realistic admin / dealer / customer users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@reluxe.com',
      name: 'Re-Luxe Admin',
      role: 'ADMIN',
      avatar: 'https://i.pravatar.cc/150?u=admin',
    }
  })

  const dealer = await prisma.user.create({
    data: {
      email: 'dealer@reluxe.com',
      name: 'Ahmet Bayi',
      role: 'DEALER',
      avatar: 'https://i.pravatar.cc/150?u=dealer',
    }
  })

  const customer = await prisma.user.create({
    data: {
      email: 'customer@reluxe.com',
      name: 'Can Müşteri',
      role: 'CUSTOMER',
      avatar: 'https://i.pravatar.cc/150?u=customer',
    }
  })

  // 2. Create products with realistic images and models
  const iphone14Pro = await prisma.product.create({
    data: {
      brand: 'Apple',
      model: 'iPhone 14 Pro',
      cosmeticGrade: 'Kusursuz',
      isHot: true,
      image: '/images/products/iphone-14-pro.png', // Replace with external reliable PNG in PR
      variants: {
        create: [
          {
            storage: '128GB',
            color: 'Uzay Siyahı',
            price: 28990,
            originalPrice: 45000,
            inStock: 5,
          },
          {
            storage: '256GB',
            color: 'Derin Mor',
            price: 31990,
            originalPrice: 48000,
            inStock: 2,
          }
        ]
      }
    }
  })

  const s23Ultra = await prisma.product.create({
    data: {
      brand: 'Samsung',
      model: 'Galaxy S23 Ultra',
      cosmeticGrade: 'Mükemmel',
      isHot: true,
      image: '/images/products/s23-ultra.png',
      variants: {
        create: [
          {
            storage: '256GB',
            color: 'Krem',
            price: 24990,
            originalPrice: 38000,
            inStock: 8,
          },
          {
            storage: '512GB',
            color: 'Fantom Siyahı',
            price: 26990,
            originalPrice: 41000,
            inStock: 3,
          }
        ]
      }
    }
  })

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
