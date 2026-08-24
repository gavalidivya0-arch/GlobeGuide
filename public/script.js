// GlobeGuide Application Logic & Country Explorer

const API_BASE = 'https://api.restcountries.com/countries/v5';
const API_FIELDS = 'names.common,names.official,codes.alpha_2,codes.alpha_3,flag.url_svg,flag.url_png,capitals,region,subregion,area,population,languages,currencies,timezones,cars,classification.un_member,links.google_maps,calling_codes,borders';
const API_PAGE_SIZE = 100;
const API_KEY = (typeof REST_COUNTRIES_API_KEY !== 'undefined' && REST_COUNTRIES_API_KEY) ? REST_COUNTRIES_API_KEY : 'rc_live_7e8a57f97646446ab84a5f48ec408fa6';
const CACHE_KEY = 'globeguide_countries_cache_v5';
const CACHE_TIME = 30 * 60 * 1000; // 30 minutes
const FAV_KEY = 'globeguide_favorites';
const FALLBACK_FLAG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='213'><rect width='100%25' height='100%25' fill='%23e2e8f0'/><text x='50%25' y='55%25' font-size='72' text-anchor='middle' dominant-baseline='middle'>%F0%9F%8C%8D</text></svg>";

// Geographic Center Coordinates [lat, lng] for Leaflet maps & World Locator
const COUNTRY_COORDINATES = {
    "AFG": [33.9391, 67.7100], "ALB": [41.1533, 20.1683], "DZA": [28.0339, 1.6596], "ASM": [-14.2710, -170.1322],
    "AND": [42.5063, 1.5218], "AGO": [-11.2027, 17.8739], "AIA": [18.2206, -63.0686], "ATA": [-75.2509, -0.0714],
    "ATG": [17.0608, -61.7964], "ARG": [-38.4161, -63.6167], "ARM": [40.0691, 45.0382], "ABW": [12.5211, -69.9683],
    "AUS": [-25.2744, 133.7751], "AUT": [47.5162, 14.5501], "AZE": [40.1431, 47.5769], "BHS": [25.0343, -77.3963],
    "BHR": [26.0667, 50.5577], "BGD": [23.6850, 90.3563], "BRB": [13.1939, -59.5432], "BLR": [53.7098, 27.9534],
    "BEL": [50.5039, 4.4699], "BLZ": [17.1899, -88.4976], "BEN": [9.3077, 2.3158], "BMU": [32.3078, -64.7505],
    "BTN": [27.5142, 90.4336], "BOL": [-16.2902, -63.5887], "BIH": [43.9159, 17.6791], "BWA": [-22.3285, 24.6849],
    "BVT": [-54.4232, 3.4132], "BRA": [-14.2350, -51.9253], "IOT": [-6.3432, 71.8765], "VGB": [18.4207, -64.6400],
    "BRN": [4.5353, 114.7277], "BGR": [42.7339, 25.4858], "BFA": [12.2383, -1.5616], "BDI": [-3.3731, 29.9189],
    "CPV": [16.0022, -24.0132], "KHM": [12.5657, 104.9910], "CMR": [7.3697, 12.3547], "CAN": [56.1304, -106.3468],
    "BES": [12.1784, -68.2385], "CYM": [19.3133, -81.2546], "CAF": [6.6111, 20.9394], "TCD": [15.4542, 18.7322],
    "CHL": [-35.6751, -71.5430], "CHN": [35.8617, 104.1954], "CXR": [-10.4475, 105.6904], "CCK": [-12.1642, 96.8710],
    "COL": [4.5709, -74.2973], "COM": [-11.8750, 43.8722], "COG": [-0.2280, 15.8277], "COK": [-21.2367, -159.7777],
    "CRI": [9.7489, -83.7534], "HRV": [45.1000, 15.2000], "CUB": [21.5218, -77.7812], "CUW": [12.1696, -68.9900],
    "CYP": [35.1264, 33.4299], "CZE": [49.8175, 15.4730], "COD": [-4.0383, 21.7587], "DNK": [56.2639, 9.5018],
    "DJI": [11.8251, 42.5903], "DMA": [15.4150, -61.3710], "DOM": [18.7357, -70.1627], "ECU": [-1.8312, -78.1834],
    "EGY": [26.8206, 30.8025], "SLV": [13.7942, -88.8965], "GNQ": [1.6508, 10.2679], "ERI": [15.1794, 39.7823],
    "EST": [58.5953, 25.0136], "SWZ": [-26.5225, 31.4659], "ETH": [9.1450, 40.4897], "FLK": [-51.7963, -59.5236],
    "FRO": [61.8926, -6.9118], "FJI": [-17.7134, 178.0650], "FIN": [64.9631, 25.7482], "FRA": [46.2276, 2.2137],
    "GUF": [3.9339, -53.1258], "PYF": [-17.6797, -149.4068], "ATF": [-49.2804, 69.3486], "GAB": [-0.8037, 11.6094],
    "GMB": [13.4432, -15.3101], "GEO": [42.3154, 43.3569], "DEU": [51.1657, 10.4515], "GHA": [7.9465, -1.0232],
    "GIB": [36.1408, -5.3536], "GRC": [39.0742, 21.8243], "GRL": [71.7069, -42.6043], "GRD": [12.1165, -61.6790],
    "GLP": [16.2650, -61.5510], "GUM": [13.4443, 144.7937], "GTM": [15.7835, -90.2308], "GGY": [49.4482, -2.5895],
    "GIN": [9.9456, -9.6966], "GNB": [11.8037, -15.1804], "GUY": [4.8604, -58.9302], "HTI": [18.9712, -72.2852],
    "HMD": [-53.0818, 73.5042], "VAT": [41.9029, 12.4534], "HND": [15.2000, -86.2419], "HKG": [22.3193, 114.1694],
    "HUN": [47.1625, 19.5033], "ISL": [64.9631, -19.0208], "IND": [20.5937, 78.9629], "IDN": [-0.7893, 113.9213],
    "IRN": [32.4279, 53.6880], "IRQ": [33.2232, 43.6793], "IRL": [53.4129, -8.2439], "IMN": [54.2361, -4.5481],
    "ISR": [31.0461, 34.8516], "ITA": [41.8719, 12.5674], "CIV": [7.5400, -5.5471], "JAM": [18.1096, -77.2975],
    "JPN": [36.2048, 138.2529], "JEY": [49.2144, -2.1312], "JOR": [30.5852, 36.2384], "KAZ": [48.0196, 66.9237],
    "KEN": [-0.0236, 37.9062], "KIR": [-3.3704, -168.7340], "PRK": [40.3399, 127.5101], "KOR": [35.9078, 127.7669],
    "UNK": [42.6026, 20.9030], "KWT": [29.3117, 47.4818], "KGZ": [41.2044, 74.7661], "LAO": [19.8563, 102.4955],
    "LVA": [56.8796, 24.6032], "LBN": [33.8547, 35.8623], "LSO": [-29.6099, 28.2336], "LBR": [6.4281, -9.4295],
    "LBY": [26.3351, 17.2283], "LIE": [47.1660, 9.5554], "LTU": [55.1694, 23.8813], "LUX": [49.8153, 6.1296],
    "MAC": [22.1987, 113.5439], "MDG": [-18.7669, 46.8691], "MWI": [-13.2543, 34.3015], "MYS": [4.2105, 101.9758],
    "MDV": [3.2028, 73.2207], "MLI": [17.5707, -3.9962], "MLT": [35.9375, 14.3754], "MHL": [7.1315, 171.1845],
    "MTQ": [14.6415, -61.0242], "MRT": [21.0079, -10.9408], "MUS": [-20.3484, 57.5522], "MYT": [-12.8275, 45.1662],
    "MEX": [23.6345, -102.5528], "FSM": [7.4256, 150.5508], "MDA": [47.4116, 28.3699], "MCO": [43.7384, 7.4246],
    "MNG": [46.8625, 103.8467], "MNE": [42.7087, 19.3744], "MSR": [16.7425, -62.1874], "MAR": [31.7917, -7.0926],
    "MOZ": [-18.6657, 35.5296], "MMR": [21.9162, 95.9560], "NAM": [-22.9576, 18.4904], "NRU": [-0.5228, 166.9315],
    "NPL": [28.3949, 84.1240], "NLD": [52.1326, 5.2913], "NCL": [-20.9043, 165.6180], "NZL": [-40.9006, 174.8860],
    "NIC": [12.8654, -85.2072], "NER": [17.6078, 8.0817], "NGA": [9.0820, 8.6753], "NIU": [-19.0544, -169.8672],
    "NFK": [-29.0408, 167.9547], "MKD": [41.6086, 21.7453], "MNP": [15.0979, 145.6739], "NOR": [60.4720, 8.4689],
    "OMN": [21.5126, 55.9233], "PAK": [30.3753, 69.3451], "PLW": [7.5150, 134.5825], "PSE": [31.9522, 35.2332],
    "PAN": [8.5379, -80.7821], "PNG": [-6.3150, 143.9555], "PRY": [-23.4425, -58.4438], "PER": [-9.1900, -75.0152],
    "PHL": [12.8797, 121.7740], "PCN": [-24.7036, -127.4393], "POL": [51.9194, 19.1451], "PRT": [39.3999, -8.2245],
    "PRI": [18.2208, -66.5901], "QAT": [25.3548, 51.1839], "REU": [-21.1151, 55.5364], "ROU": [45.9432, 24.9668],
    "RUS": [61.5240, 105.3188], "RWA": [-1.9403, 29.8739], "BLM": [17.9000, -62.8333], "SHN": [-24.1435, -10.0307],
    "KNA": [17.3578, -62.7830], "LCA": [13.9094, -60.9789], "MAF": [18.0708, -63.0501], "SPM": [46.8852, -56.3159],
    "VCT": [12.9843, -61.2872], "WSM": [-13.7590, -172.1046], "SMR": [43.9424, 12.4578], "STP": [0.1864, 6.6131],
    "SAU": [23.8859, 45.0792], "SEN": [14.4974, -14.4524], "SRB": [44.0165, 21.0059], "SYC": [-4.6796, 55.4920],
    "SLE": [8.4606, -11.7799], "SGP": [1.3521, 103.8198], "SXM": [18.0425, -63.0548], "SVK": [48.6690, 19.6990],
    "SVN": [46.1512, 14.9955], "SLB": [-9.6457, 160.1562], "SOM": [5.1521, 46.1996], "ZAF": [-30.5595, 22.9375],
    "SGS": [-54.4296, -36.5879], "SSD": [6.8770, 31.3070], "ESP": [40.4637, -3.7492], "LKA": [7.8731, 80.7718],
    "SDN": [12.8628, 30.2176], "SUR": [3.9193, -56.0278], "SJM": [77.5536, 23.6703], "SWE": [60.1282, 18.6435],
    "CHE": [46.8182, 8.2275], "SYR": [34.8021, 38.9968], "TWN": [23.6978, 120.9605], "TJK": [38.8610, 71.2761],
    "TZA": [-6.3690, 34.8888], "THA": [15.8700, 100.9925], "TLS": [-8.8742, 125.7275], "TGO": [8.6195, 0.8248],
    "TKL": [-8.9674, -171.8559], "TON": [-21.1790, -175.1982], "TTO": [10.6918, -61.2225], "TUN": [33.8869, 9.5375],
    "TUR": [38.9637, 35.2433], "TKM": [38.9697, 59.5563], "TCA": [21.6940, -71.7979], "TUV": [-7.1095, 177.6493],
    "UGA": [1.3733, 32.2903], "UKR": [48.3794, 31.1656], "ARE": [23.4241, 53.8478], "GBR": [55.3781, -3.4360],
    "USA": [37.0902, -95.7129], "UMI": [19.2823, 166.6470], "URY": [-32.5228, -55.7658], "UZB": [41.3775, 64.5853],
    "VUT": [-15.3767, 166.9592], "VEN": [6.4238, -66.5897], "VNM": [14.0583, 108.2772], "VIR": [18.3358, -64.8963],
    "WLF": [-13.7687, -177.1561], "ESH": [24.2155, -12.8858], "YEM": [15.5527, 48.5164], "ZMB": [-13.1339, 27.8493],
    "ZWE": [-19.0154, 29.1549], "Abkhazia": [43.0016, 41.0234]
};

