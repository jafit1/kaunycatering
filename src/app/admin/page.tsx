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
      <div style={{ maxWidth: '400px', margin: '100px auto', padding: '24px', background: 'white', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Login Admin</h2>
        <form action="/api/login" method="POST">
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-input" placeholder="Masukkan password" required />
          </div>
          <button type="submit" className="btn" style={{ width: '100%' }}>Login</button>
        </form>
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
    <div style={{ margin: '-16px -16px 0', minHeight: '100vh' }}>
      <AdminDashboard products={products} categories={categories} settings={settings} />
    </div>
  )
}
