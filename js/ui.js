function updateCountDisplay(countries, currentTab, countDisplayElement, matchedCount = null) {
    if (!countries || !countries[currentTab]) {
        countDisplayElement.textContent = 'No countries found';
        return;
    }
    
    const count = countries[currentTab].length;
    const categoryName = currentTab === 'all' ? 'Total' : 
                        currentTab === 'visa-free' ? 'Visa-Free' :
                        currentTab === 'visa-on-arrival' ? 'Visa on Arrival' : 'e-Visa';
    
    let displayText = `${count} ${categoryName} ${count === 1 ? 'Country' : 'Countries'} Available`;
    
    if (matchedCount !== null) {
        displayText += ` (${matchedCount} ${matchedCount === 1 ? 'country' : 'countries'} matched)`;
    }
    
    countDisplayElement.textContent = displayText;
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
        if (visaInfo.source) {
            tooltipHTML += `<p><span class="tooltip-label">Source:</span> <a href="${visaInfo.source}" target="_blank" rel="noopener noreferrer">${visaInfo.source.replace(/^https?:\/\//i, '')}</a></p>`;
        }
        if (visaInfo.lastChecked) {
            tooltipHTML += `<p><span class="tooltip-label">Last Checked:</span> ${visaInfo.lastChecked}</p>`;
        }
    } else {
        tooltipHTML += '<p>No detailed information available</p>';
    }
    
    tooltipHTML += '</div>';
    return tooltipHTML;
}

function generateCountryGridHTML(countriesForTab, accessibleCountries, selectedPassport, visaDataFetcher) {
    let html = '<div class="country-grid">';

    countriesForTab.forEach(country => {
        let categoryClass = '';
        let accessType = '';

        if (accessibleCountries['visa-free'].includes(country)) {
            categoryClass = 'visa-free-bar'; // This class is not defined, should be visa-free-card
            accessType = 'visaFree';
        } else if (accessibleCountries['visa-on-arrival'].includes(country)) {
            categoryClass = 'visa-on-arrival-bar'; // Should be visa-on-arrival-card
            accessType = 'visaOnArrival';
        } else if (accessibleCountries['e-visa'].includes(country)) { 
            categoryClass = 'e-visa-bar'; // Should be e-visa-card
            accessType = 'eVisa';
        }

        let visaInfo = null;
        const passportData = visaDataFetcher.getVisaDataForPassport(selectedPassport);

        if (passportData && passportData[accessType]) {
            const entry = passportData[accessType].find(item => item.country === country);
            if (entry) {
                visaInfo = entry;
            }
        }

        const tooltipHTML = generateTooltipHTML(country, accessType, visaInfo);
        const countryCode = countryCodeMapping[country];
        const flagStyle = countryCode ? `style="--flag-url: url('https://flagcdn.com/${countryCode}.svg');"` : '';
        // Corrected card class based on access type
        let cardClass = '';
        if (accessType === 'visaFree') cardClass = 'visa-free-card';
        else if (accessType === 'visaOnArrival') cardClass = 'visa-on-arrival-card';
        else if (accessType === 'eVisa') cardClass = 'e-visa-card';


        html += `
            <div class="country-card with-flag-bg ${cardClass}" ${flagStyle}>
                <span>${country}</span>
                ${tooltipHTML}
            </div>
        `;
    });

    html += '</div>';
    return html;
}


function displayResults(countries, currentView, currentTab, resultsContainer, mapView, countDisplay, selectedPassport, visaDataFetcher, accessibleCountriesRef) {
    accessibleCountriesRef.current = countries; // Update the shared accessibleCountries object/value

    updateCountDisplay(countries, currentTab, countDisplay);
    
    if (currentView === 'map' && isMapViewEnabled()) {
        if (mapView && mapView.initialized) {
            mapView.updateData(countries, currentTab);
        }
        return;
    }

    const countriesForTab = countries[currentTab];

    if (!countriesForTab || countriesForTab.length === 0) {
        resultsContainer.innerHTML = '<p class="empty-state">No countries found for this category</p>';
        return;
    }

    resultsContainer.innerHTML = generateCountryGridHTML(countriesForTab, countries, selectedPassport, visaDataFetcher);
}


function resetResults(resultsContainer, accessibleCountriesRef) {
    accessibleCountriesRef.current = {
        'visa-free': [],
        'visa-on-arrival': [],
        'e-visa': [],
        'all': []
    };
    resultsContainer.innerHTML = '<p class="empty-state">Select your passport and visas to see available countries</p>';
}


function addAllTabToDOM(resultsTabsContainer, onTabClickCallback) {
    const allTab = document.createElement('button');
    allTab.className = 'tab-btn';
    allTab.dataset.type = 'all';
    allTab.textContent = 'All';

    resultsTabsContainer.insertBefore(allTab, resultsTabsContainer.firstChild);
    
    // Re-query tab buttons and attach event listeners
    const updatedTabButtons = resultsTabsContainer.querySelectorAll('.tab-btn:not(.search-tab-btn)'); // Exclude search button
    updatedTabButtons.forEach(button => {
        button.removeEventListener('click', onTabClickCallback); // Remove old listener if any
        button.addEventListener('click', onTabClickCallback);
    });

    return {allTab, updatedTabButtons}; // Return new tab and updated list
}


function isMapViewEnabled() {
    return window.innerWidth > 768;
}

function initializeMapViewLogic(mapViewInstance, worldMapSelector) {
    if (!isMapViewEnabled()) {
        console.log('Map view is disabled on smaller screens');
        return null;
    }
    
    if (typeof jQuery !== 'undefined' && typeof jQuery.fn.vectorMap !== 'undefined') {
        if (!mapViewInstance) {
            console.log('Map dependencies loaded, creating MapView instance');
            return new MapView(worldMapSelector);
        }
        return mapViewInstance;
    } else {
        console.warn('jQuery or jVectorMap not loaded yet. Delaying map initialization...');
        setTimeout(() => initializeMapViewLogic(mapViewInstance, worldMapSelector), 500); // Recursive call with delay
        return null; // Return null for now, will be created later
    }
}