// Country Explorer Feature State
const REGION_LABELS = {
    IND: 'State', USA: 'State', CAN: 'Province', 
    FRA: 'Region', JPN: 'Prefecture', DEU: 'State', 
    GBR: 'Country', AUS: 'State', ITA: 'Region',
    BRA: 'State', CHN: 'Province', RUS: 'Oblast',
    MEX: 'State', ESP: 'Autonomous Community', ZAF: 'Province'
};

function getRegionLabel(cca3) {
    return REGION_LABELS[cca3] || 'Region';
}

let countryDestinationsCache = {};
let currentExplorerCountry = null;
let currentExplorerState = null;
let currentExplorerCity = null;
let currentExplorerFilter = 'All';
let currentExplorerSearch = '';

// Application State
let allCountries = [];
let displayedCountries = [];
let favorites = new Set();
let currentRegion = 'All';
let currentSearch = '';
let currentSort = 'name-asc';
let showOnlyFavorites = false;
let currentView = 'home'; // 'home', 'explore', 'favorites', 'compare', 'country'
let activeCountryCode = null;
let leafletMapInstance = null;

// Home Page Specific State
let homeCurrentRegion = 'All';

// DOM Elements
const elements = {
    mainExplorerView: document.getElementById('mainExplorerView'),
    heroSection: document.getElementById('heroSection'),
    heroTitle: document.getElementById('heroTitle'),
    heroSubtitle: document.getElementById('heroSubtitle'),
    statsRow: document.getElementById('statsRow'),
    
    // Home Page Only: Countries to Travel
    homeCountriesToTravelSection: document.getElementById('homeCountriesToTravelSection'),
    geoDestinationsGrid: document.getElementById('geoDestinationsGrid'),
    geoRegionFilters: document.getElementById('geoRegionFilters'),
    geoMessageContainer: document.getElementById('geoMessageContainer'),
    geoMessageText: document.getElementById('geoMessageText'),
    geoTryAgainBtn: document.getElementById('geoTryAgainBtn'),
    homeViewAllBtn: document.getElementById('homeViewAllBtn'),

    // Explorer Section (Explore / Favorites)
    explorerSection: document.getElementById('explorerSection'),
    grid: document.getElementById('countriesGrid'),
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearch'),
    regionFilters: document.getElementById('regionFilters'),
    sortSelect: document.getElementById('sortSelect'),
    randomBtn: document.getElementById('randomCountryBtn'),
    messageContainer: document.getElementById('messageContainer'),
    messageTitle: document.getElementById('messageTitle'),
    messageBody: document.getElementById('messageBody'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),
    
    // Compare
    compareSection: document.getElementById('compareSection'),
    compareSelect1: document.getElementById('compareSelect1'),
    compareSelect2: document.getElementById('compareSelect2'),
    compareResults: document.getElementById('compareResults'),

    // Details Section
    countryDetailsSection: document.getElementById('countryDetailsSection'),
    
    // Navigation
    navLogo: document.getElementById('navLogo'),
    navHome: document.getElementById('navHome'),
    navExplore: document.getElementById('navExplore'),
    navCompare: document.getElementById('navCompare'),
    navFavorites: document.getElementById('navFavorites'),
    themeToggle: document.getElementById('themeToggle'),
    explorerHeading: document.getElementById('explorerHeading'),
    explorerSubheading: document.getElementById('explorerSubheading'),
    
    // Stats elements
    statCountries: document.getElementById('statCountries'),
    statRegions: document.getElementById('statRegions'),
    statLanguages: document.getElementById('statLanguages'),
    statCurrencies: document.getElementById('statCurrencies'),
    
    // Footer & Toast
    currentYear: document.getElementById('currentYear'),
    toast: document.getElementById('toast')
};

// Initialize Application
async function init() {
    elements.currentYear.textContent = new Date().getFullYear();
    loadFavorites();
    setupEventListeners();
    
    try {
        await fetchCountries();
        updateStats();
        handleRoute();
    } catch (error) {
        showError('Unable to load countries data.', error.message || 'Please check your connection and try again.');
    }
}

// Data Fetching
async function fetchCountries() {
    showLoading();

    // 1. Check Cache
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
        try {
            const parsedCache = JSON.parse(cachedData);
            if (Date.now() - parsedCache.timestamp < CACHE_TIME) {
                allCountries = parsedCache.data;
                return;
            }
        } catch (e) {
            console.error('Cache parse error', e);
        }
    }

    // 2. Load the bundled snapshot (data.js)
    if (typeof COUNTRIES_DATA !== 'undefined' && Array.isArray(COUNTRIES_DATA)) {
        allCountries = COUNTRIES_DATA;
    }

    // 3. Live refresh from v5 API if API Key is configured
    if (API_KEY) {
        try {
            const fresh = await fetchAllCountries();
            if (fresh && fresh.length) {
                allCountries = fresh;
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    timestamp: Date.now(),
                    data: allCountries
                }));
            }
        } catch (e) {
            console.warn('Live API refresh failed; using snapshot data.', e.message);
        }
    }

    if (!allCountries.length) {
        throw new Error('No country data available. Ensure data.js or config.js is loaded.');
    }
}

