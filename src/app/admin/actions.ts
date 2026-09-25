"use server"

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function addProduct(formData: FormData) {
  const name = formData.get('name') as string
  const price = parseInt(formData.get('price') as string) || 0
  const imageUrl = formData.get('imageUrl') as string || ''
  const categoryIds = formData.getAll('categories') as string[]
  
  const hasVariants = formData.get('hasVariants') === 'true'
  const variantType = formData.get('variantType') as string || null
  const variantsJson = formData.get('variants') as string
  const variants = variantsJson ? JSON.parse(variantsJson) : []

  await prisma.product.create({
    data: { 
      name, 
      price, 
      imageUrl,
      hasVariants,
      variantType,
      categories: {
        connect: categoryIds.map(id => ({ id }))
      },
      variants: {
        create: variants.map((v: any) => ({ name: v.name, price: parseInt(v.price) || 0 }))
      }
    }
  })

  revalidatePath('/admin')
  revalidatePath('/')
}

export async function updateProduct(formData: FormData) {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const price = parseInt(formData.get('price') as string) || 0
  const imageUrl = formData.get('imageUrl') as string || ''
  const categoryIds = formData.getAll('categories') as string[]
  
  const hasVariants = formData.get('hasVariants') === 'true'
  const variantType = formData.get('variantType') as string || null
  const variantsJson = formData.get('variants') as string
  const variants = variantsJson ? JSON.parse(variantsJson) : []

  await prisma.product.update({
    where: { id },
    data: { 
      name, 
      price, 
      imageUrl,
      hasVariants,
      variantType,
      categories: {
        set: categoryIds.map(catId => ({ id: catId }))
      }
    }
  })

  await prisma.variant.deleteMany({ where: { productId: id } })
  if (hasVariants && variants.length > 0) {
    await prisma.variant.createMany({
      data: variants.map((v: any) => ({
        name: v.name,
        price: parseInt(v.price) || 0,
        productId: id
      }))
    })
  }

  revalidatePath('/admin')
  revalidatePath('/')
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } })
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function addCategory(formData: FormData) {
  const name = formData.get('name') as string
  await prisma.category.create({ data: { name, order: 99 } })
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } })
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function updateSetting(key: string, value: string) {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  })
  revalidatePath('/admin')
  revalidatePath('/')
}

/** Simpan banyak pengaturan sekaligus (dipakai tab Pengaturan Web) */
export async function updateSettings(entries: { key: string; value: string }[]) {
  await prisma.$transaction(
    entries.map(({ key, value }) =>
      prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )
  )
  revalidatePath('/admin')
  revalidatePath('/', 'layout')
}
