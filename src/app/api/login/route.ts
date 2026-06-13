import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const formData = await request.formData()
  const password = formData.get('password')

  if (password) {
    const cookieStore = await cookies()
    cookieStore.set('admin_token', password.toString(), { httpOnly: true, path: '/' })
  }

  return NextResponse.redirect(new URL('/admin', request.url))
}