// REST Countries v5 paginated fetch helper
async function fetchAllCountries() {
    if (!API_KEY) throw new Error('Missing API key');
    const all = [];
    let offset = 0;

    while (true) {
        const url = `${API_BASE}?limit=${API_PAGE_SIZE}&offset=${offset}&response_fields=${API_FIELDS}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        if (!response.ok) throw new Error('API Response not OK');

        const json = await response.json();
        if (json.errors && json.errors.length) throw new Error(json.errors[0].message);

        const objects = json.data?.objects || [];
        objects.forEach(c => all.push(mapCountry(c)));

        const meta = json.data?.meta || {};
        offset += API_PAGE_SIZE;

        if (meta.more === false || !objects.length) break;
        if (all.length >= (meta.total || Infinity)) break;
    }
    return all;
}

// Normalize v5 API response to application schema
function mapCountry(c) {
    const languages = {};
    (c.languages || []).forEach(l => {
        const code = l.iso639_1 || l.iso639_3 || '';
        if (code) languages[code] = l.name;
    });

    const currencies = {};
    (c.currencies || []).forEach(cur => {
        if (cur.code) currencies[cur.code] = { name: cur.name, symbol: cur.symbol };
    });

    const dialCode = c.calling_codes?.[0] || '';

    return {
        name: {
            common: c.names?.common || 'Unknown',
            official: c.names?.official || 'Unknown'
        },
        cca3: c.codes?.alpha_3 || c.codes?.alpha_2 || c.names?.common || '',
        cca2: c.codes?.alpha_2 || '',
        flags: {
            svg: c.flag?.url_svg || '',
            png: c.flag?.url_png || ''
        },
        capital: (c.capitals || []).map(cap => cap.name),
        region: c.region || '',
        subregion: c.subregion || '',
        area: c.area?.kilometers,
        population: c.population || 0,
        languages,
        currencies,
        timezones: c.timezones || [],
        car: { side: c.cars?.driving_side || '' },
        unMember: c.classification?.un_member === true,
        maps: { googleMaps: c.links?.google_maps || '' },
        idd: { root: dialCode ? '+' + dialCode : '', suffixes: [''] },
        borders: c.borders || []
    };
}

// Helper: Convert country cca2 code to genuine Unicode flag emoji
function getFlagEmoji(country) {
    if (!country.cca2 || country.cca2.length !== 2) return '🌐';
    const codePoints = country.cca2
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

// Routing System (Hash-based SPA Router)
function handleRoute() {
    const hash = window.location.hash || '#/home';

    if (hash.startsWith('#/country/')) {
        const code = decodeURIComponent(hash.replace('#/country/', '')).trim();
        showCountryDetailsPage(code);
    } else if (hash === '#/explore') {
        showExploreView();
    } else if (hash === '#/favorites') {
        showFavoritesView();
    } else if (hash === '#/compare') {
        showCompareView();
    } else {
        showHomeView();
    }
}

function updateNavActive(activeId) {
    [elements.navHome, elements.navExplore, elements.navCompare, elements.navFavorites].forEach(btn => {
        if (btn) btn.classList.remove('active');
    });
    const activeBtn = document.getElementById(activeId);
    if (activeBtn) activeBtn.classList.add('active');
}

// Home View (Displays Hero + Dynamic "Countries to Travel" Section ONLY)
function showHomeView() {
    currentView = 'home';
    showOnlyFavorites = false;
    updateNavActive('navHome');

    // Display Home sections
    elements.countryDetailsSection.classList.add('hidden');
    elements.mainExplorerView.classList.remove('hidden');
    elements.heroSection.classList.remove('hidden');
    elements.statsRow.classList.remove('hidden');
    
    const eyebrowContainer = document.getElementById('heroEyebrowContainer');
    if (eyebrowContainer) eyebrowContainer.classList.add('hidden');
    const favsBtn = document.getElementById('mockupFavsBtnContainer');
    if (favsBtn) favsBtn.classList.add('hidden');

    // Set Home hero background (island atoll)
    if (elements.heroSection) {
        elements.heroSection.classList.remove('hero-explore');
        elements.heroSection.classList.remove('hero-favorites');
    }

    // Hide Explorer section and Compare section on Home
    elements.explorerSection.classList.add('hidden');
    elements.compareSection.classList.add('hidden');

    // Show Home-specific "Countries to Travel" section
    if (elements.homeCountriesToTravelSection) {
        elements.homeCountriesToTravelSection.classList.remove('hidden');
    }

    if (elements.explorerSection) {
        elements.explorerSection.classList.remove('favorites-active');
    }

    elements.heroTitle.textContent = 'Explore the World, One Country at a Time';
    elements.heroSubtitle.textContent = 'Discover countries, cultures, populations, languages, currencies, and more through an interactive global explorer.';

    // Render Geoapify Destinations
    renderGeoDestinations();
}

// Explore View (Displays Full Explorer Grid, Controls, Sort & Filters with Amalfi Seaside Background)
function showExploreView() {
    currentView = 'explore';
    showOnlyFavorites = false;
    
    elements.explorerSection.classList.remove('compare-mode');
    updateNavActive('navExplore');

    elements.countryDetailsSection.classList.add('hidden');
    elements.mainExplorerView.classList.remove('hidden');
    elements.heroSection.classList.remove('hidden');
    elements.statsRow.classList.remove('hidden');
    
    const eyebrowContainer = document.getElementById('heroEyebrowContainer');
    if (eyebrowContainer) eyebrowContainer.classList.add('hidden');
    const favsBtn = document.getElementById('mockupFavsBtnContainer');
    if (favsBtn) favsBtn.classList.add('hidden');

    // Set Explore section hero background (Amalfi / Mediterranean seaside town)
    if (elements.heroSection) {
        elements.heroSection.classList.add('hero-explore');
        elements.heroSection.classList.remove('hero-favorites');
    }

    // Hide Home-specific section on Explore
    if (elements.homeCountriesToTravelSection) {
        elements.homeCountriesToTravelSection.classList.add('hidden');
    }
    
    // Show Explorer section
    elements.explorerSection.classList.remove('hidden');
    elements.explorerSection.classList.remove('favorites-active');
    elements.grid.classList.remove('hidden');
    elements.compareSection.classList.add('hidden');

    elements.heroTitle.textContent = 'Global Country Explorer';
    elements.heroSubtitle.textContent = 'Search by name or capital, filter by region, and explore deep demographic and geographic statistics.';
    elements.explorerHeading.textContent = 'Explore Countries';
    elements.explorerSubheading.textContent = 'Showing comprehensive dataset of nations and territories.';

    applyFiltersAndSort();
}

// Favorites View (Clean Hero Without Photographic Background)
function showFavoritesView() {
    currentView = 'favorites';
    showOnlyFavorites = true;
    
    elements.explorerSection.classList.remove('compare-mode');
    updateNavActive('navFavorites');

    elements.countryDetailsSection.classList.add('hidden');
    elements.mainExplorerView.classList.remove('hidden');
    elements.heroSection.classList.remove('hidden');
    elements.statsRow.classList.add('hidden'); // Hide global stats in Favorites
    
    // Remove photographic backgrounds on Favorites (wait, we want to add the specific favorites bg now)
    if (elements.heroSection) {
        elements.heroSection.classList.remove('hero-explore');
        elements.heroSection.classList.add('hero-favorites');
    }

    if (elements.homeCountriesToTravelSection) {
        elements.homeCountriesToTravelSection.classList.add('hidden');
    }
    
    elements.explorerSection.classList.remove('hidden');
    elements.explorerSection.classList.add('favorites-active');
    elements.grid.classList.remove('hidden');
    elements.compareSection.classList.add('hidden');

    const eyebrowContainer = document.getElementById('heroEyebrowContainer');
    if (eyebrowContainer) eyebrowContainer.classList.remove('hidden');
    const favsBtn = document.getElementById('mockupFavsBtnContainer');
    if (favsBtn) favsBtn.classList.remove('hidden');

    elements.heroTitle.textContent = 'My Favourite Places';
    elements.heroSubtitle.textContent = 'A collection of places you love and want to explore again.';
    elements.explorerHeading.textContent = 'Favourite Countries';
    elements.explorerSubheading.textContent = `${favorites.size} countries saved in your personal collection.`;

    applyFiltersAndSort();
}

// Compare View
function showCompareView() {
    currentView = 'compare';
    updateNavActive('navCompare');
    
    elements.explorerSection.classList.add('compare-mode');

    elements.countryDetailsSection.classList.add('hidden');
    elements.mainExplorerView.classList.remove('hidden');
    elements.heroSection.classList.add('hidden');
    elements.statsRow.classList.add('hidden');
    
    const favsBtn = document.getElementById('mockupFavsBtnContainer');
    if (favsBtn) favsBtn.classList.add('hidden');

    if (elements.homeCountriesToTravelSection) {
        elements.homeCountriesToTravelSection.classList.add('hidden');
    }
    
    elements.explorerSection.classList.remove('hidden');
    elements.grid.classList.add('hidden');
    elements.messageContainer.classList.add('hidden');
    elements.compareSection.classList.remove('hidden');

    elements.explorerHeading.textContent = 'Compare Countries Side-by-Side';
    elements.explorerSubheading.textContent = 'Select two nations to compare population, area, languages, and more.';
    populateCompareSelects();
}

// Country Details Page Navigation
function navigateToCountry(cca3) {
    if (!cca3) return;
    window.location.hash = `#/country/${encodeURIComponent(cca3)}`;
}

function showCountryDetailsPage(countryCode) {
    if (!allCountries.length) return;

    const country = allCountries.find(c => 
        (c.cca3 && c.cca3.toLowerCase() === countryCode.toLowerCase()) || 
        (c.cca2 && c.cca2.toLowerCase() === countryCode.toLowerCase()) ||
        (c.name?.common && c.name.common.toLowerCase() === countryCode.toLowerCase())
    );

    if (!country) {
        showError('Country Not Found', `No information available for country code "${countryCode}".`);
        elements.mainExplorerView.classList.remove('hidden');
        elements.countryDetailsSection.classList.add('hidden');
        return;
    }

    currentView = 'country';
    activeCountryCode = country.cca3;

    if (elements.homeCountriesToTravelSection) {
        elements.homeCountriesToTravelSection.classList.add('hidden');
    }
    elements.mainExplorerView.classList.add('hidden');
    elements.countryDetailsSection.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    renderCountryDetails(country);
}

// Geoapify Integration
const GEOAPIFY_API_KEY = typeof VITE_GEOAPIFY_API_KEY !== 'undefined' ? VITE_GEOAPIFY_API_KEY : 'b933121104dd45ff94d50e9b72b6db7d';
let geoDestinationsCache = {};
let currentGeoRegion = 'All';

const GEO_REGIONS_MAP = {
    'All': '-180,-90,180,90',
    'Asia': '60.0,-10.0,150.0,50.0',
    'Europe': '-10.0,35.0,30.0,60.0',
    'North America': '-130.0,10.0,-60.0,60.0',
    'Middle East': '34.0,12.0,63.0,42.0'
};

async function fetchWikipediaImage(query) {
    try {
        const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=pageimages&pithumbsize=600&format=json&origin=*`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.query && data.query.pages) {
            const pages = Object.values(data.query.pages);
            if (pages.length > 0 && pages[0].thumbnail) {
                return pages[0].thumbnail.source;
            }
        }
    } catch (e) {
        console.error('Wikipedia image fetch failed:', e);
    }
    return null;
}

window.handleImageError = async function(img, locationName) {
    img.onerror = null;
    let url = null;
    if (locationName) {
        url = await fetchWikipediaImage(locationName);
    }
    if (url) {
        img.src = url;
    } else {
        img.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"%3E%3Crect width="600" height="400" fill="%23e2e8f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%2364748b"%3ENo Image Available%3C/text%3E%3C/svg%3E';
    }
};

async function parseGeoFeatures(features, seenList = [], limit = 12) {
    const tempPlaces = [];
    for (const f of features) {
        if (tempPlaces.length >= limit) break;
        const props = f.properties;
        
        let name = '';
        if (props.name_international && props.name_international.en) {
            name = props.name_international.en;
        } else if (props.datasource && props.datasource.raw && props.datasource.raw['name:en']) {
            name = props.datasource.raw['name:en'];
        } else {
            name = props.name || props.formatted;
        }
        
        // Skip if the name contains Arabic characters (meaning no English translation is available)
        const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
        if (arabicRegex.test(name)) continue;
        
        if (!name) continue;
        const lowerName = name.toLowerCase();
        let isDuplicate = false;
        
        for (const seen of seenList) {
            if (seen.name === lowerName) {
                isDuplicate = true;
                break;
            }
            if (lowerName.includes(seen.name) || seen.name.includes(lowerName)) {
                // If names overlap and they are close (< ~5km apart), it's a duplicate
                if (Math.abs(seen.lat - props.lat) < 0.05 && Math.abs(seen.lon - props.lon) < 0.05) {
                    isDuplicate = true;
                    break;
                }
            }
        }
        
        if (isDuplicate) continue;
        seenList.push({ name: lowerName, lat: props.lat, lon: props.lon });
        
        tempPlaces.push({ props, name });
    }

    const places = await Promise.all(tempPlaces.map(async ({ props, name }) => {
        const city = props.city || props.state || '';
        const state = props.state || '';
        const country = props.country || '';
        
        const slugId = [name, city, state, country]
            .filter(Boolean)
            .join('-')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        
        let image = '';
        if (props.datasource && props.datasource.raw && props.datasource.raw.image) {
            image = props.datasource.raw.image;
        } else {
            const exactQuery = [name, city, state, country].filter(Boolean).join(' ');
            const cityQuery = [name, city].filter(Boolean).join(' ');
            const countryQuery = [name, country].filter(Boolean).join(' ');

            image = await fetchWikipediaImage(exactQuery);
            if (!image && city) image = await fetchWikipediaImage(cityQuery);
            if (!image && country) image = await fetchWikipediaImage(countryQuery);
            if (!image) image = await fetchWikipediaImage(name);

            if (!image) {
                image = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"%3E%3Crect width="600" height="400" fill="%23e2e8f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%2364748b"%3ENo Image Available%3C/text%3E%3C/svg%3E';
            }
        }
        
        return {
            id: slugId || props.place_id,
            name: name,
            country: country,
            city: city,
            location: [city, country].filter(Boolean).join(', '),
            desc: props.formatted || 'A popular tourist destination.',
            image: image,
            lat: props.lat,
            lon: props.lon,
            countryCode: props.country_code ? props.country_code.toUpperCase() : null
        };
    }));

    return places;
}

async function fetchGeoapifyDestinations(region) {
    return [
        {
            id: 'mdv',
            name: 'The Maldives',
            country: 'Maldives',
            city: '',
            location: 'Indian Ocean',
            desc: 'A tropical paradise known for its pristine beaches, crystal-clear waters, and luxurious overwater bungalows.',
            image: 'assets/mdv.jpg',
            countryCode: 'MV'
        },
        {
            id: 'idn',
            name: 'Bali',
            country: 'Indonesia',
            city: '',
            location: 'Lesser Sunda Islands',
            desc: 'An iconic island destination famous for its volcanic mountains, iconic rice paddies, beaches and coral reefs.',
            image: 'assets/idn.jpg',
            countryCode: 'ID'
        },
        {
            id: 'grc',
            name: 'Santorini',
            country: 'Greece',
            city: '',
            location: 'Aegean Sea',
            desc: 'Renowned for its stunning sunsets, whitewashed, cubiform houses clinging to cliffs above an underwater caldera.',
            image: 'assets/grc.jpg',
            countryCode: 'GR'
        },
        {
            id: 'tha',
            name: 'Phang Nga Bay',
            country: 'Thailand',
            city: '',
            location: 'Strait of Malacca',
            desc: 'Distinctive for its sheer limestone karsts that jut vertically out of the emerald-green water.',
            image: 'assets/tha.jpg',
            countryCode: 'TH'
        },
        {
            id: 'pyf',
            name: 'Bora Bora',
            country: 'French Polynesia',
            city: '',
            location: 'Pacific Ocean',
            desc: 'A small South Pacific island northwest of Tahiti in French Polynesia, surrounded by sand-fringed motus.',
            image: 'assets/pyf.jpg',
            countryCode: 'PF'
        }
    ];
}

async function renderGeoDestinations() {
    if (!elements.geoDestinationsGrid) return;
    
    // Show Loading Skeletons
    elements.geoMessageContainer.classList.add('hidden');
    elements.geoDestinationsGrid.innerHTML = Array(4).fill(0).map(() => `
        <article class="geo-skeleton-card">
            <div class="geo-skeleton-img"></div>
            <div class="geo-skeleton-content">
                <div class="geo-skeleton-line"></div>
                <div class="geo-skeleton-line short"></div>
                <div class="geo-skeleton-btn"></div>
            </div>
        </article>
    `).join('');
    
    const places = await fetchGeoapifyDestinations(currentGeoRegion);
    
    if (!places || places.length === 0) {
        elements.geoDestinationsGrid.innerHTML = '';
        elements.geoMessageContainer.classList.remove('hidden');
        if (elements.geoMessageText) elements.geoMessageText.textContent = 'Unable to load destinations right now.';
        return;
    }
    
    let filteredPlaces = places;
    if (currentSearch) {
        filteredPlaces = places.filter(place => 
            place.name.toLowerCase().includes(currentSearch) || 
            place.country.toLowerCase().includes(currentSearch) ||
            place.city.toLowerCase().includes(currentSearch)
        );
    }
    
    if (filteredPlaces.length === 0) {
        elements.geoDestinationsGrid.innerHTML = '';
        elements.geoMessageContainer.classList.remove('hidden');
        if (elements.geoMessageText) elements.geoMessageText.textContent = `No destinations found matching "${currentSearch}".`;
        return;
    }
    
    elements.geoMessageContainer.classList.add('hidden');
    const fragment = document.createDocumentFragment();
    
    filteredPlaces.slice(0, 12).forEach(place => {
        const card = document.createElement('article');
        card.className = 'geo-travel-card';
        card.setAttribute('tabindex', '0');
        
        card.innerHTML = `
            <div class="geo-travel-img-wrapper">
                <img src="${place.image}" alt="${place.name}" class="geo-travel-img" loading="lazy" onerror="window.handleImageError(this, '${[place.name, place.city, place.country].filter(Boolean).join(' ').replace(/'/g, "\\'")}')">
                <span class="geo-travel-badge">${place.country}</span>
            </div>
            <div class="geo-travel-content">
                <h3 class="geo-travel-title" title="${place.name}">${place.name}</h3>
                <div class="geo-travel-location">
                    <span>📍</span> ${place.location}
                </div>
                <p class="geo-travel-desc">${place.desc}</p>
                <button class="geo-travel-btn" data-code="${place.countryCode || ''}">
                    Explore Destination →
                </button>
            </div>
        `;
        
        const btn = card.querySelector('.geo-travel-btn');
        if (btn && place.countryCode) {
            const action = (e) => {
                e.preventDefault();
                e.stopPropagation();
                // If it exists in allCountries, navigate to it
                if (allCountries.some(c => c.cca2 === place.countryCode)) {
                    navigateToCountry(place.countryCode);
                } else {
                    window.location.hash = '#/explore';
                }
            };
            btn.addEventListener('click', action);
            card.addEventListener('click', action);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    action(e);
                }
            });
        }
        
        fragment.appendChild(card);
    });
    
    elements.geoDestinationsGrid.innerHTML = '';
    elements.geoDestinationsGrid.appendChild(fragment);
}

// Add event listener setup for Geoapify filters
function setupGeoFilters() {
    if (elements.geoRegionFilters) {
        elements.geoRegionFilters.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                // Update active class
                elements.geoRegionFilters.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update state and render
                currentGeoRegion = e.target.getAttribute('data-region');
                renderGeoDestinations();
            }
        });
    }
    
    if (elements.geoTryAgainBtn) {
        elements.geoTryAgainBtn.addEventListener('click', () => {
            renderGeoDestinations();
        });
    }
}


// Render Dedicated Country Details Page
function renderCountryDetails(country) {
    const flagUrl = country.flags?.svg || country.flags?.png || FALLBACK_FLAG;
    const name = country.name?.common || 'Unknown';
    const officialName = country.name?.official || 'Unknown';
    const capital = (country.capital && country.capital.length) ? country.capital.join(', ') : 'Not available';
    const region = country.region || 'Not available';
    const subregion = country.subregion || 'Not available';
    const isFav = favorites.has(country.cca3);
    const popFormatted = formatPopulation(country.population);
    const popExact = country.population ? new Intl.NumberFormat().format(country.population) : '0';
    const areaFormatted = country.area ? new Intl.NumberFormat().format(country.area) + ' km²' : 'Not available';
    const areaSqMi = country.area ? new Intl.NumberFormat().format(Math.round(country.area * 0.386102)) + ' sq mi' : '';
    const languagesStr = getLanguages(country.languages);
    const currenciesStr = getCurrencies(country.currencies);
    const timezonesList = country.timezones && country.timezones.length ? country.timezones : ['Not available'];
    const drivingSide = (country.car?.side || 'right').toLowerCase();
    const drivingSideCap = drivingSide.charAt(0).toUpperCase() + drivingSide.slice(1);
    const unMemberStatus = country.unMember ? 'UN Member State' : 'Non-UN Territory';
    const dialCode = (country.idd?.root || '') + (country.idd?.suffixes?.[0] || '');
    const googleMapUrl = country.maps?.googleMaps || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
    const osmUrl = `https://www.openstreetmap.org/search?query=${encodeURIComponent(name)}`;

    // Coordinates lookup
    const coords = COUNTRY_COORDINATES[country.cca3] || [20, 0];
    const lat = coords[0];
    const lng = coords[1];
    const latFormatted = `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'N' : 'S'}`;
    const lngFormatted = `${Math.abs(lng).toFixed(2)}° ${lng >= 0 ? 'E' : 'W'}`;
    const hemisphere = `${lat >= 0 ? 'Northern' : 'Southern'} / ${lng >= 0 ? 'Eastern' : 'Western'} Hemisphere`;

    // SVG World Locator Marker Position (% based on Equirectangular projection)
    const pinX = Math.max(2, Math.min(98, ((lng + 180) / 360) * 100));
    const pinY = Math.max(5, Math.min(95, ((90 - lat) / 180) * 100));

    // Borders HTML
    let bordersHtml = '<p class="no-borders-msg">🏝️ This country does not share land borders with any other nation (Island or territory).</p>';
    if (country.borders && country.borders.length > 0) {
        const borderChips = country.borders.map(bCode => {
            const borderCountry = allCountries.find(c => c.cca3 === bCode || c.cca2 === bCode);
            const bName = borderCountry ? borderCountry.name.common : bCode;
            const bFlag = borderCountry ? (borderCountry.flags?.svg || borderCountry.flags?.png || FALLBACK_FLAG) : FALLBACK_FLAG;
            return `
                <button class="border-country-chip" onclick="navigateToCountry('${bCode}')" title="View details for ${bName}">
                    <img src="${bFlag}" alt="Flag of ${bName}" class="border-country-flag" loading="lazy">
                    <div>
                        <div class="border-country-name">${bName}</div>
                        <div class="border-country-code">${bCode}</div>
                    </div>
                </button>
            `;
        }).join('');
        bordersHtml = `<div class="borders-grid">${borderChips}</div>`;
    }

    // Languages tags
    let langTagsHtml = '';
    if (country.languages && Object.keys(country.languages).length > 0) {
        langTagsHtml = Object.values(country.languages).map(l => `<span class="sub-tag">${l}</span>`).join('');
    } else {
        langTagsHtml = '<span class="sub-tag">Not available</span>';
    }

    // Timezones tags
    const timezonesTagsHtml = timezonesList.map(tz => `<span class="sub-tag">${tz}</span>`).join('');

    // Currencies tags
    let currTagsHtml = '';
    if (country.currencies && Object.keys(country.currencies).length > 0) {
        currTagsHtml = Object.entries(country.currencies).map(([code, cur]) => {
            return `<span class="sub-tag">${cur.name || code} (${cur.symbol || code})</span>`;
        }).join('');
    } else {
        currTagsHtml = '<span class="sub-tag">Not available</span>';
    }

    // Build the Complete Country Details Page HTML
    let detailsHtml = `
        <!-- Top Navigation & Action Bar -->
        <div class="details-nav-bar">
            <button class="btn-back-details" id="backToExploreBtn" aria-label="Back to Explore">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Back to Explore
            </button>
            <div class="details-top-actions">
                <button class="action-pill-btn ${isFav ? 'active' : ''}" id="detailsFavToggleBtn" data-code="${country.cca3}" data-name="${name}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    <span>${isFav ? 'Saved to Favourites' : 'Add to Favourites'}</span>
                </button>
                <button class="action-pill-btn" id="detailsShareBtn" title="Copy shareable link">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    <span>Copy Link</span>
                </button>
            </div>
        </div>

        <!-- Hero Showcase Card -->
        <div class="details-hero-card">
            <div class="details-flag-box">
                <img src="${flagUrl}" alt="Flag of ${name}" class="details-flag-img">
                <span class="flag-code-tag">${country.cca3 || country.cca2}</span>
            </div>
            <div class="details-hero-text">
                <h1>${name}</h1>
                <p class="details-official-name">${officialName}</p>
                <div class="details-badges-row">
                    <span class="country-badge badge-primary">🌍 ${region}</span>
                    ${subregion ? `<span class="country-badge">📍 ${subregion}</span>` : ''}
                    <span class="country-badge ${country.unMember ? 'badge-success' : ''}">🇺🇳 ${unMemberStatus}</span>
                    <span class="country-badge">🚗 Drive on ${drivingSideCap}</span>
                    ${dialCode ? `<span class="country-badge">📞 ${dialCode}</span>` : ''}
                </div>
            </div>
        </div>

        <!-- Key Metrics Summary Grid -->
        <div class="details-metrics-grid">
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-icon">👥</span>
                    <span>Population</span>
                </div>
                <div class="metric-value">${popFormatted}</div>
                <div class="metric-subtext">${popExact} people</div>
            </div>
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-icon">📐</span>
                    <span>Total Area</span>
                </div>
                <div class="metric-value">${country.area ? Intl.NumberFormat().format(country.area) + ' km²' : 'N/A'}</div>
                <div class="metric-subtext">${areaSqMi || 'Geographic land'}</div>
            </div>
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-icon">🏛️</span>
                    <span>Capital</span>
                </div>
                <div class="metric-value" style="font-size: 1.1rem;">${country.capital?.[0] || 'None'}</div>
                <div class="metric-subtext">Seat of government</div>
            </div>
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-icon">🗣️</span>
                    <span>Languages</span>
                </div>
                <div class="metric-value" style="font-size: 1.05rem;" title="${languagesStr}">${languagesStr.substring(0, 20)}${languagesStr.length > 20 ? '...' : ''}</div>
                <div class="metric-subtext">Official & spoken</div>
            </div>
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-icon">💰</span>
                    <span>Currency</span>
                </div>
                <div class="metric-value" style="font-size: 1.05rem;" title="${currenciesStr}">${currenciesStr.substring(0, 20)}${currenciesStr.length > 20 ? '...' : ''}</div>
                <div class="metric-subtext">Legal tender</div>
            </div>
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-icon">🧭</span>
                    <span>Driving Side</span>
                </div>
                <div class="metric-value">${drivingSideCap}</div>
                <div class="metric-subtext">Traffic system</div>
            </div>
        </div>

        <!-- Columns Grid Layout -->
        <div class="details-columns-layout">
            <!-- Left Column: Detailed Information Tables -->
            <div>
                <!-- Geography & Location Card -->
                <div class="info-card">
                    <div class="info-card-header">
                        <svg class="info-card-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                        <h3>Geography & Location</h3>
                    </div>
                    <div class="info-table">
                        <div class="info-table-row">
                            <span class="info-table-label">Capital City</span>
                            <span class="info-table-val">${capital}</span>
                        </div>
                        <div class="info-table-row">
                            <span class="info-table-label">Continent / Region</span>
                            <span class="info-table-val">${region}</span>
                        </div>
                        <div class="info-table-row">
                            <span class="info-table-label">Subregion</span>
                            <span class="info-table-val">${subregion}</span>
                        </div>
                        <div class="info-table-row">
                            <span class="info-table-label">Surface Area</span>
                            <span class="info-table-val">${areaFormatted} ${areaSqMi ? `(${areaSqMi})` : ''}</span>
                        </div>
                        <div class="info-table-row">
                            <span class="info-table-label">Coordinates</span>
                            <span class="info-table-val">${latFormatted}, ${lngFormatted}</span>
                        </div>
                    </div>
                </div>

                <!-- Demographics & Society Card -->
                <div class="info-card">
                    <div class="info-card-header">
                        <svg class="info-card-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        <h3>Demographics & Society</h3>
                    </div>
                    <div class="info-table">
                        <div class="info-table-row">
                            <span class="info-table-label">Population</span>
                            <span class="info-table-val">${popExact}</span>
                        </div>
                        <div class="info-table-row">
                            <span class="info-table-label">Spoken Languages</span>
                            <div class="tag-badges-list">${langTagsHtml}</div>
                        </div>
                        <div class="info-table-row">
                            <span class="info-table-label">UN Membership</span>
                            <span class="info-table-val">${country.unMember ? '✅ Full UN Member' : '❌ Non-Member / Territory'}</span>
                        </div>
                        <div class="info-table-row">
                            <span class="info-table-label">Calling Code</span>
                            <span class="info-table-val">${dialCode || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <!-- Economy & Time Card -->
                <div class="info-card">
                    <div class="info-card-header">
                        <svg class="info-card-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                        <h3>Economy & Time Zones</h3>
                    </div>
                    <div class="info-table">
                        <div class="info-table-row">
                            <span class="info-table-label">Currencies</span>
                            <div class="tag-badges-list">${currTagsHtml}</div>
                        </div>
                        <div class="info-table-row">
                            <span class="info-table-label">Time Zones</span>
                            <div class="tag-badges-list">${timezonesTagsHtml}</div>
                        </div>
                        <div class="info-table-row">
                            <span class="info-table-label">Driving Traffic Side</span>
                            <span class="info-table-val">${drivingSideCap} Hand Side</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column: Highlighted World Map Location & Interactive Leaflet Map -->
            <div>
                <!-- Highlighted World Map Location Card -->
                <div class="info-card">
                    <div class="info-card-header">
                        <svg class="info-card-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                        <h3>Highlighted World Map Location</h3>
                    </div>
                    
                    <div class="world-locator-container">
                        <!-- Stylized SVG World Map -->
                        <svg class="world-map-svg" viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="worldGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(100, 116, 139, 0.12)" stroke-width="1"/>
                                </pattern>
                            </defs>
                            <rect width="1000" height="500" fill="url(#worldGrid)" />
                            
                            <!-- Simplified Continent Outlines -->
                            <g fill="rgba(100, 116, 139, 0.28)" stroke="rgba(100, 116, 139, 0.45)" stroke-width="1.5">
                                <!-- North America -->
                                <path d="M 120 70 Q 180 50 280 80 Q 320 120 280 180 Q 230 200 180 230 Q 150 170 120 120 Z"/>
                                <!-- South America -->
                                <path d="M 270 250 Q 350 260 380 340 Q 350 440 290 460 Q 260 380 260 300 Z"/>
                                <!-- Europe -->
                                <path d="M 460 70 Q 560 60 580 120 Q 530 160 480 160 Q 450 120 460 70 Z"/>
                                <!-- Africa -->
                                <path d="M 460 170 Q 560 170 580 250 Q 550 380 500 410 Q 440 330 450 220 Z"/>
                                <!-- Asia -->
                                <path d="M 580 70 Q 820 60 880 150 Q 840 270 720 270 Q 640 180 580 120 Z"/>
                                <!-- Australia / Oceania -->
                                <path d="M 760 320 Q 880 310 890 390 Q 820 440 760 390 Z"/>
                                <!-- Greenland / Arctic -->
                                <path d="M 330 30 Q 420 20 400 70 Q 330 80 330 30 Z"/>
                            </g>
                        </svg>

                        <!-- Dynamic Coordinate Pin & Radar Pulse -->
                        <div class="world-pin-point" style="left: ${pinX}%; top: ${pinY}%;">
                            <div class="world-pin-pulse"></div>
                            <div class="world-pin-beacon" title="${name} (${latFormatted}, ${lngFormatted})"></div>
                        </div>
                    </div>

                    <div class="world-locator-meta">
                        <span>${hemisphere}</span>
                        <span class="coordinates-badge">${latFormatted}, ${lngFormatted}</span>
                    </div>
                </div>

                <!-- Interactive Map Section -->
                <div class="info-card">
                    <div class="info-card-header">
                        <svg class="info-card-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
                        <h3>Interactive Map Exploration</h3>
                    </div>
                    
                    <div class="interactive-map-wrapper">
                        <div id="countryLeafletMap"></div>
                    </div>

                    <div class="map-action-links">
                        <a href="${googleMapUrl}" target="_blank" rel="noopener noreferrer" class="map-external-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            Open in Google Maps
                        </a>
                        <a href="${osmUrl}" target="_blank" rel="noopener noreferrer" class="map-external-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
                            OpenStreetMap
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Bordering Countries Section -->
        <div class="borders-section-card">
            <div class="info-card-header">
                <svg class="info-card-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                <h3>Bordering Countries ${country.borders && country.borders.length ? `(${country.borders.length})` : ''}</h3>
            </div>
            ${bordersHtml}
        </div>
    `;

    // Country Explorer UI section (applies to ALL countries)
    let regionLabel = getRegionLabel(country.cca3);
    detailsHtml += `
        <div class="country-explorer-section">
            <div class="country-explorer-header">
                <h2 class="country-explorer-title">Discover ${name} ${country.flag || ''}</h2>
                <p class="country-explorer-subtitle">Explore popular tourist destinations across beautiful ${name} ${regionLabel.toLowerCase()}s and cities.</p>
            </div>
            
            <div class="country-explorer-selectors-row">
                <select id="countryStateSelect" class="country-explorer-select" aria-label="Select ${regionLabel}">
                    <option value="">Loading ${regionLabel}s...</option>
                </select>
                <select id="countryCitySelect" class="country-explorer-select" aria-label="Select City">
                    <option value="">Select City</option>
                </select>
                <div class="country-explorer-search-wrapper">
                    <svg class="country-explorer-search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" id="countrySearchInput" class="country-explorer-search-input" placeholder="Search destinations...">
                </div>
            </div>

            <div class="country-explorer-filters-row" id="countryFilters">
                <button class="country-explorer-filter-pill active" data-filter="All">All</button>
                <button class="country-explorer-filter-pill" data-filter="Historical">Historical</button>
                <button class="country-explorer-filter-pill" data-filter="Beaches">Beaches</button>
                <button class="country-explorer-filter-pill" data-filter="Nature">Nature</button>
                <button class="country-explorer-filter-pill" data-filter="Religious">Religious</button>
                <button class="country-explorer-filter-pill" data-filter="Museums">Museums</button>
                <button class="country-explorer-filter-pill" data-filter="Parks">Parks</button>
                <button class="country-explorer-filter-pill" data-filter="Viewpoints">Viewpoints</button>
                <button class="country-explorer-filter-pill" data-filter="Adventure">Adventure</button>
            </div>

            <div id="countryDestinationsGrid" class="country-explorer-destinations-grid">
                <!-- Destinations populated by JS -->
            </div>
            
            <div id="countryErrorState" class="country-explorer-error-state hidden">
                <h4 id="countryErrorMsg">Unable to load destinations.</h4>
                <p>Please check your connection and try again.</p>
                <button id="countryTryAgainBtn" class="btn-primary">Try Again</button>
            </div>
        </div>
    `;


    elements.countryDetailsSection.innerHTML = detailsHtml;

    // Attach event listeners for details top bar buttons
    const backBtn = document.getElementById('backToExploreBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.hash = '#/explore';
            }
        });
    }

    const favToggleBtn = document.getElementById('detailsFavToggleBtn');
    if (favToggleBtn) {
        favToggleBtn.addEventListener('click', (e) => {
            toggleFavorite(country.cca3, name);
            const currentlyFav = favorites.has(country.cca3);
            favToggleBtn.classList.toggle('active', currentlyFav);
            const span = favToggleBtn.querySelector('span');
            const svg = favToggleBtn.querySelector('svg');
            if (span) span.textContent = currentlyFav ? 'Saved to Favourites' : 'Add to Favourites';
            if (svg) svg.setAttribute('fill', currentlyFav ? 'currentColor' : 'none');
        });
    }

    const shareBtn = document.getElementById('detailsShareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const url = window.location.href;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(() => {
                    showToast(`Link for ${name} copied to clipboard!`);
                }).catch(() => {
                    showToast(`URL: ${url}`);
                });
            } else {
                showToast(`URL: ${url}`);
            }
        });
    }

    // Initialize Leaflet Map
    initLeafletMap(country, coords);

    // Initialize Country Explorer UI
    initCountryExplorerUI(country);
}

