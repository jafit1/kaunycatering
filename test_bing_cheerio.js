const cheerio = require('cheerio');

async function searchBingImages(query) {
    try {
        const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&first=1`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
            }
        });
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const images = [];
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
        
        console.log("Found images:", images);
    } catch (e) {
        console.error("Error:", e);
    }
}

searchBingImages("Nasi Goreng Spesial");
