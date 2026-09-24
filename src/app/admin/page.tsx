import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import AdminDashboard from './AdminDashboard'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')

  const adminPasswordSetting = await prisma.setting.findUnique({ where: { key: 'admin_password' } })
  const adminPassword = adminPasswordSetting?.value || 'admin123'

  // Very simple auth check
  if (token?.value !== adminPassword) {
    return (
      <div className="min-h-screen grid place-items-center px-4 py-12 hero-glow relative overflow-hidden">
        <div className="absolute inset-0 hero-dots" />
        <div className="relative w-full max-w-sm rounded-[28px] bg-white p-7 sm:p-8 shadow-pop animate-fade-up">
          <span className="grid place-items-center h-12 w-12 rounded-2xl bg-brand-800 text-accent mb-5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          </span>
          <h2 className="text-2xl font-extrabold text-ink tracking-tight">Login Admin</h2>
          <p className="text-sm text-ink-faded mt-1 mb-6">Masuk untuk mengelola menu dan pengaturan toko.</p>
          <form action="/api/login" method="POST">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" name="password" className="form-input" placeholder="Masukkan password" required />
            </div>
            <button type="submit" className="btn w-full h-12 mt-2">Masuk</button>
          </form>
        </div>
      </div>
    )
  }

  const products = await prisma.product.findMany({ 
    include: { categories: true, variants: true },
    orderBy: { name: 'asc' } 
  })
  const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } })
  const settings = await prisma.setting.findMany()

  return (
    <div className="min-h-screen">
      <AdminDashboard products={products} categories={categories} settings={settings} />
    </div>
  )
}
