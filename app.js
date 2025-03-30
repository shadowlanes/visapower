document.addEventListener('DOMContentLoaded', function() {
    const passportSelect = document.getElementById('passport-country');
    const visasContainer = document.getElementById('current-visas');
    const resultsContainer = document.getElementById('results-container');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const gridViewBtn = document.getElementById('grid-view-btn');
    const mapViewBtn = document.getElementById('map-view-btn');
    const gridViewContent = document.getElementById('grid-view');
    const mapViewContent = document.getElementById('map-view');
    
    let currentTab = 'visa-free';
    let currentView = 'grid';
    let accessibleCountries = {
        'visa-free': [],
        'visa-on-arrival': [],
        'e-visa': []
    };
    
    let mapView;
    
    // Check if map view should be enabled
    function isMapViewEnabled() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('enabledMapView') === '1';
    } 
    
    // Hide map view button if not enabled
    if (!isMapViewEnabled()) {
        mapViewBtn.style.display = 'none';
    }
    
    // Initialize map view only when dependencies are loaded and view is enabled
    function initializeMapView() {
        // Only initialize if map view is enabled
        if (!isMapViewEnabled()) {
            console.log('Map view is disabled. Add ?enabledMapView=1 to URL to enable it.');
            return;
        }
        
        // Check if jQuery and jVectorMap are available before initializing
        if (typeof jQuery !== 'undefined' && typeof jQuery.fn.vectorMap !== 'undefined') {
            console.log('Initializing map view...');
            mapView = new MapView('#world-map');
        } else {
            console.warn('jQuery or jVectorMap not loaded yet. Delaying map initialization...');
            setTimeout(initializeMapView, 500);
        }
    }
    
    // Start map initialization process
    initializeMapView();

    // Populate country dropdown selects
    function populateCountryDropdowns() {
        // Get unique list of countries from our data and filter out visa entries
        const allCountries = [...new Set([
            ...Object.keys(visaData).filter(key => !key.endsWith(" Visa")),
            ...Object.values(visaData).flatMap(country => 
                Object.values(country).flatMap(accessTypes => 
                    Array.isArray(accessTypes) ? accessTypes : []
                )
            )
        ])].sort();
        
        // Populate passport dropdown
        allCountries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            passportSelect.appendChild(option);
        }); 
        
        // Initially disable the visa container until passport is selected
        visasContainer.classList.add('disabled-container');
        
        // Create a reusable function to populate visas
        function populateVisas() {
            // Clear previous checkboxes and notice
            while (visasContainer.firstChild) {
                visasContainer.removeChild(visasContainer.firstChild);
            }
            
            // Add search box for visas
            const searchBox = document.createElement('input');
            searchBox.type = 'text';
            searchBox.placeholder = 'Search visas...';
            searchBox.className = 'search-box';
            visasContainer.appendChild(searchBox);
            
            // Populate visas checkboxes
            allCountries.forEach(country => {
                // Don't include the passport country as a visa option
                if (country === passportSelect.value) return;
                
                const checkboxItem = document.createElement('div');
                checkboxItem.className = 'checkbox-item';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = country;
                checkbox.id = `visa-${country.replace(/\s+/g, '-').toLowerCase()}`;
                
                // Add change event listener to each checkbox
                checkbox.addEventListener('change', calculateAndDisplayResults);
                
                const label = document.createElement('label');
                label.htmlFor = checkbox.id;
                label.textContent = country;
                
                checkboxItem.appendChild(checkbox);
                checkboxItem.appendChild(label);
                visasContainer.appendChild(checkboxItem);
            });
            
            // Add search functionality
            searchBox.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const checkboxItems = visasContainer.querySelectorAll('.checkbox-item');
                
                checkboxItems.forEach(item => {
                    const label = item.querySelector('label');
                    const countryName = label.textContent.toLowerCase();
                    
                    if (countryName.includes(searchTerm)) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }
         
        // Add change event listener to passport select
        passportSelect.addEventListener('change', function() {
            if (this.value) {
                visasContainer.classList.remove('disabled-container');
                populateVisas();
                calculateAndDisplayResults();
            } else {
                visasContainer.classList.add('disabled-container');
                resetResults();
            }
        });
    }

    // Calculate accessible countries based on passport and visas
    function calculateAccessibleCountries() {
        const passport = passportSelect.value;
        const visas = Array.from(visasContainer.querySelectorAll('input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value);
        
        // Reset results
        accessibleCountries = {
            'visa-free': [],
            'visa-on-arrival': [],
            'e-visa': []
        }; 
        
        // First add countries accessible due to passport
        if (visaData[passport]) {
            if (visaData[passport].visaFree) {
                accessibleCountries['visa-free'] = [...visaData[passport].visaFree];
            }
            
            if (visaData[passport].visaOnArrival) {
                accessibleCountries['visa-on-arrival'] = [...visaData[passport].visaOnArrival];
            }
            
            if (visaData[passport].eVisa) {
                accessibleCountries['e-visa'] = [...visaData[passport].eVisa];
            } 
            
            // Add passport-specific visa benefits if they exist
            if (visaData[passport].additionalAccess) {
                visas.forEach(visa => {
                    if (visaData[passport].additionalAccess[visa]) {
                        const additionalAccess = visaData[passport].additionalAccess[visa];
                        
                        if (additionalAccess.visaFree && additionalAccess.visaFree.length > 0) {
                            accessibleCountries['visa-free'] = [
                                ...accessibleCountries['visa-free'],
                                ...additionalAccess.visaFree
                            ];
                        }
                        
                        if (additionalAccess.visaOnArrival && additionalAccess.visaOnArrival.length > 0) {
                            accessibleCountries['visa-on-arrival'] = [
                                ...accessibleCountries['visa-on-arrival'],
                                ...additionalAccess.visaOnArrival
                            ];
                        }
                        
                        if (additionalAccess.eVisa && additionalAccess.eVisa.length > 0) {
                            accessibleCountries['e-visa'] = [
                                ...accessibleCountries['e-visa'],
                                ...additionalAccess.eVisa
                            ];
                        }
                    }
                });
            }
        }
         
        // Then add countries generally accessible with visas (regardless of passport)
        visas.forEach(visa => {
            const visaKey = visa + " Visa"; // Convert country name to visa key format
            if (visaData[visaKey] && visaData[visaKey].visaFreeWithThisVisa) {
                accessibleCountries['visa-free'] = [
                    ...accessibleCountries['visa-free'],
                    ...visaData[visaKey].visaFreeWithThisVisa
                ];
            }
        }); 
        
        // Remove duplicates and sort
        accessibleCountries['visa-free'] = [...new Set(accessibleCountries['visa-free'])].sort();
        accessibleCountries['visa-on-arrival'] = [...new Set(accessibleCountries['visa-on-arrival'])].sort();
        accessibleCountries['e-visa'] = [...new Set(accessibleCountries['e-visa'])].sort();
        
        // Remove passport country from results
        Object.keys(accessibleCountries).forEach(type => {
            accessibleCountries[type] = accessibleCountries[type].filter(country => country !== passport);
        });
    }
    
    // Display results based on currently selected tab and view
    function displayResults() {
        // If map view is active and enabled, update the map
        if (currentView === 'map' && isMapViewEnabled()) {
            // Only update map if it's initialized
            if (mapView && mapView.map) {
                mapView.updateData(accessibleCountries, currentTab);
            }
            return;
        }
        
        // Otherwise, display grid view
        const countries = accessibleCountries[currentTab];
        
        if (countries.length === 0) {
            resultsContainer.innerHTML = '<p class="empty-state">No countries found for this category</p>';
            return;
        }
         
        let html = '<div class="country-grid">';
        
        // Color code the cards based on their access type
        if (currentTab === 'visa-free') {
            countries.forEach(country => {
                html += `
                    <div class="country-card visa-free-card">
                        <span>${country}</span>
                    </div>
                `;
            });
        } else if (currentTab === 'visa-on-arrival') {
            countries.forEach(country => {
                html += `
                    <div class="country-card visa-on-arrival-card">
                        <span>${country}</span>
                    </div>
                `;
            });
        } else if (currentTab === 'e-visa') {
            countries.forEach(country => {
                html += `
                    <div class="country-card e-visa-card">
                        <span>${country}</span>
                    </div>
                `;
            });
        }
        
        html += '</div>';
        
        resultsContainer.innerHTML = html;
    }
    
    // Reset results to initial state
    function resetResults() {
        accessibleCountries = {
            'visa-free': [],
            'visa-on-arrival': [],
            'e-visa': []
        };
        resultsContainer.innerHTML = '<p class="empty-state">Select your passport and visas to see available countries</p>';
    }
    
    // Combined function to calculate and display results
    function calculateAndDisplayResults() {
        if (!passportSelect.value) {
            resetResults();
            return;
        }
        
        calculateAccessibleCountries();
        displayResults();
    }
    
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentTab = button.dataset.type;
            displayResults();
        });
    });
    
    // View switching
    gridViewBtn.addEventListener('click', () => {
        gridViewBtn.classList.add('active');
        mapViewBtn.classList.remove('active');
        gridViewContent.classList.add('active');
        mapViewContent.classList.remove('active');
        currentView = 'grid';
        displayResults();
    });
    
    mapViewBtn.addEventListener('click', () => {
        // Only allow map view if it's enabled
        if (!isMapViewEnabled()) {
            console.log('Map view is disabled. Add ?enabledMapView=1 to URL to enable it.');
            return;
        }
        
        mapViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
        mapViewContent.classList.add('active');
        gridViewContent.classList.remove('active');
        currentView = 'map';
        displayResults();
    });
    
    // Initialize the app
    populateCountryDropdowns();
});
