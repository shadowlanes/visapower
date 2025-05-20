document.addEventListener('DOMContentLoaded', async function() {
    // DOM Elements
    const visasContainer = document.getElementById('current-visas');
    const resultsContainer = document.getElementById('results-container');
    let initialTabButtons = Array.from(document.querySelectorAll('.tab-btn:not(.search-tab-btn)')); // Exclude search button
    const gridViewBtn = document.getElementById('grid-view-btn');
    const mapViewBtn = document.getElementById('map-view-btn');
    const gridViewContent = document.getElementById('grid-view');
    const mapViewContent = document.getElementById('map-view');
    const searchBtn = document.getElementById('search-countries-btn');
    const resultsTabsContainer = document.querySelector('.results-tabs');
    const inlineSearchContainer = document.querySelector('.inline-search-container');
    const inlineCountrySearch = document.getElementById('inline-country-search');
    const closeInlineSearchBtn = document.getElementById('close-inline-search-btn');
    const passportSearchInput = document.getElementById('passport-search'); // Assuming new ID for the input
    const passportResultsContainer = document.querySelector('.passport-results'); // Assuming new class/ID
    const countDisplayElement = document.querySelector('.country-count-display'); // Created dynamically, ensure it exists or handle creation

    // State Variables
    let selectedPassport = ''; // Will be set by default or user interaction
    let currentTab = 'all'; // Default to 'all' after addAllTab
    let currentView = 'grid';
    let accessibleCountries = { current: { 'visa-free': [], 'visa-on-arrival': [], 'e-visa': [], 'all': [] } }; // Use .current for mutable ref
    let currentSearchTerm = { current: '' };
    let lastActiveTab = 'all';
    let mapView = null;
    let visaDataFetcher;

    // Create count display element if not in HTML
    let dynamicCountDisplay = countDisplayElement;
    if (!dynamicCountDisplay) {
        dynamicCountDisplay = document.createElement('div');
        dynamicCountDisplay.className = 'country-count-display';
        resultsTabsContainer.after(dynamicCountDisplay);
    }
    
    // Initialize VisaDataFetcher
    try {
        visaDataFetcher = new VisaDataFetcher();
    } catch (error) {
        console.error('Failed to initialize VisaDataFetcher:', error);
        showErrorMessage('Failed to initialize. Please try again later.', resultsContainer);
        return;
    }

    // --- Core Calculation and Display Logic ---
    function calculateAndDisplayResultsMain() {
        if (!selectedPassport) {
            resetResults(resultsContainer, accessibleCountries);
            updateCountDisplay(accessibleCountries.current, currentTab, dynamicCountDisplay);
            return;
        }
        const countries = calculateAccessibleCountries(selectedPassport, visasContainer, visaDataFetcher, schengenCountries, countryCodeMapping);
        displayResults(countries, currentView, currentTab, resultsContainer, mapView, dynamicCountDisplay, selectedPassport, visaDataFetcher, accessibleCountries);
        // If a search is active, re-apply it
        if (currentSearchTerm.current) {
            performSearch(currentSearchTerm.current, currentSearchTerm, currentView, accessibleCountries, currentTab, resultsContainer, dynamicCountDisplay, selectedPassport, visaDataFetcher, mapView, displayResults);
        }
    }

    // --- Passport Selection Logic ---
    const passportSelectContainer = document.getElementById('passport-country').parentElement; // Original select
    const newPassportSearchContainer = document.createElement('div');
    newPassportSearchContainer.className = 'passport-search-container';
    const newPassportSearchInput = document.createElement('input');
    newPassportSearchInput.type = 'text';
    newPassportSearchInput.id = 'passport-search'; // Make sure this ID is unique and used by CSS
    newPassportSearchInput.className = 'search-box'; // Use existing class for styling
    newPassportSearchInput.placeholder = 'Search for your passport country...';
    const newPassportResults = document.createElement('div');
    newPassportResults.className = 'passport-results';
    newPassportSearchContainer.appendChild(newPassportSearchInput);
    newPassportSearchContainer.appendChild(newPassportResults);
    passportSelectContainer.replaceChild(newPassportSearchContainer, document.getElementById('passport-country'));

    function handlePassportSelected(countryName, displayValue) {
        selectedPassport = countryName;
        newPassportSearchInput.value = displayValue;
        visasContainer.classList.remove('disabled-container');
        populateVisas(visasContainer, selectedPassport, countryCodeMapping, calculateAndDisplayResultsMain);
        calculateAndDisplayResultsMain();
    }

    newPassportSearchInput.addEventListener('focus', () => {
        populatePassportResults(newPassportSearchInput.value, visaDataFetcher, newPassportResults, newPassportSearchInput, handlePassportSelected);
    });
    newPassportSearchInput.addEventListener('input', () => {
        populatePassportResults(newPassportSearchInput.value, visaDataFetcher, newPassportResults, newPassportSearchInput, handlePassportSelected);
    });
    document.addEventListener('click', (e) => {
        if (!newPassportSearchInput.contains(e.target) && !newPassportResults.contains(e.target)) {
            newPassportResults.style.display = 'none';
        }
    });
    
    // --- Tab Handling ---
    const tabClickHandler = (event) => {
        const button = event.currentTarget; // Use currentTarget
        const allButtons = resultsTabsContainer.querySelectorAll('.tab-btn:not(.search-tab-btn)');
        allButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentTab = button.dataset.type;
        lastActiveTab = currentTab; // Update lastActiveTab when a tab is explicitly clicked
        calculateAndDisplayResultsMain(); // This will re-apply search if active
    };
    
    const { allTab: newAllTab, updatedTabButtons: allTabsAfterAdd } = addAllTabToDOM(resultsTabsContainer, tabClickHandler);
    initialTabButtons = allTabsAfterAdd; // Update the reference to all tab buttons

    // --- View Switching ---
    gridViewBtn.addEventListener('click', () => {
        currentView = 'grid';
        gridViewBtn.classList.add('active');
        mapViewBtn.classList.remove('active');
        gridViewContent.classList.add('active');
        mapViewContent.classList.remove('active');
        searchBtn.style.display = 'flex';
        calculateAndDisplayResultsMain();
    });

    mapViewBtn.addEventListener('click', () => {
        if (!isMapViewEnabled()) return;
        currentView = 'map';
        mapViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
        mapViewContent.classList.add('active');
        gridViewContent.classList.remove('active');
        searchBtn.style.display = 'none';
        if (inlineSearchContainer.classList.contains('active')) {
            closeInlineSearchUI(resultsTabsContainer, inlineSearchContainer, currentSearchTerm, accessibleCountries, currentTab, dynamicCountDisplay, lastActiveTab, initialTabButtons, displayResults, selectedPassport, visaDataFetcher, resultsContainer, mapView);
        }
        if (!mapView) mapView = initializeMapViewLogic(mapView, '#world-map');
        if (mapView && !mapView.initialized) mapView.init();
        calculateAndDisplayResultsMain();
    });

    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768 && currentView === 'map') {
            gridViewBtn.click(); // Simulate click to switch to grid view
        }
        // Adjust map view button visibility
        mapViewBtn.style.display = isMapViewEnabled() ? 'flex' : 'none';
        if (!isMapViewEnabled() && currentView === 'map') {
             gridViewBtn.click();
        }
    });
    mapViewBtn.style.display = isMapViewEnabled() ? 'flex' : 'none'; // Initial check

    // --- Search Functionality ---
    searchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        lastActiveTab = currentTab; // Store current tab before opening search
        openInlineSearchUI(resultsTabsContainer, inlineSearchContainer, inlineCountrySearch, currentSearchTerm.current);
    });
    if (searchBtn.querySelector('i')) {
        searchBtn.querySelector('i').addEventListener('click', (e) => {
            e.stopPropagation();
            searchBtn.click();
        });
    }

    closeInlineSearchBtn.addEventListener('click', () => {
        currentTab = lastActiveTab; // Restore tab before closing search
        closeInlineSearchUI(resultsTabsContainer, inlineSearchContainer, currentSearchTerm, accessibleCountries, currentTab, dynamicCountDisplay, lastActiveTab, initialTabButtons, displayResults, selectedPassport, visaDataFetcher, resultsContainer, mapView);
        // Ensure the correct tab is visually active and results are updated
        const tabToActivate = document.querySelector(`.tab-btn[data-type="${currentTab}"]`);
        if (tabToActivate) {
            initialTabButtons.forEach(btn => btn.classList.remove('active'));
            tabToActivate.classList.add('active');
        }
        calculateAndDisplayResultsMain(); // Recalculate/display for the restored tab
    });
    
    inlineCountrySearch.addEventListener('input', () => {
        performSearch(inlineCountrySearch.value.trim().toLowerCase(), currentSearchTerm, currentView, accessibleCountries, currentTab, resultsContainer, dynamicCountDisplay, selectedPassport, visaDataFetcher, mapView, displayResults);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && inlineSearchContainer.classList.contains('active')) {
            closeInlineSearchBtn.click(); // Simulate click on close button
        }
    });
    document.addEventListener('click', (e) => {
        if (inlineSearchContainer.classList.contains('active') &&
            !inlineSearchContainer.contains(e.target) &&
            !searchBtn.contains(e.target) &&
            !searchBtn.querySelector('i')?.contains(e.target)) {
            closeInlineSearchBtn.click(); // Simulate click on close button
        }
    });

    // --- Initial Setup ---
    populateCountryDropdownsInitially(visaDataFetcher, handlePassportSelected); // Ensures data is loaded
    
    // Set default passport to India
    const indiaCode = countryCodeMapping['India'];
    const indiaFlag = getFlagEmoji(indiaCode);
    handlePassportSelected('India', `${indiaFlag} India`); // This will trigger populateVisas and calculateAndDisplayResultsMain

    if (newAllTab) newAllTab.click(); // Activate 'All' tab by default
    else if(initialTabButtons.length > 0) initialTabButtons[0].click(); // Fallback if allTab isn't immediately ready

    // Initialize map view if enabled
    if (isMapViewEnabled()) {
         mapView = initializeMapViewLogic(mapView, '#world-map');
    }
});
