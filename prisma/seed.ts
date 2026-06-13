import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.setting.upsert({
    where: { key: 'wa_number' },
    update: {},
    create: {
      key: 'wa_number',
      value: '6282324793627',
    },
  })

  await prisma.setting.upsert({
    where: { key: 'admin_password' },
    update: {},
    create: {
      key: 'admin_password',
      value: 'admin123', // Default password
    },
  })

  await prisma.setting.upsert({
    where: { key: 'store_name' },
    update: {},
    create: {
      key: 'store_name',
      value: 'Kauny Catering',
    },
  })

  const defaultCategories = ['Snack', 'Paket Snack', 'Nasi Box', 'Cemilan', 'Roti']
  
  for (let i = 0; i < defaultCategories.length; i++) {
    const categoryName = defaultCategories[i]
    const existing = await prisma.category.findFirst({ where: { name: categoryName } })
    if (!existing) {
      await prisma.category.create({
        data: {
          name: categoryName,
          order: i,
        }
      })
    }
  }

  console.log('Database seeded successfully')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
