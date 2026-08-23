# 🌍 GlobeGuide — Global Country Explorer

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white" alt="Leaflet" />
  <img src="https://img.shields.io/badge/REST_Countries_v5-2563EB?style=for-the-badge&logo=globe&logoColor=white" alt="REST Countries" />
  <img src="https://img.shields.io/badge/Geoapify-4285F4?style=for-the-badge&logo=googlemaps&logoColor=white" alt="Geoapify Places" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License" />
</p>

---

## 📌 Overview

**GlobeGuide** is a modern, responsive, client-side web application for exploring deep geographic, demographic, economic, and cultural data for **254 countries and territories** worldwide.

Built with **pure Vanilla HTML5, CSS3, and JavaScript (ES6+)**, GlobeGuide requires **zero build steps or heavy bundlers**. It features an offline-first data snapshot, real-time search, interactive **Leaflet.js** map exploration, an animated **World Locator**, dedicated country detail pages with **SPA hash routing**, country comparisons, and a persistent favorites system.

---

## ✨ Key Features

### 🔍 1. Global Explorer & Real-Time Discovery
* **Real-time Debounced Search**: Search countries by common name, official name, capital city, or country code (`cca2`/`cca3`).
* **Region Filtering**: Filter by continents and regions (**All**, **Africa**, **Americas**, **Asia**, **Europe**, **Oceania**).
* **Multi-Criteria Sorting**: Sort alphabetically (**A–Z**, **Z–A**), by population (**High → Low**, **Low → High**), or by total land area (**High → Low**).
* **🎲 Random Country Discovery**: Instantly explore a random country with one click.
* **Global Statistics Overview**: Real-time counter for total countries, regions, spoken languages, and legal currencies.

---

### 🗺️ 2. Dedicated Country Details Page
When selecting any country, GlobeGuide navigates to a dedicated page (`#/country/:code`) packed with comprehensive statistics:

* **🚩 Hero Showcase**: High-resolution flag presentation with ISO code tags, official title, and badges for UN Membership, Continent, Subregion, Driving Side, and International Dialing Code.
* **📊 Quick-Glance Metrics Grid**:
  * 👥 **Population**: Formatted shorthand (e.g. `67.8M`) and exact count (`67,842,582`).
  * 📐 **Total Area**: Formatted in km² and sq mi.
  * 🏛️ **Capital City**: Government capital seat.
  * 🗣️ **Languages**: Official and national languages spoken.
  * 💰 **Currency**: Currency name, ISO currency code, and symbol.
  * 🚗 **Driving Side**: Traffic driving side (`Left` / `Right`).
* **📋 Deep Data Breakdown**:
  * **Geography & Administration**: Capital, region, subregion, total area, coordinates (Lat/Lng).
  * **Demographics & Society**: Population totals, language tags, UN membership status, calling codes.
  * **Economy & Time Zones**: Legal currencies and symbols, UTC time zone badges, driving system.
* **🌐 Highlighted World Map Location**:
  * Visual vector SVG world map with continent contours.
  * Dynamically projected coordinate pinpoint with an animated glowing radar beacon showing the country's exact global position.
* **📍 Interactive Leaflet Map Exploration**:
  * Embedded **Leaflet.js** map centered on the country/capital coordinates.
  * Custom flag pin marker, interactive popup, zoom controls, and dark-theme tile styling.
  * Quick links: `Open in Google Maps` and `OpenStreetMap`.
* **🤝 Neighboring Border Countries**:
  * Interactive chips for all bordering nations. Clicking any neighbor navigates directly to that country's details page.

---

### 🏛️ 3. Dynamic Country Explorer (NEW)
Explore specific regions and tourist destinations within **any country** globally.
* **Dynamic Administrative Regions**: Automatically labels regions based on the country (e.g., *States* in USA/India, *Provinces* in Canada, *Prefectures* in Japan).
* **Live Cities & Destinations**: Fetches cities dynamically and uses **Geoapify Geocoding API** to fetch coordinates for the selected city/region.
* **Tourist Spots Discovery**: Connects to the **Geoapify Places API** to find and display nearby attractions, historical sites, beaches, nature parks, and more within a 50km radius.
* **Intelligent Caching**: Caches Geoapify API responses locally to ensure instant load times when swapping filters without making redundant network requests.

---

### 🌗 4. Dark Mode & Glassmorphism Design
* **Glassmorphism Navbar**: Sticky header with blur effects (`backdrop-filter: blur(12px)`).
* **Dark / Light Theme Toggle**: Seamless CSS custom variable theme switching with persistent storage in `localStorage`.
* **Smooth Micro-Animations**: Card lift hover effects, pulse loading skeletons, and fluid view transitions.

