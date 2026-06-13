import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let q = searchParams.get('q') || '';

  if (!q) {
    return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 });
  }

  // Bersihkan kata "makanan" yang sebelumnya ditambahkan agar prompt lebih fokus
  q = q.replace(/ makanan$/i, '');

  // Menggunakan AI Generative (Pollinations.ai) untuk menghasilkan gambar makanan yang sangat akurat dan profesional
  const prompt = encodeURIComponent(`Delicious plate of ${q}, professional food photography, 4k resolution, highly detailed, appetizing, restaurant style`);
  
  const images = [
    `https://pollinations.ai/p/${prompt}?seed=${Math.floor(Math.random() * 1000)}&width=600&height=600`,
    `https://pollinations.ai/p/${prompt}?seed=${Math.floor(Math.random() * 1000)}&width=600&height=600`,
    `https://pollinations.ai/p/${prompt}?seed=${Math.floor(Math.random() * 1000)}&width=600&height=600`,
    `https://pollinations.ai/p/${prompt}?seed=${Math.floor(Math.random() * 1000)}&width=600&height=600`,
    `https://pollinations.ai/p/${prompt}?seed=${Math.floor(Math.random() * 1000)}&width=600&height=600`,
  ];

  return NextResponse.json({ images });
}
