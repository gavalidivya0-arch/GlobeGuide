const https = require('https');
https.get("https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=Big%20Ben%20London&gsrlimit=1&prop=pageimages&pithumbsize=600&format=json", (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => console.log(data));
});
