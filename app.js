document.addEventListener('DOMContentLoaded', async function() {
    const passportSelect = document.getElementById('passport-country');
    const visasContainer = document.getElementById('current-visas');
    const resultsContainer = document.getElementById('results-container');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const gridViewBtn = document.getElementById('grid-view-btn');
    const mapViewBtn = document.getElementById('map-view-btn');
    const gridViewContent = document.getElementById('grid-view');
    const mapViewContent = document.getElementById('map-view');
    const searchBtn = document.getElementById('search-countries-btn');
    
    // Replace overlay search with inline search
    const resultsTabsContainer = document.querySelector('.results-tabs');
    const inlineSearchContainer = document.querySelector('.inline-search-container');
    const inlineCountrySearch = document.getElementById('inline-country-search');
    const closeInlineSearchBtn = document.getElementById('close-inline-search-btn');
    
    // Let's track the search term globally
    let currentSearchTerm = '';
    // Track which tab was active before search
    let lastActiveTab = 'all';
    
    // Function to convert country code to flag emoji
    function getFlagEmoji(countryCode) {
        if (!countryCode) return '';
        // For each letter in the country code, get the corresponding regional indicator symbol
        // Regional indicator symbols start at U+1F1E6 for 'A' (ASCII 65)
        const codePoints = [...countryCode.toUpperCase()].map(
            char => 127397 + char.charCodeAt(0)
        );
        // Convert code points to emoji
        return String.fromCodePoint(...codePoints);
    }
    
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
    
    // Set default passport country to India with flag
    const indiaCode = countryCodeMapping['India'];
    const indiaFlag = getFlagEmoji(indiaCode);
    passportSearch.value = `${indiaFlag} India`;
    selectedPassport = 'India';
    
    // Remove disabled class from visas container if it exists
    visasContainer.classList.remove('disabled-container');
    
    // Populate visas and calculate results based on India as default
    setTimeout(() => {
        populateVisas();
        calculateAndDisplayResults();
    }, 100);
    
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
    
    // Simplify map view availability check to only consider screen size
    function isMapViewEnabled() {
        // Only enable map view on larger screens
        return window.innerWidth > 768;
    }

    // Hide map view button if not enabled
    if (!isMapViewEnabled()) {
        mapViewBtn.style.display = 'none';
    }
    
    // Modify the initializeMapView function
    function initializeMapView() {
        if (!isMapViewEnabled()) {
            console.log('Map view is disabled on smaller screens');
            return;
        }
        
        if (typeof jQuery !== 'undefined' && typeof jQuery.fn.vectorMap !== 'undefined') {
            // Create a singleton instance of MapView that will be used
            // throughout the application but won't initialize the map yet
            console.log('Map dependencies loaded, creating MapView instance');
            setTimeout(() => {}, 500);
            if (!mapView) {
                mapView = new MapView('#world-map');
            }
        } else {
            console.warn('jQuery or jVectorMap not loaded yet. Delaying map initialization...');
            setTimeout(initializeMapView, 500);
        }
    }
    
    initializeMapView();

    // Add resize event listener to switch to grid view if window is resized to be small
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768 && currentView === 'map') {
            // Force switch to grid view on small screens
            gridViewBtn.classList.add('active');
            mapViewBtn.classList.remove('active');
            gridViewContent.classList.add('active');
            mapViewContent.classList.remove('active');
            currentView = 'grid';
            displayResults(accessibleCountries);
        }
    });

    // Update the country count display to include search result information
    function updateCountDisplay(countries, matchedCount = null) {
        if (!countries || !countries[currentTab]) {
            countDisplay.textContent = 'No countries found';
            return;
        }
        
        const count = countries[currentTab].length;
        const categoryName = currentTab === 'all' ? 'Total' : 
                            currentTab === 'visa-free' ? 'Visa-Free' :
                            currentTab === 'visa-on-arrival' ? 'Visa on Arrival' : 'e-Visa';
        
        let displayText = `${count} ${categoryName} ${count === 1 ? 'Country' : 'Countries'} Available`;
        
        // If we have search results, add the count of matched countries
        if (matchedCount !== null) {
            displayText += ` (${matchedCount} ${matchedCount === 1 ? 'country' : 'countries'} matched)`;
        }
        
        countDisplay.textContent = displayText;
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

        // If a search term exists, filter by country name without the flag
        const filteredCountries = searchTerm 
            ? allCountries.filter(country => {
                // Remove any existing flag emoji from the search term for comparison
                const cleanSearchTerm = searchTerm.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF] /g, '');
                return country.toLowerCase().includes(cleanSearchTerm.toLowerCase());
              })
            : allCountries;
        
        passportResults.innerHTML = '';
        
        if (filteredCountries.length === 0) {
            passportResults.innerHTML = '<p class="no-results">No matching countries found</p>';
            return;
        }
        
        filteredCountries.forEach(country => {
            const countryItem = document.createElement('div');
            countryItem.className = 'passport-country-item';
            
            // Add flag emoji before the country name
            const countryCode = countryCodeMapping[country];
            const flagEmoji = getFlagEmoji(countryCode);
            countryItem.textContent = `${flagEmoji} ${country}`;
            
            countryItem.addEventListener('click', () => {
                selectedPassport = country;
                // Set the search input value with the flag
                passportSearch.value = `${flagEmoji} ${country}`;
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

    // Add flags to visa checkboxes as well
    function populateVisas() {
        while (visasContainer.firstChild) {
            visasContainer.removeChild(visasContainer.firstChild);
        }
        
        // Get countries directly from countryCodeMapping instead of visaData
        const allCountries = Object.keys(countryCodeMapping).sort();
        
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
            
            // Add flag emoji to visa checkbox label
            const countryCode = countryCodeMapping[country];
            const flagEmoji = getFlagEmoji(countryCode);
            label.textContent = `${flagEmoji} ${country}`;
            
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
        
        // Check if any selected visa is a Schengen country
        const hasSchengenVisa = visas.some(visa => Object.keys(schengenCountries).includes(visa));

        // If a Schengen visa is selected, add all Schengen countries to visa-free countries
        if (hasSchengenVisa) {
            for (const countryName in schengenCountries) {
                result['visa-free'].push(countryName);
            }
        }

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
            if (mapView && mapView.initialized) {
                //console.log('Updating map with new data');
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
            
            // Add flag background using country code
            const countryCode = countryCodeMapping[country];
            const flagStyle = countryCode ? `style="--flag-url: url('https://flagcdn.com/${countryCode}.svg');"` : '';

            html += `
                <div class="country-card with-flag-bg ${categoryClass ? categoryClass.replace('-bar', '-card') : ''}" ${flagStyle}>
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

        // Insert before the first child rather than prepending
        // This ensures the search button stays at the end
        const tabsContainer = document.querySelector('.results-tabs');
        tabsContainer.insertBefore(allTab, tabsContainer.firstChild);

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
        
        // Show search button when in grid view
        searchBtn.style.display = 'flex';
        
        displayResults(accessibleCountries);
        if (currentSearchTerm) {
            performSearch(currentSearchTerm);
        }
    });
    
    mapViewBtn.addEventListener('click', () => {
        if (!isMapViewEnabled()) {
            console.log('Map view is disabled on smaller screens');
            return;
        }
        
        console.log('Map view selected');
        mapViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
        mapViewContent.classList.add('active');
        gridViewContent.classList.remove('active');
        currentView = 'map';
        
        // Temporarily hide search button when in map view
        searchBtn.style.display = 'none';
        
        // Close search if it's open
        if (inlineSearchContainer.classList.contains('active')) {
            closeInlineSearch();
        }
        
        // Initialize and display the map on demand
        if (!mapView) {
            console.log('Creating MapView instance (first time)');
            mapView = new MapView('#world-map');
            mapView.delayedInit();
        } else if (!mapView.initialized) {
            console.log('MapView exists but needs initialization');
            mapView.init();
        } else {
            console.log('MapView already initialized, just updating data');
        }
        
        // This will update the map with current data
        displayResults(accessibleCountries);
        
        // Re-apply search if there was one active
        if (currentSearchTerm) {
            performSearch(currentSearchTerm);
        }
    });
    
    // Add inline search functionality - Fix the event handling for the search button
    searchBtn.addEventListener('click', function(e) {
        // Prevent any potential bubbling issues
        e.stopPropagation();
        
        // Store the current active tab
        lastActiveTab = currentTab;
        
        // Hide tabs and search button, show search input
        resultsTabsContainer.classList.add('search-active');
        inlineSearchContainer.classList.add('active');
        inlineCountrySearch.focus();
        
        // Set search value to current search term if any
        inlineCountrySearch.value = currentSearchTerm;
    });
    
    // Fix the issue with clicking on the icon within the button
    // Add a separate event listener for the icon inside the button
    if (searchBtn.querySelector('i')) {
        searchBtn.querySelector('i').addEventListener('click', function(e) {
            // Stop propagation to prevent this click from bubbling
            e.stopPropagation();
            
            // Manually trigger a click on the parent button
            searchBtn.click();
        });
    }

    // Close inline search
    function closeInlineSearch() {
        // Hide search input, show tabs
        resultsTabsContainer.classList.remove('search-active');
        inlineSearchContainer.classList.remove('active');
        
        // Reset the search term
        currentSearchTerm = '';
        
        // Reset the count display to show without matches
        updateCountDisplay(accessibleCountries);
        
        // Restore the active tab that was selected before searching
        if (lastActiveTab) {
            const tabToActivate = document.querySelector(`.tab-btn[data-type="${lastActiveTab}"]`);
            if (tabToActivate) {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabToActivate.classList.add('active');
                currentTab = lastActiveTab;
                displayResults(accessibleCountries);
            }
        }
    }
    
    closeInlineSearchBtn.addEventListener('click', closeInlineSearch);
    
    // Close search on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && inlineSearchContainer.classList.contains('active')) {
            closeInlineSearch();
        }
    });
    
    // Close search when clicking outside
    document.addEventListener('click', (e) => {
        if (inlineSearchContainer.classList.contains('active') && 
            !inlineSearchContainer.contains(e.target) && 
            !searchBtn.contains(e.target) && // Ensure clicking search button itself doesn't close
            !searchBtn.querySelector('i')?.contains(e.target) // Ensure clicking icon in search button doesn't close
           ) {
            closeInlineSearch();
        }
    });
    
    // Perform search as user types in the inline search
    inlineCountrySearch.addEventListener('input', () => {
        const searchTerm = inlineCountrySearch.value.trim().toLowerCase();
        performSearch(searchTerm);
    });
    
    // Update the function references to use inline search instead of overlay
    function performSearch(searchTerm) {
        currentSearchTerm = searchTerm;
        
        if (currentView === 'grid') {
            searchInGridView(searchTerm);
        } else if (currentView === 'map') {
            searchInMapView(searchTerm);
        }
    }

    function searchInGridView(searchTerm) {
        if (!searchTerm) {
            // If search term is empty, reset to the original display order
            displayResults(accessibleCountries);
            return;
        }
        
        // Get the countries for the current tab
        const countriesForTab = accessibleCountries[currentTab];
        
        if (countriesForTab.length === 0) {
            return;
        }
        
        // Create a new array for sorting countries by match
        const sortedCountries = [...countriesForTab].sort((a, b) => {
            const aContains = a.toLowerCase().includes(searchTerm.toLowerCase());
            const bContains = b.toLowerCase().includes(searchTerm.toLowerCase());
            
            if (aContains && !bContains) return -1;
            if (!aContains && bContains) return 1;
            return a.localeCompare(b);
        });
        
        // Count how many countries matched the search term
        const matchCount = sortedCountries.filter(country => 
            country.toLowerCase().includes(searchTerm.toLowerCase())
        ).length;
        
        // Update the count display to show the match count
        updateCountDisplay(accessibleCountries, matchCount);
        
        // Generate new HTML with reordered countries and highlighting
        resultsContainer.innerHTML = generateSearchResultsHTML(sortedCountries, searchTerm);
    }

    function generateSearchResultsHTML(countriesForTab, searchTerm) {
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
            
            // Add flag background using country code
            const countryCode = countryCodeMapping[country];
            const flagStyle = countryCode ? `style="--flag-url: url('https://flagcdn.com/${countryCode}.svg');"` : '';

            // Check if the country name contains the search term
            const countryNameLower = country.toLowerCase();
            const searchTermLower = searchTerm.toLowerCase();
            const isMatch = countryNameLower.includes(searchTermLower);
            const highlightClass = isMatch ? 'country-highlight' : '';
            
            // Create highlighted country name with search term underlined
            let countryNameHTML = country;
            if (isMatch) {
                const startIndex = countryNameLower.indexOf(searchTermLower);
                const endIndex = startIndex + searchTerm.length;
                countryNameHTML = 
                    country.substring(0, startIndex) +
                    `<span class="match">${country.substring(startIndex, endIndex)}</span>` +
                    country.substring(endIndex);
            }

            html += `
                <div class="country-card with-flag-bg ${highlightClass} ${categoryClass ? categoryClass.replace('-bar', '-card') : ''}" ${flagStyle}>
                    <span>${countryNameHTML}</span>
                    ${tooltipHTML}
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    function searchInMapView(searchTerm) {
        if (!mapView || !mapView.initialized) return;

        // Get all countries in the current tab
        const countriesForTab = accessibleCountries[currentTab];
        
        // Reset all highlights first
        mapView.resetHighlights();
        
        if (!searchTerm) {
            // Reset the count display when search is cleared
            updateCountDisplay(accessibleCountries);
            return;
        }
        
        // Find matching countries
        const matchingCountries = countriesForTab.filter(country => 
            country.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        // Update the count display with the number of matched countries
        updateCountDisplay(accessibleCountries, matchingCountries.length);
        
        // Highlight matching countries on map
        mapView.highlightCountries(matchingCountries);
    }
});
