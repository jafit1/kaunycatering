const https = require('https');

async function searchImages(query) {
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`);
    const html = await res.text();
    // DuckDuckGo HTML doesn't have image results directly in the main page usually.
    console.log("DDG HTML test. Length:", html.length);
  } catch (e) {
    console.error(e);
  }
}
searchImages('nasi goreng');