// Leaflet Map Initialization
function initLeafletMap(country, coords) {
    const mapElement = document.getElementById('countryLeafletMap');
    if (!mapElement || typeof L === 'undefined') return;

    if (leafletMapInstance) {
        leafletMapInstance.remove();
        leafletMapInstance = null;
    }

    const [lat, lng] = coords;
    const name = country.name?.common || 'Country';
    const capital = (country.capital && country.capital.length) ? country.capital[0] : name;
    const flagUrl = country.flags?.svg || country.flags?.png || FALLBACK_FLAG;

    let zoomLevel = 5;
    if (country.area) {
        if (country.area > 5000000) zoomLevel = 3;
        else if (country.area > 1000000) zoomLevel = 4;
        else if (country.area > 200000) zoomLevel = 5;
        else if (country.area > 30000) zoomLevel = 6;
        else zoomLevel = 8;
    }

    try {
        leafletMapInstance = L.map('countryLeafletMap', {
            center: [lat, lng],
            zoom: zoomLevel,
            zoomControl: true,
            scrollWheelZoom: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
        }).addTo(leafletMapInstance);

        const customIcon = L.divIcon({
            className: 'custom-map-pin',
            html: `
                <div style="
                    background: #2563EB;
                    border: 2px solid #FFFFFF;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                    overflow: hidden;
                ">
                    <img src="${flagUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="${name}">
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(leafletMapInstance);
        marker.bindPopup(`
            <div style="font-family: inherit; font-size: 0.9rem; text-align: center; padding: 4px;">
                <strong style="font-size: 1rem; color: #0F172A; display: block; margin-bottom: 2px;">${name}</strong>
                <span style="color: #64748B; font-size: 0.8rem;">Capital: ${capital}</span>
            </div>
        `).openPopup();

        setTimeout(() => {
            if (leafletMapInstance) {
                leafletMapInstance.invalidateSize();
            }
        }, 200);
    } catch (e) {
        console.warn('Leaflet initialization error:', e);
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Hash Routing listener
    window.addEventListener('hashchange', handleRoute);

    // Search with Debounce
    let searchTimeout;
    elements.searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        currentSearch = e.target.value.trim().toLowerCase();
        
        if (currentSearch.length > 0) {
            elements.clearSearchBtn.classList.remove('hidden');
        } else {
            elements.clearSearchBtn.classList.add('hidden');
        }
        
        searchTimeout = setTimeout(() => {
            if (currentView === 'home') {
                renderGeoDestinations();
            } else {
                applyFiltersAndSort();
            }
        }, 300);
    });

    // Clear Search
    elements.clearSearchBtn.addEventListener('click', () => {
        elements.searchInput.value = '';
        currentSearch = '';
        elements.clearSearchBtn.classList.add('hidden');
        elements.searchInput.focus();
        if (currentView === 'home') {
            renderGeoDestinations();
        } else {
            applyFiltersAndSort();
        }
    });

    // Explorer Region Filters
    elements.regionFilters.addEventListener('click', (e) => {
        const pill = e.target.closest('.filter-pill');
        if (pill) {
            document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            
            currentRegion = pill.dataset.region;
            applyFiltersAndSort();
        }
    });

    // Home-specific Region Filters (Geoapify)
    setupGeoFilters();


    // Sort Select
    elements.sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        applyFiltersAndSort();
    });

    // Random Country Button
    elements.randomBtn.addEventListener('click', () => {
        const pool = displayedCountries.length > 0 ? displayedCountries : allCountries;
        if (pool.length > 0) {
            const randomIndex = Math.floor(Math.random() * pool.length);
            const randomCountry = pool[randomIndex];
            navigateToCountry(randomCountry.cca3);
        }
    });

    // Reset Filters Button
    elements.resetFiltersBtn.addEventListener('click', () => {
        elements.searchInput.value = '';
        currentSearch = '';
        elements.clearSearchBtn.classList.add('hidden');
        
        currentRegion = 'All';
        document.querySelectorAll('.filter-pill').forEach(pill => {
            pill.classList.toggle('active', pill.dataset.region === 'All');
        });
        
        currentSort = 'name-asc';
        elements.sortSelect.value = 'name-asc';
        
        applyFiltersAndSort();
    });

    // Nav Links
    elements.navLogo.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '#/home';
    });

    elements.navHome.addEventListener('click', () => {
        window.location.hash = '#/home';
    });

    elements.navExplore.addEventListener('click', () => {
        window.location.hash = '#/explore';
    });

    elements.navFavorites.addEventListener('click', () => {
        window.location.hash = '#/favorites';
    });
    
    if (elements.navCompare) {
        elements.navCompare.addEventListener('click', () => {
            window.location.hash = '#/compare';
        });
    }

    // Dark Mode Toggle
    if (elements.themeToggle) {
        elements.themeToggle.addEventListener('click', () => {
            const isDark = document.body.getAttribute('data-theme') === 'dark';
            if (isDark) {
                document.body.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
            } else {
                document.body.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            }
            if (leafletMapInstance) {
                leafletMapInstance.invalidateSize();
            }
        });
    }

    // Init Theme from LocalStorage
    if (localStorage.getItem('theme') === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    }

    // Compare Selectors
    if (elements.compareSelect1 && elements.compareSelect2) {
        elements.compareSelect1.addEventListener('change', renderCompareResults);
        elements.compareSelect2.addEventListener('change', renderCompareResults);
    }
}

// Filter, Search and Sort Logic (Explorer View)
function applyFiltersAndSort() {
    let filtered = [...allCountries];

    // 1. Favorites Filter
    if (showOnlyFavorites) {
        filtered = filtered.filter(c => favorites.has(c.cca3));
    }

    // 2. Search Filter
    if (currentSearch) {
        filtered = filtered.filter(country => {
            const commonName = (country.name?.common || '').toLowerCase();
            const officialName = (country.name?.official || '').toLowerCase();
            const capital = (country.capital?.[0] || '').toLowerCase();
            const code = (country.cca3 || '').toLowerCase();
            return commonName.includes(currentSearch) || 
                   officialName.includes(currentSearch) || 
                   capital.includes(currentSearch) ||
                   code === currentSearch;
        });
    }

    // 3. Region Filter
    if (currentRegion !== 'All') {
        filtered = filtered.filter(country => country.region === currentRegion);
    }

    // 4. Sort
    filtered.sort((a, b) => {
        const nameA = a.name?.common || '';
        const nameB = b.name?.common || '';
        const popA = a.population || 0;
        const popB = b.population || 0;
        const areaA = a.area || 0;
        const areaB = b.area || 0;

        switch (currentSort) {
            case 'name-asc': return nameA.localeCompare(nameB);
            case 'name-desc': return nameB.localeCompare(nameA);
            case 'pop-asc': return popA - popB;
            case 'pop-desc': return popB - popA;
            case 'area-desc': return areaB - areaA;
            default: return 0;
        }
    });

    displayedCountries = filtered;
    renderCountriesGrid();
    
    if (showOnlyFavorites && currentRegion === 'All' && !currentSearch) {
        renderMockupFavorites();
    } else {
        const mockupGrid = document.getElementById('mockupFavoritesGrid');
        if (mockupGrid) mockupGrid.classList.add('hidden');
        const btnContainer = document.getElementById('mockupFavsBtnContainer');
        if (btnContainer) btnContainer.classList.add('hidden');
    }
}

// Render the top 4 favorites as mockup cards
function renderMockupFavorites() {
    const mockupGrid = document.getElementById('mockupFavoritesGrid');
    if (!mockupGrid) return;
    
    const topFavCodes = [...favorites].slice(0, 5);
    if (topFavCodes.length === 0) {
        mockupGrid.classList.add('hidden');
        const btnContainer = document.getElementById('mockupFavsBtnContainer');
        if (btnContainer) btnContainer.classList.add('hidden');
        return;
    }

    mockupGrid.classList.remove('hidden');
    const btnContainer = document.getElementById('mockupFavsBtnContainer');
    if (btnContainer) btnContainer.classList.remove('hidden');
    mockupGrid.innerHTML = '';
    
    const fragment = document.createDocumentFragment();
    
    topFavCodes.forEach(code => {
        const country = allCountries.find(c => c.cca3 === code);
        if (!country) return;
        
        const name = country.name?.common || 'Unknown';
        const region = country.region || 'Not available';
        
        let cardTitle = name;
        let cardLocation = region;
        let cardDesc = 'A beautiful destination known for its amazing culture, landscapes, and heritage. Plan your next unforgettable trip here.';
        
        if (country.cca3 === 'MDV') {
            cardTitle = 'Maldives';
            cardLocation = 'Maldives';
            cardDesc = 'Paradise on earth with crystal clear waters and white beaches.';
        } else if (country.cca3 === 'IDN') {
            cardTitle = 'Bali';
            cardLocation = 'Indonesia';
            cardDesc = 'A tropical heaven known for its beaches, culture and temples.';
        } else if (country.cca3 === 'GRC') {
            cardTitle = 'Santorini';
            cardLocation = 'Greece';
            cardDesc = 'Stunning sunsets, white houses and breathtaking sea views.';
        } else if (country.cca3 === 'THA') {
            cardTitle = 'Phuket';
            cardLocation = 'Thailand';
            cardDesc = 'Beautiful beaches, vibrant life and tropical adventures.';
        } else if (country.cca3 === 'PYF') {
            cardTitle = 'Bora Bora';
            cardLocation = 'French Polynesia';
            cardDesc = 'Luxury overwater villas and unmatched natural beauty.';
        }

        const card = document.createElement('article');
        card.className = 'mockup-fav-card';
        card.innerHTML = `
            <div class="mockup-fav-img-wrapper">
                <img src="assets/${country.cca3.toLowerCase()}.jpg" alt="${cardTitle} image" loading="lazy" onerror="window.handleImageError(this, '${cardLocation.replace(/'/g, "\\'")}')">
                <button class="favorite-btn mockup-fav-heart active" data-code="${country.cca3}" aria-label="Remove from favourites" title="Remove from favourites">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="heart-icon"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </button>
            </div>
            <div class="mockup-fav-content">
                <h3 class="mockup-fav-title">${cardTitle}</h3>
                <div class="mockup-fav-location">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span>${cardLocation}</span>
                </div>
                <p class="mockup-fav-desc">${cardDesc}</p>
            </div>
        `;
        
        card.addEventListener('click', (e) => {
            if (e.target.closest('.favorite-btn')) return;
            navigateToCountry(country.cca3);
        });
        
        const favBtn = card.querySelector('.favorite-btn');
        favBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(country.cca3, country.name?.common);
        });
        
        fragment.appendChild(card);
    });
    
    mockupGrid.appendChild(fragment);
}

// Render Country Cards Grid (Explorer View)
function renderCountriesGrid() {
    elements.grid.innerHTML = '';
    
    if (displayedCountries.length === 0) {
        elements.grid.classList.add('hidden');
        elements.messageContainer.classList.remove('hidden');
        
        if (showOnlyFavorites && !currentSearch && currentRegion === 'All') {
            elements.messageTitle.textContent = 'No favourites yet';
            elements.messageBody.textContent = 'Tap the ♡ icon on any country card to save it here for quick access.';
            elements.resetFiltersBtn.classList.add('hidden');
        } else {
            elements.messageTitle.textContent = 'No countries found';
            elements.messageBody.textContent = 'Try adjusting your search keywords or choosing another region filter.';
            elements.resetFiltersBtn.classList.remove('hidden');
        }
        return;
    }

    elements.grid.classList.remove('hidden');
    elements.messageContainer.classList.add('hidden');

    const fragment = document.createDocumentFragment();
    
    displayedCountries.forEach(country => {
        const name = country.name?.common || 'Unknown';
        const officialName = country.name?.official || 'Unknown';
        const capital = (country.capital && country.capital.length) ? country.capital.join(', ') : 'Not available';
        const region = country.region || 'Not available';
        const population = formatPopulation(country.population);
        const flagUrl = country.flags?.svg || country.flags?.png || FALLBACK_FLAG;
        const isFav = favorites.has(country.cca3);
        const favClass = isFav ? 'active' : '';

        const card = document.createElement('article');
        card.className = 'country-card';
        card.innerHTML = `
            <div class="card-flag-wrapper">
                <img src="${flagUrl}" alt="Flag of ${name}" class="card-flag" loading="lazy">
            </div>
            <div class="card-content">
                <div class="card-header">
                    <div>
                        <h3 class="card-title">${name}</h3>
                        <p class="card-subtitle" title="${officialName}">${officialName}</p>
                    </div>
                    <button class="favorite-btn ${favClass}" data-code="${country.cca3}" aria-label="Toggle favorite" title="${isFav ? 'Remove from favourites' : 'Add to favourites'}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="heart-icon"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    </button>
                </div>
                
                <div class="card-details">
                    <div class="detail-row">
                        <span class="detail-label">Capital</span>
                        <span class="detail-value">${capital}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Region</span>
                        <span class="detail-value">${region}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Population</span>
                        <span class="detail-value">${population}</span>
                    </div>
                </div>
                
                <span class="btn-link">
                    Explore Details
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </span>
            </div>
        `;
        
        card.addEventListener('click', (e) => {
            if (e.target.closest('.favorite-btn')) return;
            navigateToCountry(country.cca3);
        });

        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigateToCountry(country.cca3);
            }
        });
        
        const favBtn = card.querySelector('.favorite-btn');
        favBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(country.cca3, country.name?.common);
        });

        fragment.appendChild(card);
    });

    elements.grid.appendChild(fragment);
}

// Skeleton Loader
function showLoading() {
    elements.grid.innerHTML = '';
    elements.grid.classList.remove('hidden');
    elements.messageContainer.classList.add('hidden');
    
    for (let i = 0; i < 8; i++) {
        const skel = document.createElement('div');
        skel.className = 'skeleton-card';
        skel.innerHTML = `
            <div class="skeleton-img"></div>
            <div class="skeleton-content">
                <div class="skeleton-text skeleton-title"></div>
                <div class="skeleton-text skeleton-subtitle"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-text" style="width: 60%"></div>
            </div>
        `;
        elements.grid.appendChild(skel);
    }
}

function showError(title, message) {
    elements.grid.classList.add('hidden');
    elements.messageContainer.classList.remove('hidden');
    elements.messageTitle.textContent = title;
    elements.messageBody.textContent = message;
    elements.resetFiltersBtn.classList.remove('hidden');
}

// Favorites Management
function loadFavorites() {
    try {
        const saved = localStorage.getItem(FAV_KEY);
        if (saved) {
            favorites = new Set(JSON.parse(saved));
        } else {
            favorites = new Set(['MDV', 'IDN', 'GRC', 'THA', 'PYF']);
            saveFavorites();
        }
    } catch (e) {
        console.error('Error loading favorites', e);
        favorites = new Set(['MDV', 'IDN', 'GRC', 'THA', 'PYF']);
    }
}

function saveFavorites() {
    localStorage.setItem(FAV_KEY, JSON.stringify([...favorites]));
}

function toggleFavorite(code, name) {
    if (!code) return;
    
    let added = false;
    if (favorites.has(code)) {
        favorites.delete(code);
    } else {
        favorites.add(code);
        added = true;
    }
    
    saveFavorites();
    showToast(`${name || code} ${added ? 'added to' : 'removed from'} favourites`);
    
    if (showOnlyFavorites) {
        applyFiltersAndSort();
    } else {
        const btn = document.querySelector(`.country-card .favorite-btn[data-code="${code}"]`);
        if (btn) {
            btn.classList.toggle('active', added);
            const svg = btn.querySelector('svg');
            if (svg) svg.setAttribute('fill', added ? 'currentColor' : 'none');
        }
    }
}

// Stats Calculation
function updateStats() {
    if (!allCountries.length) return;
    
    if (elements.statCountries) elements.statCountries.textContent = allCountries.length;
    
    const regions = new Set(allCountries.map(c => c.region).filter(Boolean));
    if (elements.statRegions) elements.statRegions.textContent = regions.size;
    
    const languages = new Set();
    const currencies = new Set();
    
    allCountries.forEach(c => {
        if (c.languages) Object.values(c.languages).forEach(l => languages.add(l));
        if (c.currencies) Object.keys(c.currencies).forEach(cur => currencies.add(cur));
    });
    
    if (elements.statLanguages) elements.statLanguages.textContent = languages.size + '+';
    if (elements.statCurrencies) elements.statCurrencies.textContent = currencies.size;
}

// Formatting Utilities
function formatPopulation(num) {
    if (num === undefined || num === null) return 'Not available';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return new Intl.NumberFormat().format(num);
}

function getLanguages(langsObj) {
    if (!langsObj || Object.keys(langsObj).length === 0) return 'Not available';
    return Object.values(langsObj).join(', ');
}

function getCurrencies(currObj) {
    if (!currObj || Object.keys(currObj).length === 0) return 'Not available';
    return Object.values(currObj).map(c => `${c.name || ''} (${c.symbol || ''})`.trim()).join(', ');
}

let toastTimeout;
function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.remove('hidden');
    
    void elements.toast.offsetWidth;
    elements.toast.classList.add('show');
    
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        elements.toast.classList.remove('show');
        setTimeout(() => elements.toast.classList.add('hidden'), 300);
    }, 3000);
}

// Compare Tool Helper Functions
function populateCompareSelects() {
    if (!elements.compareSelect1 || !elements.compareSelect2) return;
    const sorted = [...allCountries].sort((a, b) => (a.name?.common || '').localeCompare(b.name?.common || ''));
    let options = '<option value="">Select a country...</option>';
    sorted.forEach(c => {
        options += `<option value="${c.cca3}">${c.name.common}</option>`;
    });
    elements.compareSelect1.innerHTML = options;
    elements.compareSelect2.innerHTML = options;
}

function renderCompareResults() {
    if (!elements.compareSelect1 || !elements.compareSelect2) return;
    const c1Code = elements.compareSelect1.value;
    const c2Code = elements.compareSelect2.value;
    
    if (!c1Code || !c2Code) {
        elements.compareResults.classList.add('hidden');
        return;
    }
    
    const c1 = allCountries.find(c => c.cca3 === c1Code);
    const c2 = allCountries.find(c => c.cca3 === c2Code);
    
    if (!c1 || !c2) return;
    
    const renderCard = (country) => `
        <div class="compare-card">
            <img src="${country.flags?.svg || country.flags?.png || FALLBACK_FLAG}" alt="Flag of ${country.name.common}">
            <h3>${country.name.common}</h3>
            <div class="compare-stat">
                <span>Region</span>
                <span>${country.region || 'N/A'}</span>
            </div>
            <div class="compare-stat">
                <span>Capital</span>
                <span>${country.capital?.[0] || 'N/A'}</span>
            </div>
            <div class="compare-stat">
                <span>Population</span>
                <span>${formatPopulation(country.population)} (${new Intl.NumberFormat().format(country.population)})</span>
            </div>
            <div class="compare-stat">
                <span>Area</span>
                <span>${country.area ? Intl.NumberFormat().format(country.area) + ' km²' : 'N/A'}</span>
            </div>
            <div class="compare-stat">
                <span>Languages</span>
                <span title="${getLanguages(country.languages)}">${getLanguages(country.languages).substring(0, 25)}${getLanguages(country.languages).length > 25 ? '...' : ''}</span>
            </div>
            <div class="compare-stat">
                <span>Driving Side</span>
                <span style="text-transform: capitalize;">${country.car?.side || 'N/A'}</span>
            </div>
        </div>
    `;
    
    elements.compareResults.innerHTML = renderCard(c1) + renderCard(c2);
    elements.compareResults.classList.remove('hidden');
}

// Launch application on DOM ready
document.addEventListener('DOMContentLoaded', init);

// --- India Travel Feature ---

// --- Country Explorer Feature ---

async function fetchCountryStates(countryName) {
    try {
        const res = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ country: countryName })
        });
        const data = await res.json();
        if (!data.error && data.data && data.data.states) {
            return data.data.states.map(s => s.name);
        }
    } catch (e) { console.error('Failed to fetch states', e); }
    return [];
}

async function fetchStateCities(countryName, stateName) {
    try {
        const res = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ country: countryName, state: stateName })
        });
        const data = await res.json();
        if (!data.error && data.data) {
            return data.data;
        }
    } catch (e) { console.error('Failed to fetch cities', e); }
    return [];
}

async function fetchCityCoordinates(city, state, country) {
    try {
        const url = `https://api.geoapify.com/v1/geocode/search?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&country=${encodeURIComponent(country)}&format=json&apiKey=${GEOAPIFY_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
            return [data.results[0].lat, data.results[0].lon];
        }
    } catch (e) { console.error('Failed to geocode city', e); }
    return null;
}

