"use server"

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function addProduct(formData: FormData) {
  const name = formData.get('name') as string
  const price = parseInt(formData.get('price') as string) || 0
  const imageUrl = formData.get('imageUrl') as string || ''
  const categoryId = formData.get('categoryId') as string

  await prisma.product.create({
    data: { name, price, imageUrl, categoryId }
  })

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
