function populatePassportResults(searchTerm = '', visaDataFetcher, passportResultsElement, passportSearchElement, onPassportSelectedCallback) {
    const visaData = visaDataFetcher.visaData;
    if (!visaData) {
        console.error('Visa data not loaded for passport results');
        passportResultsElement.innerHTML = '<p class="no-results">Data not available</p>';
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

    const cleanSearchTerm = searchTerm.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF] /g, '').toLowerCase();
    const filteredCountries = cleanSearchTerm
        ? allCountries.filter(country => country.toLowerCase().includes(cleanSearchTerm))
        : allCountries;
    
    passportResultsElement.innerHTML = '';
    
    if (filteredCountries.length === 0) {
        passportResultsElement.innerHTML = '<p class="no-results">No matching countries found</p>';
        return;
    }
    
    filteredCountries.forEach(country => {
        const countryItem = document.createElement('div');
        countryItem.className = 'passport-country-item';
        
        const countryCode = countryCodeMapping[country];
        const flagEmoji = getFlagEmoji(countryCode); // Assumes getFlagEmoji is global or imported
        countryItem.textContent = `${flagEmoji} ${country}`;
        
        countryItem.addEventListener('click', () => {
            onPassportSelectedCallback(country, `${flagEmoji} ${country}`);
            passportResultsElement.style.display = 'none';
        });
        passportResultsElement.appendChild(countryItem);
    });
    
    passportResultsElement.style.display = 'block';
}

function populateVisas(visasContainer, selectedPassport, countryCodeMappingData, calculateAndDisplayResultsCallback) {
    while (visasContainer.firstChild) {
        visasContainer.removeChild(visasContainer.firstChild);
    }
    
    const allCountries = Object.keys(countryCodeMappingData).sort();
    
    const searchBox = document.createElement('input');
    searchBox.type = 'text';
    searchBox.placeholder = 'Search visas...';
    searchBox.className = 'search-box'; // Existing class for styling
    visasContainer.appendChild(searchBox);
    
    const visaItemsContainer = document.createElement('div'); // Container for actual visa items for scrolling
    visasContainer.appendChild(visaItemsContainer);

    allCountries.forEach(country => {
        if (country === selectedPassport) return;
        
        const checkboxItem = document.createElement('div');
        checkboxItem.className = 'checkbox-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = country;
        checkbox.id = `visa-${country.replace(/\s+/g, '-').toLowerCase()}`;
        checkbox.addEventListener('change', calculateAndDisplayResultsCallback);
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        const countryCode = countryCodeMappingData[country];
        const flagEmoji = getFlagEmoji(countryCode); // Assumes getFlagEmoji is global
        label.textContent = `${flagEmoji} ${country}`;
        
        checkboxItem.appendChild(checkbox);
        checkboxItem.appendChild(label);
        visaItemsContainer.appendChild(checkboxItem);
    });
    
    searchBox.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const checkboxItems = visaItemsContainer.querySelectorAll('.checkbox-item');
        
        checkboxItems.forEach(item => {
            const label = item.querySelector('label');
            const countryName = label.textContent.toLowerCase();
            item.style.display = countryName.includes(searchTerm) ? '' : 'none';
        });
    });
}

function calculateAccessibleCountries(selectedPassport, visasContainer, visaDataFetcher, schengenCountriesData, countryCodeMappingData) {
    const passport = selectedPassport;
    const visas = Array.from(visasContainer.querySelectorAll('input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
    
    const result = { 'visa-free': [], 'visa-on-arrival': [], 'e-visa': [], 'all': [] };
    const passportData = visaDataFetcher.getVisaDataForPassport(passport);
    
    if (passportData) {
        if (passportData.visaFree) result['visa-free'] = passportData.visaFree.map(e => e.country);
        if (passportData.visaOnArrival) result['visa-on-arrival'] = passportData.visaOnArrival.map(e => e.country);
        if (passportData.eVisa) result['e-visa'] = passportData.eVisa.map(e => e.country);
        
        if (passportData.additionalAccess) {
            visas.forEach(visa => {
                if (passportData.additionalAccess[visa]) {
                    const acc = passportData.additionalAccess[visa];
                    if (acc.visaFree) result['visa-free'].push(...acc.visaFree.map(e => e.country));
                    if (acc.visaOnArrival) result['visa-on-arrival'].push(...acc.visaOnArrival.map(e => e.country));
                    if (acc.eVisa) result['e-visa'].push(...acc.eVisa.map(e => e.country));
                }
            });
        }
    }
    
    visas.forEach(visa => {
        const visaKey = visa + " Visa";
        const generalVisaData = visaDataFetcher.getGeneralVisaAccess(visaKey);
        if (generalVisaData && generalVisaData.visaFreeWithThisVisa) {
            result['visa-free'].push(...generalVisaData.visaFreeWithThisVisa.map(e => e.country));
        }
    });
    
    if (visas.some(visa => Object.keys(schengenCountriesData).includes(visa))) {
        result['visa-free'].push(...Object.keys(schengenCountriesData));
    }

    const validCountries = Object.keys(countryCodeMappingData);
    Object.keys(result).forEach(type => {
        if (type === 'all') return;
        result[type] = [...new Set(result[type])]
            .filter(country => validCountries.includes(country) && country !== passport)
            .sort();
    });

    result['all'] = [...new Set([...result['visa-free'], ...result['visa-on-arrival'], ...result['e-visa']])].sort();
    return result;
}

function populateCountryDropdownsInitially(visaDataFetcher, onPassportSelectedCallback) {
    // This function was originally used to populate a <select>
    // Now it's used to ensure passport search results can be populated on focus/input
    // The initial call to populatePassportResults for default display can be done in main app.js
    // For now, this function can just ensure data is ready or log.
    // The actual population happens via event listeners on passportSearch input.
    if (!visaDataFetcher.visaData) {
        console.error('Visa data not loaded for initial dropdown population.');
    }
    // Call populatePassportResults with no search term to show all initially if needed,
    // but this is usually triggered by focus on the search input.
}
