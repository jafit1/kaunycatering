async function searchGoogleImages(query) {
    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        
        const res = await fetch(`https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`, {
            headers: { 
                // Using an older mobile user agent often forces Google to serve simple HTML with raw image URLs
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Mobile Safari/537.36' 
            }
        });
        const html = await res.text();
        
        const images = [];
        // Google often stores the raw image URLs in JSON data blocks or inside 'encrypted-tbn0'
        const regex1 = /"(https:\/\/encrypted-tbn0\.gstatic\.com\/images\?q=tbn:[^"]+)"/g;
        let match;
        while ((match = regex1.exec(html)) !== null) {
            if (!images.includes(match[1])) images.push(match[1]);
        }
        
        // Sometimes it stores in data URIs for thumbnails
        if (images.length === 0) {
           const regex2 = /src="(data:image\/(?:jpeg|png|webp);base64,[^"]+)"/g;
           while ((match = regex2.exec(html)) !== null) {
               if (!images.includes(match[1])) images.push(match[1]);
           }
        }
        
        console.log(`Found ${images.length} images`);
        console.log(images.slice(0, 3));
    } catch (e) {
        console.error("Error:", e);
    }
}
searchGoogleImages('risoles');