---

### ⚖️ 5. Country Compare Tool & Favorites
* **Compare Tool**: Select two countries to compare population, area, languages, capital, region, and driving side side-by-side.
* **Favorites System**: Save favorite countries with a heart toggle that persists across sessions via `localStorage`.

---

## 🗂️ Application Routing (SPA)

GlobeGuide uses a lightweight **Hash-based SPA Router** enabling browser Back/Forward history and direct URL links:

| Route | View Description |
|---|---|
| `#/` or `#/home` | Welcome Home View with overview hero, search, stats, and country grid |
| `#/explore` | Explore View with full filtering, sorting, and discovery tools |
| `#/country/:code` | Dedicated Country Details Page (e.g. `#/country/FRA`, `#/country/JPN`, `#/country/USA`) |
| `#/favorites` | Saved Favorites Collection |
| `#/compare` | Side-by-side Country Comparison Tool |

---

## 📁 Project Structure

```text
GlobeGuide/
├── index.html            # Main SPA HTML structure & Leaflet integration
├── style.css             # Comprehensive design tokens, glassmorphism, & responsive layout
├── script.js             # State management, SPA hash routing, Leaflet lifecycle, & API integration
├── data.js               # Bundled snapshot of 254 countries (offline-first fallback)
├── config.js             # API key configurations (gitignored)
├── package.json          # Node project metadata & server start script
├── server.js             # Node / Express static server
├── server.ps1            # Lightweight PowerShell HTTP server (Windows)
├── public/               # Public distribution app
│   ├── index.html        # Public HTML
│   ├── style.css         # Public CSS
│   ├── script.js         # Public JS
│   ├── data.js           # Public snapshot
│   ├── config.js         # Public config
│   └── countries.json    # Raw country JSON dataset
└── README.md             # Project documentation
```

---

## 🚀 Getting Started & How to Run

### Option 1: Direct File Access (No Server Required)
Simply double-click or open `index.html` in any modern web browser:
```bash
# Windows
start index.html
```

---

### Option 2: PowerShell Static Server (Windows)
Run the bundled lightweight PowerShell server:
```powershell
.\server.ps1
```
Open your browser at **`http://localhost:8000`**.

---

### Option 3: Node / Express Server
```bash
# Install dependencies
npm install

# Start static server
npm start
```
Open your browser at **`http://localhost:3000`**.

---

### Option 4: VS Code Live Server Extension
1. Install the **Live Server** extension in VS Code.
2. Right-click `index.html` (or `public/index.html`).
3. Select **Open with Live Server**.

---

## 🌐 APIs & Live Data Integration

GlobeGuide is powered by a robust stack of public APIs:

1. **[REST Countries API](https://restcountries.com/) (v5)**
   * Provides the core dataset (names, codes, flags, capitals, region, languages, borders).
2. **[CountriesNow API](https://countriesnow.space/)**
   * Fetches accurate administrative states/provinces and their corresponding cities for any country.
3. **[Geoapify Geocoding API](https://www.geoapify.com/geocoding-api)**
   * Converts dynamically fetched cities into exact latitude/longitude coordinates.
4. **[Geoapify Places API](https://www.geoapify.com/places-api)**
   * Discovers categorised points of interest (tourism, beaches, nature, museums) globally.

### Setting Up Your API Keys (Optional)

1. Sign up for free API keys at [REST Countries](https://restcountries.com/sign-up) and [Geoapify](https://myprojects.geoapify.com/register).
2. Create or edit `config.js` in the project root:
   ```javascript
   const REST_COUNTRIES_API_KEY = 'rc_live_your_api_key_here';
   const GEOAPIFY_API_KEY = 'your_geoapify_api_key_here';
   ```
3. Add your local origin (e.g. `http://localhost:8000`) to your key's allowlist.

> [!NOTE]
> If no REST Countries API key is provided or the connection is offline, GlobeGuide automatically serves the bundled core snapshot in `data.js`.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| **HTML5** | Semantic layout, accessibility, and SEO meta tags |
| **CSS3** | Custom properties (CSS variables), glassmorphism, responsive grid & flexbox |
| **Vanilla JavaScript (ES6+)** | Hash router, async/await, DOM manipulation, state management |
| **Leaflet.js** | Interactive mapping with markers, popups, and OpenStreetMap tiles |
| **LocalStorage API** | Theme preference, API cache (30 min), and saved favorites |
| **REST Countries v5** | Global country and territory dataset |
| **Geoapify** | Global spatial discovery (Geocoding & Places) |
| **CountriesNow** | Deep administrative divisions |

---

## 📄 License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute for personal and commercial projects.