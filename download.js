const fs = require('fs');
const https = require('https');
const path = require('path');
const { URL } = require('url');

const images = {
    'mdv.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Maldives-6.jpg/600px-Maldives-6.jpg',
    'idn.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Bali_Indonesia_Pura-Ulun-Danu-Bratan-01.jpg/600px-Bali_Indonesia_Pura-Ulun-Danu-Bratan-01.jpg',
    'grc.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Santorini_Oia_Sunset.jpg/600px-Santorini_Oia_Sunset.jpg',
    'tha.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Phang_Nga_Bay_-_James_Bond_Island.jpg/600px-Phang_Nga_Bay_-_James_Bond_Island.jpg',
    'pyf.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Bora_Bora_Mount_Otemanu.jpg/600px-Bora_Bora_Mount_Otemanu.jpg'
};

const dirs = [
    path.join(__dirname, 'assets'),
    path.join(__dirname, 'public', 'assets')
];

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

Object.entries(images).forEach(([name, url]) => {
    fetchAndSave(url, name);
});

function fetchAndSave(urlStr, name) {
    https.get(urlStr, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
            const redirectUrl = new URL(res.headers.location, urlStr).toString();
            fetchAndSave(redirectUrl, name);
            return;
        }
        
        if (res.statusCode !== 200) {
            console.error(`Failed to download ${name} from ${urlStr}: ${res.statusCode}`);
            return;
        }
        
        const buffers = [];
        res.on('data', chunk => buffers.push(chunk));
        res.on('end', () => {
            const buffer = Buffer.concat(buffers);
            dirs.forEach(dir => {
                fs.writeFileSync(path.join(dir, name), buffer);
                console.log(`Saved ${name} to ${dir}`);
            });
        });
    }).on('error', (e) => {
        console.error(`Error fetching ${name}: ${e.message}`);
    });
}
