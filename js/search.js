function generateSearchResultsHTML(countriesForTab, searchTerm, accessibleCountries, selectedPassport, visaDataFetcher) {
    let html = '<div class="country-grid">';

    countriesForTab.forEach(country => {
        let categoryClass = '';
        let accessType = '';

        if (accessibleCountries['visa-free'].includes(country)) {
            categoryClass = 'visa-free-card';
            accessType = 'visaFree';
        } else if (accessibleCountries['visa-on-arrival'].includes(country)) {
            categoryClass = 'visa-on-arrival-card';
            accessType = 'visaOnArrival';
        } else if (accessibleCountries['e-visa'].includes(country)) { 
            categoryClass = 'e-visa-card';
            accessType = 'eVisa';
        }

        let visaInfo = null;
        const passportData = visaDataFetcher.getVisaDataForPassport(selectedPassport);

        if (passportData && passportData[accessType]) {
            const entry = passportData[accessType].find(item => item.country === country);
            if (entry) visaInfo = entry;
        }

        const tooltipHTML = generateTooltipHTML(country, accessType, visaInfo); // Assumes generateTooltipHTML is global or imported
        const countryCode = countryCodeMapping[country]; // Assumes countryCodeMapping is global
        const flagStyle = countryCode ? `style="--flag-url: url('https://flagcdn.com/${countryCode}.svg');"` : '';

        const countryNameLower = country.toLowerCase();
        const searchTermLower = searchTerm.toLowerCase();
        const isMatch = countryNameLower.includes(searchTermLower);
        const highlightClass = isMatch ? 'country-highlight' : '';
        
        let countryNameHTML = country;
        if (isMatch && searchTerm) { // Ensure searchTerm is not empty
            const startIndex = countryNameLower.indexOf(searchTermLower);
            const endIndex = startIndex + searchTermLower.length; // Use searchTermLower.length
            countryNameHTML = 
                country.substring(0, startIndex) +
                `<span class="match">${country.substring(startIndex, endIndex)}</span>` +
                country.substring(endIndex);
        }

        html += `
            <div class="country-card with-flag-bg ${highlightClass} ${categoryClass}" ${flagStyle}>
                <span>${countryNameHTML}</span>
                ${tooltipHTML}
            </div>
        `;
    });

    html += '</div>';
    return html;
}

function searchInGridView(searchTerm, accessibleCountries, currentTab, resultsContainer, countDisplay, selectedPassport, visaDataFetcher, displayResultsCallback) {
    if (!searchTerm) {
        displayResultsCallback(accessibleCountries.current, 'grid', currentTab, resultsContainer, null, countDisplay, selectedPassport, visaDataFetcher, accessibleCountries);
        updateCountDisplay(accessibleCountries.current, currentTab, countDisplay); // Reset match count
        return;
    }
    
    const countriesForTab = accessibleCountries.current[currentTab];
    if (!countriesForTab || countriesForTab.length === 0) {
        resultsContainer.innerHTML = '<p class="empty-state">No countries to search in this category</p>';
        updateCountDisplay(accessibleCountries.current, currentTab, countDisplay, 0);
        return;
    }
    
    const sortedCountries = [...countriesForTab].sort((a, b) => {
        const aContains = a.toLowerCase().includes(searchTerm.toLowerCase());
        const bContains = b.toLowerCase().includes(searchTerm.toLowerCase());
        if (aContains && !bContains) return -1;
        if (!aContains && bContains) return 1;
        return a.localeCompare(b);
    });
    
    const matchCount = sortedCountries.filter(country => country.toLowerCase().includes(searchTerm.toLowerCase())).length;
    updateCountDisplay(accessibleCountries.current, currentTab, countDisplay, matchCount);
    resultsContainer.innerHTML = generateSearchResultsHTML(sortedCountries, searchTerm, accessibleCountries.current, selectedPassport, visaDataFetcher);
}

function searchInMapView(searchTerm, accessibleCountries, currentTab, mapView, countDisplay) {
    if (!mapView || !mapView.initialized) return;

    const countriesForTab = accessibleCountries.current[currentTab];
    mapView.resetHighlights();
    
    if (!searchTerm) {
        updateCountDisplay(accessibleCountries.current, currentTab, countDisplay);
        mapView.updateData(accessibleCountries.current, currentTab); // Refresh map colors
        return;
    }
    
    if (!countriesForTab) {
        updateCountDisplay(accessibleCountries.current, currentTab, countDisplay, 0);
        return;
    }

    const matchingCountries = countriesForTab.filter(country => 
        country.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    updateCountDisplay(accessibleCountries.current, currentTab, countDisplay, matchingCountries.length);
    mapView.highlightCountries(matchingCountries);
}

function performSearch(searchTerm, currentSearchTermRef, currentView, accessibleCountries, currentTab, resultsContainer, countDisplay, selectedPassport, visaDataFetcher, mapView, displayResultsCallback) {
    currentSearchTermRef.current = searchTerm;
    
    if (currentView === 'grid') {
        searchInGridView(searchTerm, accessibleCountries, currentTab, resultsContainer, countDisplay, selectedPassport, visaDataFetcher, displayResultsCallback);
    } else if (currentView === 'map') {
        searchInMapView(searchTerm, accessibleCountries, currentTab, mapView, countDisplay);
    }
}

function openInlineSearchUI(resultsTabsContainer, inlineSearchContainer, inlineCountrySearch, currentSearchTerm) {
    resultsTabsContainer.classList.add('search-active');
    inlineSearchContainer.classList.add('active');
    inlineCountrySearch.value = currentSearchTerm;
    inlineCountrySearch.focus();
}

function closeInlineSearchUI(resultsTabsContainer, inlineSearchContainer, currentSearchTermRef, accessibleCountries, currentTab, countDisplay, lastActiveTab, tabButtons, displayResultsCallback, selectedPassport, visaDataFetcher, resultsContainer, mapView) {
    resultsTabsContainer.classList.remove('search-active');
    inlineSearchContainer.classList.remove('active');
    currentSearchTermRef.current = '';
    
    updateCountDisplay(accessibleCountries.current, currentTab, countDisplay); // Reset match count
    
    if (lastActiveTab) {
        const tabToActivate = document.querySelector(`.tab-btn[data-type="${lastActiveTab}"]`);
        if (tabToActivate) {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabToActivate.classList.add('active');
            // currentTab is updated by the tab click handler, which should be called
            // Forcing a display update here:
             displayResultsCallback(accessibleCountries.current, 'grid', lastActiveTab, resultsContainer, mapView, countDisplay, selectedPassport, visaDataFetcher, accessibleCountries);
        }
    }
}
