import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 });
  }

  try {
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(q)}&form=HDRSC2&first=1`;
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
        }
    });
    
    if (!response.ok) {
        throw new Error(`Failed to fetch from Bing: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    const images: string[] = [];
    
    // Bing image search usually stores full image data in an attribute called 'm' which is a JSON string
    $('a.iusc').each((i, el) => {
        if (images.length >= 10) return;
        const mData = $(el).attr('m');
        if (mData) {
            try {
                const parsed = JSON.parse(mData);
                if (parsed.murl) {
                    images.push(parsed.murl);
                }
            } catch (e) {
                // ignore parse error
            }
        }
    });
    
    if (images.length === 0) {
        return NextResponse.json({ 
            error: 'Tidak dapat menemukan gambar untuk produk tersebut.' 
        }, { status: 404 });
    }

    return NextResponse.json({ images });
  } catch (error: any) {
    console.error('Scraping Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Terjadi kesalahan saat mencari gambar otomatis.'
    }, { status: 500 });
  }
}
