async function searchQwant(query) {
    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        const res = await fetch(`https://api.qwant.com/v3/search/images?count=10&q=${encodeURIComponent(query)}&t=images&safesearch=1&locale=id_id`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
            }
        });
        const data = await res.json();
        if (data.data && data.data.result && data.data.result.items) {
             console.log(data.data.result.items.map(item => item.media));
        } else {
             console.log("No results", data);
        }
    } catch (e) {
        console.error("Qwant error:", e);
    }
}
searchQwant('risoles');
searchQwant('nasi goreng');
