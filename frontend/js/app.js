document.addEventListener('DOMContentLoaded', () => {
    // --- Leaflet Map Initialization ---
    const map = L.map('map', {
        zoomControl: false
    }).setView([20.5937, 78.9629], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // --- DOM Element References ---
    const form = document.getElementById('route-form');
    const startInput = document.getElementById('start');
    const endInput = document.getElementById('end');
    const startSuggestions = document.getElementById('start-suggestions');
    const endSuggestions = document.getElementById('end-suggestions');
    const resultsContainer = document.getElementById('results-container');
    const resultsDiv = document.getElementById('results');
    const comparisonBox = document.getElementById('comparison-box');
    const submitButton = form.querySelector('.cta-button');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');
    const welcomeOverlay = document.getElementById('welcome-overlay');
    const startRoutingBtn = document.getElementById('start-routing-btn');
    const modal = document.getElementById('modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    
    let ecoRoutePolyline = null;
    let normalRoutePolyline = null;
    let startMarker = null;
    let endMarker = null;
    let startCoords = null;
    let endCoords = null;

    // --- Event Listeners ---
    startInput.addEventListener('input', debounce((e) => handleAutocomplete(e.target, startSuggestions), 300));
    endInput.addEventListener('input', debounce((e) => handleAutocomplete(e.target, endSuggestions), 300));
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await calculateAndDisplayRoute();
    });
    const accordion = document.querySelector('.accordion');
    accordion.addEventListener('click', () => {
        accordion.classList.toggle('active');
        const panel = accordion.nextElementSibling;
        panel.style.maxHeight = panel.style.maxHeight ? null : panel.scrollHeight + "px";
    });
    startRoutingBtn.addEventListener('click', () => {
        welcomeOverlay.style.opacity = '0';
        welcomeOverlay.style.visibility = 'hidden';
    });
    modalCloseBtn.addEventListener('click', () => {
        modal.classList.remove('visible');
    });

    // --- Core Functions ---

    async function calculateAndDisplayRoute() {
        if (!startCoords || !endCoords) {
            showModal('Missing Coordinates', 'Please select a valid origin and destination from the suggestions.', 'info');
            return;
        }

        setLoadingState(true);
        clearMap();

        try {
            const vehicle = document.getElementById('vehicle').value;
            const preferences = getPreferences();

            const response = await fetch('/api/v1/route', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    start_point: [startCoords.lat, startCoords.lon],
                    end_point: [endCoords.lat, endCoords.lon],
                    vehicle_type: vehicle,
                    preferences: preferences
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            displayRoutesAndMarkers(data);
            displayResults(data.eco_route);
            displayComparison(data.comparison);

        } catch (error) {
            console.error("Error calculating route:", error);
            showModal('Calculation Error', error.message, 'error');
        } finally {
            setLoadingState(false);
        }
    }

    async function handleAutocomplete(inputEl, suggestionsEl) {
        const query = inputEl.value;
        if (query.length < 3) {
            suggestionsEl.innerHTML = '';
            return;
        }

        try {
            const response = await fetch(`/api/v1/search?query=${encodeURIComponent(query)}`);
            if (!response.ok) return;
            const suggestions = await response.json();
            displaySuggestions(suggestions, inputEl, suggestionsEl);
        } catch (error) {
            console.error('Autocomplete error:', error);
        }
    }

    function displaySuggestions(suggestions, inputEl, suggestionsEl) {
        suggestionsEl.innerHTML = '';
        if (suggestions.length === 0) return;

        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.classList.add('suggestion-item');
            item.innerHTML = `<i class="fas fa-map-marker-alt" style="margin-right: 10px; color: var(--text-light);"></i> ${suggestion.address}`;
            item.addEventListener('click', () => {
                inputEl.value = suggestion.address;
                if (inputEl === startInput) {
                    startCoords = suggestion.position;
                } else {
                    endCoords = suggestion.position;
                }
                suggestionsEl.innerHTML = '';
            });
            suggestionsEl.appendChild(item);
        });
    }

    function displayRoutesAndMarkers(data) {
        // Draw Eco Route (Green)
        const ecoLatLngs = data.eco_route.geometry.map(p => [p[1], p[0]]);
        ecoRoutePolyline = L.polyline(ecoLatLngs, { color: 'var(--primary-color)', weight: 7, opacity: 0.9 }).addTo(map);

        // Draw Normal Route (Black)
        const normalLatLngs = data.normal_route.geometry.map(p => [p[1], p[0]]);
        normalRoutePolyline = L.polyline(normalLatLngs, { color: 'var(--secondary-color)', weight: 4, opacity: 0.7, dashArray: '5, 10' }).addTo(map);
        
        // Add Markers
        const startIcon = L.divIcon({
            html: '<i class="fas fa-map-marker-alt" style="color: var(--primary-color); font-size: 2rem;"></i>',
            className: 'map-marker',
            iconSize: [30, 42],
            iconAnchor: [15, 42]
        });
        const endIcon = L.divIcon({
            html: '<i class="fas fa-flag-checkered" style="color: var(--error-color); font-size: 2rem;"></i>',
            className: 'map-marker',
            iconSize: [30, 42],
            iconAnchor: [15, 42]
        });

        startMarker = L.marker([startCoords.lat, startCoords.lon], { icon: startIcon }).addTo(map);
        endMarker = L.marker([endCoords.lat, endCoords.lon], { icon: endIcon }).addTo(map);

        // Fit map to show both routes
        const bounds = L.latLngBounds(ecoLatLngs).extend(normalLatLngs);
        map.fitBounds(bounds, { padding: [50, 50] });
    }

    function displayResults(ecoRouteData) {
        resultsDiv.innerHTML = `
            <div class="result-card">
                <div class="icon"><i class="fas fa-road"></i></div>
                <div class="label">Eco Route Distance</div>
                <div class="value">${ecoRouteData.distance_km.toFixed(1)} km</div>
            </div>
            <div class="result-card">
                <div class="icon"><i class="fas fa-clock"></i></div>
                <div class="label">Eco Route Duration</div>
                <div class="value">${ecoRouteData.duration_minutes.toFixed(0)} min</div>
            </div>
            <div class="result-card">
                <div class="icon"><i class="fas fa-smog"></i></div>
                <div class="label">CO₂ Emissions</div>
                <div class="value">${ecoRouteData.co2_emissions_kg.toFixed(2)} kg</div>
            </div>
            <div class="result-card">
                <div class="icon"><i class="fas fa-leaf"></i></div>
                <div class="label">Eco Score</div>
                <div class="value">85/100</div>
            </div>
        `;
        resultsContainer.classList.remove('hidden');
    }

    function displayComparison(comparisonData) {
        const timeDiff = comparisonData.time_difference_minutes;
        const timeClass = timeDiff > 0 ? 'negative' : '';
        const timeText = timeDiff > 0 ? `+${timeDiff.toFixed(0)} min` : `${timeDiff.toFixed(0)} min`;

        comparisonBox.innerHTML = `
            <div class="comparison-item">
                <div class="label"><i class="fas fa-leaf"></i> CO₂ Saved</div>
                <div class="value">${comparisonData.co2_savings_kg.toFixed(2)} kg</div>
            </div>
            <div class="comparison-item">
                <div class="label"><i class="fas fa-clock"></i> Time Difference</div>
                <div class="value ${timeClass}">${timeText}</div>
            </div>
        `;
        comparisonBox.classList.remove('hidden');
    }

    function getPreferences() {
        const prefs = {};
        document.querySelectorAll('.panel input[type="range"]').forEach(slider => {
            prefs[slider.name] = parseFloat(slider.value);
        });
        return prefs;
    }

    function setLoadingState(isLoading) {
        btnText.textContent = isLoading ? 'Calculating...' : 'Find Greenest Route';
        btnSpinner.classList.toggle('hidden', !isLoading);
        submitButton.disabled = isLoading;
        if (isLoading) {
            resultsContainer.classList.add('hidden');
            comparisonBox.classList.add('hidden');
        }
    }

    function showModal(title, message, type = 'info') {
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        const modalHeader = document.getElementById('modal-header');
        const modalIcon = document.getElementById('modal-icon');

        modalTitle.textContent = title;
        modalMessage.textContent = message;

        modalHeader.className = 'modal-header ' + type;
        modalIcon.className = 'fas ' + (type === 'error' ? 'fa-exclamation-circle' : type === 'success' ? 'fa-check-circle' : 'fa-info-circle');
        
        modal.classList.remove('hidden');
        modal.classList.add('visible');
    }
    
    function clearMap() {
        if (ecoRoutePolyline) map.removeLayer(ecoRoutePolyline);
        if (normalRoutePolyline) map.removeLayer(normalRoutePolyline);
        if (startMarker) map.removeLayer(startMarker);
        if (endMarker) map.removeLayer(endMarker);
    }

    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }
});