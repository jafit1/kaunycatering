async function searchUnsplash(query) {
    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        
        const res = await fetch(`https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=10`);
        const data = await res.json();
        
        if (data.results) {
            console.log(data.results.slice(0, 5).map(r => r.urls.regular));
        } else {
            console.log("No results", data);
        }
    } catch (e) {
        console.error("Error:", e);
    }
}
searchUnsplash('nasi goreng');
searchUnsplash('risoles');
