const https = require('https');

async function searchImages(query) {
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const res = await fetch(`https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    // Google uses specific data structures, one common pattern is returning images in JS arrays
    // Or we can look for "encrypted-tbn0.gstatic.com/images?q=tbn:"
    
    // Simplest regex for thumbnail URLs in google image search
    const regex = /"(https:\/\/encrypted-tbn0\.gstatic\.com\/images\?q=tbn:[^"]+)"/g;
    let match;
    const images = [];
    while ((match = regex.exec(html)) !== null) {
      if (!images.includes(match[1])) {
         images.push(match[1]);
      }
    }
    console.log(images.slice(0, 10));
  } catch (e) {
    console.error(e);
  }
}
searchImages('nasi goreng');
