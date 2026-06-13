const { image_search } = require('duckduckgo-images-api');

async function testDDG() {
    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        const results = await image_search({ query: "nasi goreng", moderate: false, iterations: 1 });
        console.log(results.slice(0, 10).map(r => r.image));
    } catch (e) {
        console.error("DDG package error:", e);
    }
}
testDDG();
