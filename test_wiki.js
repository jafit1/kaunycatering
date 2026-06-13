async function searchWiki(query) {
    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        
        const res = await fetch(`https://id.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=10&piprop=original`);
        const data = await res.json();
        
        const images = [];
        if (data.query && data.query.pages) {
            for (const pageId in data.query.pages) {
                const page = data.query.pages[pageId];
                if (page.original && page.original.source) {
                    images.push(page.original.source);
                }
            }
        }
        
        console.log(`Found ${images.length} images`);
        console.log(images);
    } catch (e) {
        console.error("Error:", e);
    }
}
searchWiki('nasi goreng');
searchWiki('risoles');