async function initCountryExplorerUI(country) {
    currentExplorerCountry = country;
    currentExplorerFilter = 'All';
    currentExplorerSearch = '';
    
    const stateSelect = document.getElementById('countryStateSelect');
    const citySelect = document.getElementById('countryCitySelect');
    const searchInput = document.getElementById('countrySearchInput');
    const filtersContainer = document.getElementById('countryFilters');
    const tryAgainBtn = document.getElementById('countryTryAgainBtn');

    if (!stateSelect || !citySelect) return;

    let fallbackCity = country.capital && country.capital.length > 0 ? country.capital[0] : country.name.common;

    let states = await fetchCountryStates(country.name.common);
    if (states.length === 0) {
        states = [country.name.common];
    }
    
    stateSelect.innerHTML = states.map(s => `<option value="${s}">${s}</option>`).join('');
    currentExplorerState = states[0];

    async function updateCities() {
        citySelect.innerHTML = '<option value="">Loading Cities...</option>';
        let cities = [];
        if (states.length > 0 && currentExplorerState !== country.name.common) {
            cities = await fetchStateCities(country.name.common, currentExplorerState);
        }
        
        if (cities.length === 0) {
            cities = [fallbackCity];
        }
        
        citySelect.innerHTML = cities.map(c => `<option value="${c}">${c}</option>`).join('');
        currentExplorerCity = cities[0];
        renderExplorerDestinations();
    }

    stateSelect.addEventListener('change', async () => {
        currentExplorerState = stateSelect.value;
        await updateCities();
    });
    
    citySelect.addEventListener('change', () => {
        currentExplorerCity = citySelect.value;
        renderExplorerDestinations();
    });

    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            currentExplorerSearch = e.target.value.trim().toLowerCase();
            searchTimeout = setTimeout(() => {
                renderExplorerDestinations();
            }, 300);
        });
    }

    if (filtersContainer) {
        filtersContainer.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                filtersContainer.querySelectorAll('.country-explorer-filter-pill').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                currentExplorerFilter = e.target.getAttribute('data-filter');
                renderExplorerDestinations();
            }
        });
    }

    if (tryAgainBtn) {
        tryAgainBtn.addEventListener('click', () => {
            renderExplorerDestinations();
        });
    }

    await updateCities();
}

