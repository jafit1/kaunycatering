import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 });
  }

  try {
    // Disable TLS verification locally just in case, though Vercel environment usually handles it well
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    const res = await fetch(`https://www.bing.com/images/search?q=${encodeURIComponent(q)}&qft=+filterui:imagesize-large`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch from Bing: ${res.statusText}`);
    }

    const html = await res.text();
    const regex = /murl&quot;:&quot;(http[^&]+)&quot;/g;
    let match;
    const images: string[] = [];
    
    while ((match = regex.exec(html)) !== null) {
      if (!images.includes(match[1])) {
        // Only include standard image formats to avoid weird blobs or vectors
        if (match[1].match(/\.(jpeg|jpg|png|webp)/i)) {
          images.push(match[1]);
        }
      }
      if (images.length >= 5) break; // Limit to 5 options
    }

    // Fallback if the regex doesn't match the first format
    if (images.length === 0) {
      const fallbackRegex = /murl":"(http[^"]+)"/g;
      while ((match = fallbackRegex.exec(html)) !== null) {
        if (!images.includes(match[1]) && match[1].match(/\.(jpeg|jpg|png|webp)/i)) {
          images.push(match[1]);
        }
        if (images.length >= 5) break;
      }
    }

    return NextResponse.json({ images });
  } catch (error: any) {
    console.error('Image search error:', error);
    return NextResponse.json({ error: 'Failed to search images', details: error.message }, { status: 500 });
  }
}
