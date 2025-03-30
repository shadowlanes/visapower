document.addEventListener('DOMContentLoaded', async function() {
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
        'e-visa': [],
        'all': [] // Add "All" category
    };
    
    let mapView;

    // Initialize the visa data fetcher
    let visaDataFetcher;
    try {
        visaDataFetcher = new VisaDataFetcher();
    } catch (error) {
        console.error('Failed to initialize VisaDataFetcher:', error);
        showErrorMessage('Failed to initialize. Please try again later.');
        return;
    }
    
    // Initialize the app
    populateCountryDropdowns();

    // Show error message to user
    function showErrorMessage(message) {
        resultsContainer.innerHTML = `<p class="empty-state" style="color: #e74c3c;">${message}</p>`;
    }
    
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
        const visaData = visaDataFetcher.visaData;
        if (!visaData) {
            console.error('Visa data not loaded');
            return;
        }

        const allCountries = [...new Set([
            ...Object.keys(visaData).filter(key => !key.endsWith(" Visa")),
            ...Object.values(visaData).flatMap(country => 
                Object.values(country).flatMap(accessTypes => 
                    Array.isArray(accessTypes) ? accessTypes.map(entry => entry.country) : []
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
        const result = {
            'visa-free': [],
            'visa-on-arrival': [],
            'e-visa': [],
            'all': [] // Reset "All" category
        }; 
        
        // Get data using the fetcher
        const passportData = visaDataFetcher.getVisaDataForPassport(passport);
        
        // First add countries accessible due to passport
        if (passportData) {
            if (passportData.visaFree) {
                result['visa-free'] = passportData.visaFree.map(entry => entry.country);
            }
            
            if (passportData.visaOnArrival) {
                result['visa-on-arrival'] = passportData.visaOnArrival.map(entry => entry.country);
            }
            
            if (passportData.eVisa) {
                result['e-visa'] = passportData.eVisa.map(entry => entry.country);
            } 
            
            // Add passport-specific visa benefits if they exist
            if (passportData.additionalAccess) {
                visas.forEach(visa => {
                    if (passportData.additionalAccess[visa]) {
                        const additionalAccess = passportData.additionalAccess[visa];
                        
                        if (additionalAccess.visaFree && additionalAccess.visaFree.length > 0) {
                            result['visa-free'] = [
                                ...result['visa-free'],
                                ...additionalAccess.visaFree.map(entry => entry.country)
                            ];
                        }
                        
                        if (additionalAccess.visaOnArrival && additionalAccess.visaOnArrival.length > 0) {
                            result['visa-on-arrival'] = [
                                ...result['visa-on-arrival'],
                                ...additionalAccess.visaOnArrival.map(entry => entry.country)
                            ];
                        }
                        
                        if (additionalAccess.eVisa && additionalAccess.eVisa.length > 0) {
                            result['e-visa'] = [
                                ...result['e-visa'],
                                ...additionalAccess.eVisa.map(entry => entry.country)
                            ];
                        }
                    }
                });
            }
        }
        
        // Then add countries generally accessible with visas (regardless of passport)
        visas.forEach(visa => {
            const visaKey = visa + " Visa"; // Convert country name to visa key format
            const visaData = visaDataFetcher.getGeneralVisaAccess(visaKey);
            
            if (visaData && visaData.visaFreeWithThisVisa) {
                result['visa-free'] = [
                    ...result['visa-free'],
                    ...visaData.visaFreeWithThisVisa.map(entry => entry.country)
                ];
            }
        }); 
        
        // Remove duplicates, invalid entries, and sort
        const validCountries = Object.keys(countryCodeMapping); // Use countryCodeMapping for validation
        Object.keys(result).forEach(type => {
            result[type] = [...new Set(result[type])]
                .filter(country => validCountries.includes(country)) // Filter valid countries
                .sort();
        });
        
        // Remove passport country from results
        Object.keys(result).forEach(type => {
            result[type] = result[type].filter(country => country !== passport);
        });

        // Populate "All" category with combined unique entries
        result['all'] = [
            ...new Set([
                ...result['visa-free'],
                ...result['visa-on-arrival'],
                ...result['e-visa']
            ])
        ].sort();
        
        return result;
    }
    
    // Display results based on currently selected tab and view
    function displayResults(countries) {
        // Store the results in the accessibleCountries global variable
        accessibleCountries = countries;
    
        // If map view is active and enabled, update the map
        if (currentView === 'map' && isMapViewEnabled()) {
            if (mapView && mapView.map) {
                mapView.updateData(accessibleCountries, currentTab);
            }
            return;
        }

        // Otherwise, display grid view
        const countriesForTab = accessibleCountries[currentTab];

        if (countriesForTab.length === 0) {
            resultsContainer.innerHTML = '<p class="empty-state">No countries found for this category</p>';
            return;
        }

        resultsContainer.innerHTML = generateCountryGridHTML(countriesForTab);
    }
    
    // Generate HTML for the country grid
    function generateCountryGridHTML(countriesForTab) {
        let html = '<div class="country-grid">';

        // Add color-coded bar for each country based on its category
        countriesForTab.forEach(country => {
            let categoryClass = '';
            let accessType = '';

            if (accessibleCountries['visa-free'].includes(country)) {
                categoryClass = 'visa-free-bar';
                accessType = 'visaFree';
            } else if (accessibleCountries['visa-on-arrival'].includes(country)) {
                categoryClass = 'visa-on-arrival-bar';
                accessType = 'visaOnArrival';
            } else if (accessibleCountries['e-visa'].includes(country)) {
                categoryClass = 'e-visa-bar';
                accessType = 'eVisa';
            }

            // Get the specific visa data entry for the country
            let visaInfo = null;
            const passport = passportSelect.value;
            const passportData = visaDataFetcher.getVisaDataForPassport(passport);

            if (passportData && passportData[accessType]) {
                const entry = passportData[accessType].find(item => item.country === country);
                if (entry) {
                    visaInfo = entry;
                }
            }

            // Generate tooltip HTML
            const tooltipHTML = generateTooltipHTML(country, accessType, visaInfo);

            html += `
                <div class="country-card">
                    <span class="country-bar ${categoryClass}"></span>
                    <span>${country}</span>
                    ${tooltipHTML}
                </div>
            `;
        });

        html += '</div>';
        return html;
    }
    
    // Generate tooltip HTML for a country
    function generateTooltipHTML(country, accessType, visaInfo) {
        let tooltipHTML = '<div class="country-tooltip">';
        tooltipHTML += `<p><span class="tooltip-label">Country:</span> ${country}</p>`;
        
        if (visaInfo) {
            let accessTypeText = '';
            if (accessType === 'visaFree') accessTypeText = 'Visa Free';
            else if (accessType === 'visaOnArrival') accessTypeText = 'Visa on Arrival';
            else if (accessType === 'eVisa') accessTypeText = 'e-Visa Required';
            
            tooltipHTML += `<p><span class="tooltip-label">Access Type:</span> ${accessTypeText}</p>`;
            tooltipHTML += `<p><span class="tooltip-label">Source:</span> <a href="${visaInfo.source}" target="_blank" rel="noopener noreferrer">${visaInfo.source.replace(/^https?:\/\//i, '')}</a></p>`;
            tooltipHTML += `<p><span class="tooltip-label">Last Checked:</span> ${visaInfo.lastChecked}</p>`;
        } else {
            tooltipHTML += '<p>No detailed information available</p>';
        }
        
        tooltipHTML += '</div>';
        return tooltipHTML;
    }
    
    // Reset results to initial state
    function resetResults() {
        accessibleCountries = {
            'visa-free': [],
            'visa-on-arrival': [],
            'e-visa': [],
            'all': [] // Reset "All" category
        };
        resultsContainer.innerHTML = '<p class="empty-state">Select your passport and visas to see available countries</p>';
    }
    
    // Combined function to calculate and display results
    function calculateAndDisplayResults() {
        if (!passportSelect.value) {
            resetResults();
            return;
        }
        
        const countries = calculateAccessibleCountries();
        displayResults(countries);
    }
    
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentTab = button.dataset.type;
            displayResults(accessibleCountries);
        });
    });

    // Add "All" tab to the results tabs
    function addAllTab() {
        const allTab = document.createElement('button');
        allTab.className = 'tab-btn'; // Default inactive tab
        allTab.dataset.type = 'all';
        allTab.textContent = 'All';
        document.querySelector('.results-tabs').prepend(allTab);

        // Update tabButtons to include the new "All" tab
        const updatedTabButtons = document.querySelectorAll('.tab-btn');
        updatedTabButtons.forEach(button => {
            button.addEventListener('click', () => {
                updatedTabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                currentTab = button.dataset.type;
                displayResults(accessibleCountries);
            });
        });

        // Set "All" as the default active tab
        allTab.click();
    }

    // Call addAllTab after the DOM is ready
    addAllTab();
    
    // View switching
    gridViewBtn.addEventListener('click', () => {
        gridViewBtn.classList.add('active');
        mapViewBtn.classList.remove('active');
        gridViewContent.classList.add('active');
        mapViewContent.classList.remove('active');
        currentView = 'grid';
        displayResults(accessibleCountries);
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
        displayResults(accessibleCountries);
    });
});
