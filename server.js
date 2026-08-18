const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Load Database (JSON)
let countriesData = [];
try {
    const rawData = fs.readFileSync(path.join(__dirname, 'public', 'countries.json'));
    countriesData = JSON.parse(rawData);
} catch (error) {
    console.error("Error loading countries data:", error.message);
}

// API Endpoints
app.get('/api/countries', (req, res) => {
    res.json(countriesData);
});

app.get('/api/countries/:code', (req, res) => {
    const code = req.params.code.toLowerCase();
    const country = countriesData.find(c => c.cca3?.toLowerCase() === code || c.cca2?.toLowerCase() === code);
    
    if (country) {
        res.json(country);
    } else {
        res.status(404).json({ error: 'Country not found' });
    }
});

// Fallback to index.html for SPA routing if needed
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api/countries`);
});
