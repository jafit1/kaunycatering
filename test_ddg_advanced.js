const https = require('https');

async function searchDDG(query) {
    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        
        // 1. Get the VQD token
        const res1 = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&t=h_&iar=images&iax=images&ia=images`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        const html = await res1.text();
        const vqdMatch = html.match(/vqd=["']([^"']+)["']/);
        
        if (!vqdMatch) {
            console.log("No VQD token found.");
            return;
        }
        
        const vqd = vqdMatch[1];
        
        // 2. Fetch images
        const res2 = await fetch(`https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,,&p=1`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        
        const data = await res2.json();
        console.log(data.results.slice(0, 10).map(r => r.image));
    } catch (e) {
        console.error("DDG Search Error:", e);
    }
}

searchDDG('risoles');
