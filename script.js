const API_ALL = 'https://restcountries.com/v3.1/all';
const API_KEY = 'rc_live_7e8a57f97646446ab84a5f48ec408fa6';
const CACHE_KEY = 'globeguide_countries_cache';
const CACHE_TIME = 30 * 60 * 1000; // 30 minutes
const FAV_KEY = 'globeguide_favorites';

let allCountries = [];
let displayedCountries = [];
let favorites = new Set();
let currentRegion = 'All';
let currentSearch = '';
let currentSort = 'name-asc';
let showOnlyFavorites = false;

// DOM Elements
const elements = {
    grid: document.getElementById('countriesGrid'),
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearch'),
    regionFilters: document.getElementById('regionFilters'),
    sortSelect: document.getElementById('sortSelect'),
    randomBtn: document.getElementById('randomCountryBtn'),
    statsRow: document.getElementById('statsRow'),
    messageContainer: document.getElementById('messageContainer'),
    messageTitle: document.getElementById('messageTitle'),
    messageBody: document.getElementById('messageBody'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),
    
    // Nav
    navExplore: document.getElementById('navExplore'),
    navFavorites: document.getElementById('navFavorites'),
    explorerHeading: document.getElementById('explorerHeading'),
    explorerSubheading: document.getElementById('explorerSubheading'),
    
    // Modal
    modal: document.getElementById('detailsModal'),
    modalBackdrop: document.getElementById('modalBackdrop'),
    modalBody: document.getElementById('modalBody'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    modalFavBtn: document.getElementById('modalFavBtn'),
    
    // Footer
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
        applyFiltersAndSort();
    } catch (error) {
        showError('Unable to load countries data.', 'Please check your connection and try again.');
    }
}

// Data Fetching and Caching
async function fetchCountries() {
    showLoading();
    
    // Check Cache
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

    // Fetch from API
    try {
        const response = await fetch(API_ALL);
        if (!response.ok) throw new Error('API Response not OK');
        
        allCountries = await response.json();
        
        // Save to cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            data: allCountries
        }));
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

// Event Listeners Setup
function setupEventListeners() {
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
            applyFiltersAndSort();
        }, 300);
    });

    // Clear Search
    elements.clearSearchBtn.addEventListener('click', () => {
        elements.searchInput.value = '';
        currentSearch = '';
        elements.clearSearchBtn.classList.add('hidden');
        elements.searchInput.focus();
        applyFiltersAndSort();
    });
    
    // Keyboard shortcut / for search
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== elements.searchInput) {
            e.preventDefault();
            elements.searchInput.focus();
        }
    });

    // Region Filters
    elements.regionFilters.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-pill')) {
            // Update active styling
            document.querySelectorAll('.filter-pill').forEach(pill => pill.classList.remove('active'));
            e.target.classList.add('active');
            
            currentRegion = e.target.dataset.region;
            applyFiltersAndSort();
        }
    });

    // Sort Select
    elements.sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        applyFiltersAndSort();
    });

    // Random Button
    elements.randomBtn.addEventListener('click', () => {
        if (displayedCountries.length > 0) {
            const randomIndex = Math.floor(Math.random() * displayedCountries.length);
            showCountryDetails(displayedCountries[randomIndex]);
        } else if (allCountries.length > 0) {
            const randomIndex = Math.floor(Math.random() * allCountries.length);
            showCountryDetails(allCountries[randomIndex]);
        }
    });

    // Reset Filters
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

    // Navigation
    elements.navExplore.addEventListener('click', () => {
        showOnlyFavorites = false;
        elements.navExplore.classList.add('active');
        elements.navFavorites.classList.remove('active');
        elements.explorerHeading.textContent = 'Explore Countries';
        elements.explorerSubheading.textContent = 'Browse and discover countries from around the world.';
        applyFiltersAndSort();
    });

    elements.navFavorites.addEventListener('click', () => {
        showOnlyFavorites = true;
        elements.navFavorites.classList.add('active');
        elements.navExplore.classList.remove('active');
        elements.explorerHeading.textContent = 'Your Favorites';
        elements.explorerSubheading.textContent = 'Countries you have saved for later.';
        applyFiltersAndSort();
    });

    // Modal Close
    const closeDetails = () => elements.modal.classList.add('hidden');
    elements.closeModalBtn.addEventListener('click', closeDetails);
    elements.modalBackdrop.addEventListener('click', closeDetails);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !elements.modal.classList.contains('hidden')) closeDetails();
    });
}

