import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 });
  }

  // Mengambil API Key dari akun Google Anda (diatur di Vercel Environment Variables)
  const apiKey = process.env.GOOGLE_API_KEY?.trim();
  const searchEngineId = process.env.GOOGLE_CX?.trim();

  if (!apiKey || !searchEngineId) {
    return NextResponse.json({ 
      error: 'API Key Google belum diatur.', 
      details: 'Silakan tambahkan GOOGLE_API_KEY dan GOOGLE_CX di pengaturan Environment Variables Vercel Anda.' 
    }, { status: 500 });
  }

  try {
    // Menggunakan Google Custom Search API yang 100% akurat (Pencarian Gambar Google Asli)
    const res = await fetch(`https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(q)}&searchType=image&num=10`);
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error?.message || 'Gagal mengambil gambar dari Google API');
    }

    const data = await res.json();
    const images: string[] = [];
    
    if (data.items && data.items.length > 0) {
      for (const item of data.items) {
        if (item.link) {
          images.push(item.link);
        }
      }
    }

    return NextResponse.json({ images });
  } catch (error: any) {
    console.error('Image search error:', error);
    return NextResponse.json({ error: 'Gagal mencari gambar', details: error.message }, { status: 500 });
  }
}