async function fetchExplorerPlaces(lat, lon, filter) {
    const cacheKey = `explorer_${lat}_${lon}_${filter}`;
    if (countryDestinationsCache[cacheKey]) {
        return countryDestinationsCache[cacheKey];
    }

    let categories = 'tourism.sights';
    switch (filter) {
        case 'Historical': categories = 'tourism.sights.castle,tourism.sights.ruines,building.historic,heritage'; break;
        case 'Beaches': categories = 'beach'; break;
        case 'Nature': categories = 'natural'; break;
        case 'Religious': categories = 'religion'; break;
        case 'Museums': categories = 'tourism.museum'; break;
        case 'Parks': categories = 'leisure.park,national_park'; break;
        case 'Viewpoints': categories = 'tourism.viewpoint'; break;
        case 'Adventure': categories = 'entertainment,leisure.resort'; break;
        default: categories = 'tourism.sights'; break;
    }

    const radius = 50000;
    const url = `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${lon},${lat},${radius}&bias=proximity:${lon},${lat}&limit=20&lang=en&apiKey=${GEOAPIFY_API_KEY}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Geoapify API Error');
        const data = await response.json();
        const places = await parseGeoFeatures(data.features, [], 20);
        countryDestinationsCache[cacheKey] = places;
        return places;
    } catch (e) {
        console.error('Failed to fetch destinations:', e);
        return null;
    }
}

async function renderExplorerDestinations() {
    const grid = document.getElementById('countryDestinationsGrid');
    const errorState = document.getElementById('countryErrorState');
    if (!grid) return;

    errorState.classList.add('hidden');
    grid.innerHTML = Array(4).fill(0).map(() => `
        <article class="country-explorer-skeleton-card">
            <div class="country-explorer-skeleton-img"></div>
            <div class="country-explorer-skeleton-content">
                <div class="country-explorer-skeleton-line"></div>
                <div class="country-explorer-skeleton-line short"></div>
                <div class="country-explorer-skeleton-btn"></div>
            </div>
        </article>
    `).join('');

    let coords = await fetchCityCoordinates(currentExplorerCity, currentExplorerState, currentExplorerCountry.name.common);
    if (!coords) {
        coords = currentExplorerCountry.latlng;
    }
    
    if (!coords) {
        grid.innerHTML = '';
        errorState.classList.remove('hidden');
        return;
    }

    const [lat, lon] = coords;
    const places = await fetchExplorerPlaces(lat, lon, currentExplorerFilter);

    if (!places) {
        grid.innerHTML = '';
        errorState.classList.remove('hidden');
        return;
    }

    let filteredPlaces = places;
    if (currentExplorerSearch) {
        filteredPlaces = places.filter(place => 
            place.name.toLowerCase().includes(currentExplorerSearch) || 
            (place.city && place.city.toLowerCase().includes(currentExplorerSearch)) ||
            (place.country && place.country.toLowerCase().includes(currentExplorerSearch))
        );
    }

    if (filteredPlaces.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 32px;">No destinations found matching your criteria.</p>`;
        return;
    }

    const fragment = document.createDocumentFragment();
    
    filteredPlaces.forEach(place => {
        const card = document.createElement('article');
        card.className = 'country-explorer-destination-card';
        
        let displayCity = place.city || currentExplorerCity;
        let displayState = place.state || currentExplorerState;
        
        card.innerHTML = `
            <div class="country-explorer-destination-img-wrapper">
                <img src="${place.image}" alt="${place.name}" class="country-explorer-destination-img" loading="lazy" onerror="window.handleImageError(this, '${[place.name, displayCity, displayState, currentExplorerCountry.name.common].filter(Boolean).join(' ').replace(/'/g, "\\'")}')">
                <span class="country-explorer-badge">${currentExplorerFilter === 'All' ? 'Tourist Sight' : currentExplorerFilter}</span>
            </div>
            <div class="country-explorer-destination-content">
                <h3 class="country-explorer-destination-title" title="${place.name}">${place.name}</h3>
                <div class="country-explorer-destination-location">
                    <span>📍</span> ${displayCity}, ${displayState}
                </div>
                <p class="country-explorer-destination-desc">${place.desc}</p>
                <button class="country-explorer-explore-btn" onclick="window.open('https://www.google.com/search?q=${encodeURIComponent(place.name + ' ' + displayCity + ' ' + displayState + ' ' + currentExplorerCountry.name.common)}', '_blank')">
                    Explore →
                </button>
            </div>
        `;
        fragment.appendChild(card);
    });

    grid.innerHTML = '';
    grid.appendChild(fragment);
}