// Filter, Search and Sort Logic
function applyFiltersAndSort() {
    let filtered = [...allCountries];

    // 1. Filter by Favorites
    if (showOnlyFavorites) {
        filtered = filtered.filter(c => favorites.has(c.cca3));
    }

    // 2. Filter by Search
    if (currentSearch) {
        filtered = filtered.filter(country => {
            const commonName = (country.name?.common || '').toLowerCase();
            const officialName = (country.name?.official || '').toLowerCase();
            return commonName.includes(currentSearch) || officialName.includes(currentSearch);
        });
    }

    // 3. Filter by Region
    if (currentRegion !== 'All') {
        filtered = filtered.filter(country => country.region === currentRegion);
    }

    // 4. Sort
    filtered.sort((a, b) => {
        const nameA = a.name?.common || '';
        const nameB = b.name?.common || '';
        const popA = a.population || 0;
        const popB = b.population || 0;

        switch (currentSort) {
            case 'name-asc': return nameA.localeCompare(nameB);
            case 'name-desc': return nameB.localeCompare(nameA);
            case 'pop-asc': return popA - popB;
            case 'pop-desc': return popB - popA;
            default: return 0;
        }
    });

    displayedCountries = filtered;
    renderCountries();
}

// Rendering
function renderCountries() {
    elements.grid.innerHTML = '';
    
    if (displayedCountries.length === 0) {
        elements.grid.classList.add('hidden');
        elements.messageContainer.classList.remove('hidden');
        
        if (showOnlyFavorites && !currentSearch && currentRegion === 'All') {
            elements.messageTitle.textContent = 'No favorites yet';
            elements.messageBody.textContent = 'Tap the ♡ icon on any country to save it here.';
            elements.resetFiltersBtn.classList.add('hidden');
        } else {
            elements.messageTitle.textContent = 'No countries found';
            elements.messageBody.textContent = 'Try changing your search or selecting another region.';
            elements.resetFiltersBtn.classList.remove('hidden');
        }
        return;
    }

    elements.grid.classList.remove('hidden');
    elements.messageContainer.classList.add('hidden');

    const fragment = document.createDocumentFragment();
    
    displayedCountries.forEach(country => {
        const card = document.createElement('article');
        card.className = 'country-card';
        
        const isFav = favorites.has(country.cca3);
        const favClass = isFav ? 'active' : '';
        
        const flagUrl = country.flags?.svg || country.flags?.png || '';
        const name = country.name?.common || 'Unknown';
        const officialName = country.name?.official || 'Unknown';
        const capital = country.capital?.[0] || 'Not available';
        const region = country.region || 'Not available';
        const population = formatPopulation(country.population);

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
                    <button class="favorite-btn ${favClass}" data-code="${country.cca3}" aria-label="Toggle favorite">
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
                
                <button class="btn-link view-details-btn" data-code="${country.cca3}">
                    View Details
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
            </div>
        `;
        
        // Event listeners for this card
        const viewBtn = card.querySelector('.view-details-btn');
        viewBtn.addEventListener('click', () => showCountryDetails(country));
        
        const favBtn = card.querySelector('.favorite-btn');
        favBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(country.cca3, country.name?.common);
        });

        fragment.appendChild(card);
    });

    elements.grid.appendChild(fragment);
}

function showLoading() {
    elements.grid.innerHTML = '';
    elements.grid.classList.remove('hidden');
    elements.messageContainer.classList.add('hidden');
    
    // Create 8 skeleton cards
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

// Details View
function showCountryDetails(country) {
    // Populate Data
    const flagUrl = country.flags?.svg || country.flags?.png || '';
    const name = country.name?.common || 'Unknown';
    const officialName = country.name?.official || 'Unknown';
    
    // Set Header/Fav button
    const isFav = favorites.has(country.cca3);
    elements.modalFavBtn.dataset.code = country.cca3;
    elements.modalFavBtn.dataset.name = name;
    updateModalFavButton(isFav);

    // Build Content
    let html = `
        <div class="details-layout">
            <div>
                <div class="details-flag-wrapper">
                    <img src="${flagUrl}" alt="Flag of ${name}">
                </div>
                <div class="details-header">
                    <h2 class="details-title" id="modalCountryName">${name}</h2>
                    <p class="details-subtitle">${officialName}</p>
                </div>
            </div>
            
            <div class="details-grid">
                <div>
                    <h4 class="details-section-title">Geography</h4>
                    <div class="details-list">
                        <div class="details-list-item">
                            <span class="details-label">Capital</span>
                            <span class="details-val">${country.capital?.[0] || 'Not available'}</span>
                        </div>
                        <div class="details-list-item">
                            <span class="details-label">Region</span>
                            <span class="details-val">${country.region || 'Not available'}</span>
                        </div>
                        <div class="details-list-item">
                            <span class="details-label">Subregion</span>
                            <span class="details-val">${country.subregion || 'Not available'}</span>
                        </div>
                        <div class="details-list-item">
                            <span class="details-label">Area</span>
                            <span class="details-val">${country.area ? Intl.NumberFormat().format(country.area) + ' km²' : 'Not available'}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 class="details-section-title">Demographics & Economy</h4>
                    <div class="details-list">
                        <div class="details-list-item">
                            <span class="details-label">Population</span>
                            <span class="details-val">${formatPopulation(country.population)}</span>
                        </div>
                        <div class="details-list-item">
                            <span class="details-label">Languages</span>
                            <span class="details-val">${getLanguages(country.languages)}</span>
                        </div>
                        <div class="details-list-item">
                            <span class="details-label">Currencies</span>
                            <span class="details-val">${getCurrencies(country.currencies)}</span>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h4 class="details-section-title">Additional Info</h4>
                    <div class="details-list">
                        <div class="details-list-item">
                            <span class="details-label">Timezones</span>
                            <span class="details-val">${country.timezones?.join(', ') || 'Not available'}</span>
                        </div>
                        <div class="details-list-item">
                            <span class="details-label">Driving Side</span>
                            <span class="details-val" style="text-transform: capitalize;">${country.car?.side || 'Not available'}</span>
                        </div>
                        <div class="details-list-item">
                            <span class="details-label">UN Member</span>
                            <span class="details-val">${country.unMember ? 'Yes' : 'No'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    elements.modalBody.innerHTML = html;
    
    // Show Modal
    elements.modal.classList.remove('hidden');
}

function updateModalFavButton(isFav) {
    if (isFav) {
        elements.modalFavBtn.classList.add('active');
        elements.modalFavBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="heart-icon"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
    } else {
        elements.modalFavBtn.classList.remove('active');
        elements.modalFavBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="heart-icon"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
    }
}

// Modal fav button listener
elements.modalFavBtn.addEventListener('click', (e) => {
    const code = e.currentTarget.dataset.code;
    const name = e.currentTarget.dataset.name;
    if (code) {
        toggleFavorite(code, name);
        updateModalFavButton(favorites.has(code));
    }
});

// Favorites System
function loadFavorites() {
    const saved = localStorage.getItem(FAV_KEY);
    if (saved) {
        try {
            favorites = new Set(JSON.parse(saved));
        } catch (e) {
            favorites = new Set();
        }
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
    showToast(`${name} ${added ? 'added to' : 'removed from'} favorites`);
    
    // If we're on the favorites view, we might need to refresh
    if (showOnlyFavorites) {
        applyFiltersAndSort();
    } else {
        // Just toggle the visual state on the card
        const btn = document.querySelector(`.country-card .favorite-btn[data-code="${code}"]`);
        if (btn) {
            btn.classList.toggle('active', added);
            const svg = btn.querySelector('svg');
            if(added) svg.setAttribute('fill', 'currentColor');
            else svg.setAttribute('fill', 'none');
        }
    }
}

// Utilities
function updateStats() {
    if (!allCountries.length) return;
    
    document.getElementById('statCountries').textContent = allCountries.length;
    
    const regions = new Set(allCountries.map(c => c.region).filter(Boolean));
    document.getElementById('statRegions').textContent = regions.size;
    
    const languages = new Set();
    const currencies = new Set();
    
    allCountries.forEach(c => {
        if (c.languages) Object.values(c.languages).forEach(l => languages.add(l));
        if (c.currencies) Object.keys(c.currencies).forEach(cur => currencies.add(cur));
    });
    
    document.getElementById('statLanguages').textContent = languages.size + '+';
    document.getElementById('statCurrencies').textContent = currencies.size;
}

function formatPopulation(num) {
    if (num === undefined || num === null) return 'Not available';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    return new Intl.NumberFormat().format(num);
}

function getLanguages(langsObj) {
    if (!langsObj || Object.keys(langsObj).length === 0) return 'Not available';
    return Object.values(langsObj).join(', ');
}

function getCurrencies(currObj) {
    if (!currObj || Object.keys(currObj).length === 0) return 'Not available';
    return Object.values(currObj).map(c => `${c.name} (${c.symbol || ''})`.trim()).join(', ');
}

let toastTimeout;
function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.remove('hidden');
    
    // Trigger reflow
    void elements.toast.offsetWidth;
    
    elements.toast.classList.add('show');
    
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        elements.toast.classList.remove('show');
        setTimeout(() => elements.toast.classList.add('hidden'), 300); // wait for transition
    }, 3000);
}

// Run App
document.addEventListener('DOMContentLoaded', init);
