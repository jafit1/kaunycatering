const https = require('https');

async function searchImages(query) {
  try {
    const res = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&t=h_&iax=images&ia=images`);
    const html = await res.text();
    const vqdMatch = html.match(/vqd=([a-zA-Z0-9-]+)/);
    if (!vqdMatch) return console.log("No VQD found");
    const vqd = vqdMatch[1];
    
    const searchRes = await fetch(`https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}&o=json&vqd=${vqd}&f=,,,,&p=1`);
    const json = await searchRes.json();
    console.log(json.results.slice(0, 5).map(r => r.image));
  } catch (e) {
    console.error(e);
  }
}
searchImages('nasi goreng');
