document.addEventListener('DOMContentLoaded', async function() {
    const passportSelect = document.getElementById('passport-country');
    const visasContainer = document.getElementById('current-visas');
    const resultsContainer = document.getElementById('results-container');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const gridViewBtn = document.getElementById('grid-view-btn');
    const mapViewBtn = document.getElementById('map-view-btn');
    const gridViewContent = document.getElementById('grid-view');
    const mapViewContent = document.getElementById('map-view');
    
    // Create elements for the new passport search container
    const passportSelectContainer = passportSelect.parentElement;
    const passportSearchContainer = document.createElement('div');
    passportSearchContainer.className = 'passport-search-container';
    
    // Replace the select with a search box and results container
    const passportSearch = document.createElement('input');
    passportSearch.type = 'text';
    passportSearch.id = 'passport-search';
    passportSearch.className = 'search-box';
    passportSearch.placeholder = 'Search for your passport country...';
    
    const passportResults = document.createElement('div');
    passportResults.className = 'passport-results';
    
    // Replace the select element with our new components
    passportSearchContainer.appendChild(passportSearch);
    passportSearchContainer.appendChild(passportResults);
    passportSelectContainer.replaceChild(passportSearchContainer, passportSelect);
    
    // Create an element to display country counts
    const countDisplay = document.createElement('div');
    countDisplay.className = 'country-count-display';
    document.querySelector('.results-tabs').after(countDisplay);
    
    let currentTab = 'visa-free';
    let currentView = 'grid';
    let accessibleCountries = {
        'visa-free': [],
        'visa-on-arrival': [],
        'e-visa': [],
        'all': [] // Add "All" category
    };
    let selectedPassport = '';
    
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
        if (!isMapViewEnabled()) {
            console.log('Map view is disabled. Add ?enabledMapView=1 to URL to enable it.');
            return;
        }
        
        if (typeof jQuery !== 'undefined' && typeof jQuery.fn.vectorMap !== 'undefined') {
            console.log('Initializing map view...');
            mapView = new MapView('#world-map');
        } else {
            console.warn('jQuery or jVectorMap not loaded yet. Delaying map initialization...');
            setTimeout(initializeMapView, 500);
        }
    }
    
    initializeMapView();

    // Update the country count display
    function updateCountDisplay(countries) {
        if (!countries || !countries[currentTab]) {
            countDisplay.textContent = 'No countries found';
            return;
        }
        
        const count = countries[currentTab].length;
        const categoryName = currentTab === 'all' ? 'Total' : 
                            currentTab === 'visa-free' ? 'Visa-Free' :
                            currentTab === 'visa-on-arrival' ? 'Visa on Arrival' : 'e-Visa';
        
        countDisplay.textContent = `${count} ${categoryName} ${count === 1 ? 'Country' : 'Countries'} Available`;
    }

    // Populate passport search results
    function populatePassportResults(searchTerm = '') {
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

        const filteredCountries = searchTerm 
            ? allCountries.filter(country => country.toLowerCase().includes(searchTerm.toLowerCase()))
            : allCountries;
        
        passportResults.innerHTML = '';
        
        if (filteredCountries.length === 0) {
            passportResults.innerHTML = '<p class="no-results">No matching countries found</p>';
            return;
        }
        
        filteredCountries.forEach(country => {
            const countryItem = document.createElement('div');
            countryItem.className = 'passport-country-item';
            countryItem.textContent = country;
            countryItem.addEventListener('click', () => {
                selectedPassport = country;
                passportSearch.value = country;
                passportResults.style.display = 'none';
                
                visasContainer.classList.remove('disabled-container');
                populateVisas();
                calculateAndDisplayResults();
            });
            passportResults.appendChild(countryItem);
        });
        
        passportResults.style.display = 'block';
    }
    
    passportSearch.addEventListener('focus', () => {
        populatePassportResults(passportSearch.value);
    });
    
    passportSearch.addEventListener('input', () => {
        populatePassportResults(passportSearch.value);
    });
    
    document.addEventListener('click', (e) => {
        if (!passportSearch.contains(e.target) && !passportResults.contains(e.target)) {
            passportResults.style.display = 'none';
        }
    });

    function populateCountryDropdowns() {
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

        populatePassportResults();
    }

    function populateVisas() {
        while (visasContainer.firstChild) {
            visasContainer.removeChild(visasContainer.firstChild);
        }
        
        const visaData = visaDataFetcher.visaData;
        const allCountries = [...new Set([
            ...Object.keys(visaData).filter(key => !key.endsWith(" Visa")),
            ...Object.values(visaData).flatMap(country => 
                Object.values(country).flatMap(accessTypes => 
                    Array.isArray(accessTypes) ? accessTypes.map(entry => entry.country) : []
                )
            )
        ])].sort();
        
        const searchBox = document.createElement('input');
        searchBox.type = 'text';
        searchBox.placeholder = 'Search visas...';
        searchBox.className = 'search-box';
        visasContainer.appendChild(searchBox);
        
        allCountries.forEach(country => {
            if (country === selectedPassport) return;
            
            const checkboxItem = document.createElement('div');
            checkboxItem.className = 'checkbox-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = country;
            checkbox.id = `visa-${country.replace(/\s+/g, '-').toLowerCase()}`;
            
            checkbox.addEventListener('change', calculateAndDisplayResults);
            
            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = country;
            
            checkboxItem.appendChild(checkbox);
            checkboxItem.appendChild(label);
            visasContainer.appendChild(checkboxItem);
        });
        
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

    function calculateAccessibleCountries() {
        const passport = selectedPassport;
        const visas = Array.from(visasContainer.querySelectorAll('input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value);
        
        const result = {
            'visa-free': [],
            'visa-on-arrival': [],
            'e-visa': [],
            'all': []
        }; 
        
        const passportData = visaDataFetcher.getVisaDataForPassport(passport);
        
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
        
        visas.forEach(visa => {
            const visaKey = visa + " Visa";
            const visaData = visaDataFetcher.getGeneralVisaAccess(visaKey);
            
            if (visaData && visaData.visaFreeWithThisVisa) {
                result['visa-free'] = [
                    ...result['visa-free'],
                    ...visaData.visaFreeWithThisVisa.map(entry => entry.country)
                ];
            }
        }); 
        
        const validCountries = Object.keys(countryCodeMapping);
        Object.keys(result).forEach(type => {
            result[type] = [...new Set(result[type])]
                .filter(country => validCountries.includes(country))
                .sort();
        });
        
        Object.keys(result).forEach(type => {
            result[type] = result[type].filter(country => country !== passport);
        });

        result['all'] = [
            ...new Set([
                ...result['visa-free'],
                ...result['visa-on-arrival'],
                ...result['e-visa']
            ])
        ].sort();
        
        return result;
    }
    
    function displayResults(countries) {
        accessibleCountries = countries;
    
        updateCountDisplay(countries);
        
        if (currentView === 'map' && isMapViewEnabled()) {
            if (mapView && mapView.map) {
                mapView.updateData(accessibleCountries, currentTab);
            }
            return;
        }

        const countriesForTab = accessibleCountries[currentTab];

        if (countriesForTab.length === 0) {
            resultsContainer.innerHTML = '<p class="empty-state">No countries found for this category</p>';
            return;
        }

        resultsContainer.innerHTML = generateCountryGridHTML(countriesForTab);
    }
    
    function generateCountryGridHTML(countriesForTab) {
        let html = '<div class="country-grid">';

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

            let visaInfo = null;
            const passport = selectedPassport;
            const passportData = visaDataFetcher.getVisaDataForPassport(passport);

            if (passportData && passportData[accessType]) {
                const entry = passportData[accessType].find(item => item.country === country);
                if (entry) {
                    visaInfo = entry;
                }
            }

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
    
    function resetResults() {
        accessibleCountries = {
            'visa-free': [],
            'visa-on-arrival': [],
            'e-visa': [],
            'all': []
        };
        resultsContainer.innerHTML = '<p class="empty-state">Select your passport and visas to see available countries</p>';
    }
    
    function calculateAndDisplayResults() {
        if (!selectedPassport) {
            resetResults();
            return;
        }
        
        const countries = calculateAccessibleCountries();
        displayResults(countries);
    }
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentTab = button.dataset.type;
            displayResults(accessibleCountries);
        });
    });

    function addAllTab() {
        const allTab = document.createElement('button');
        allTab.className = 'tab-btn';
        allTab.dataset.type = 'all';
        allTab.textContent = 'All';
        document.querySelector('.results-tabs').prepend(allTab);

        const updatedTabButtons = document.querySelectorAll('.tab-btn');
        updatedTabButtons.forEach(button => {
            button.addEventListener('click', () => {
                updatedTabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                currentTab = button.dataset.type;
                displayResults(accessibleCountries);
            });
        });

        allTab.click();
    }

    addAllTab();
    
    gridViewBtn.addEventListener('click', () => {
        gridViewBtn.classList.add('active');
        mapViewBtn.classList.remove('active');
        gridViewContent.classList.add('active');
        mapViewContent.classList.remove('active');
        currentView = 'grid';
        displayResults(accessibleCountries);
    });
    
    mapViewBtn.addEventListener('click', () => {
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
