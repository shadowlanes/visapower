class MapView {
    constructor(mapElementId) {
        this.mapElementId = mapElementId;
        this.accessibleCountries = {
            'visa-free': [],
            'visa-on-arrival': [],
            'e-visa': []
        };
        this.countryAccessMap = {};
        this.currentTab = 'visa-free';
        this.initialized = false;
        this.highlightedCountries = [];
        
        // Define colors for different access types
        this.colors = {
            'visa-free': '#2ecc71',      // Green
            'visa-on-arrival': '#f39c12', // Orange
            'e-visa': '#3498db',          // Blue
            'no-access': '#e0e0e0'        // Light gray
        };
        
    }
    
    delayedInit() {
        // Wait a moment to ensure the DOM is fully loaded
        setTimeout(() => {
            const $mapContainer = $(this.mapElementId);
            if ($mapContainer.is(':visible') && $mapContainer.width() > 0) {
                this.init();
            } else {
                console.log('Map container not visible yet, deferring initialization');
            }
        }, 100);
    }
    
    init() {
        if (this.initialized) {
            console.log('Map already initialized, skipping');
            return;
        }

        try {
            // Ensure the map container is visible with proper dimensions
            const $mapContainer = $(this.mapElementId);
            $mapContainer.css({
                'display': 'block',
                'width': '100%',
                'height': '400px',
                'min-height': '400px'
            });

            // Force a reflow to apply dimensions
            $mapContainer[0].offsetHeight;

            console.log('Initializing map with dimensions:', 
                $mapContainer.width(), 'x', $mapContainer.height());

            // Initialize the map using jqvmap
            $mapContainer.vectorMap({
                map: 'world_en',
                backgroundColor: '#f8f9fa',
                borderColor: '#ffffff',
                borderOpacity: 0.25,
                borderWidth: 1,
                color: this.colors['no-access'],
                hoverOpacity: 0.7,
                selectedColor: '#666666',
                enableZoom: false,
                showTooltip: true,
                onRegionTipShow: (e, el, code) => this.showTooltip(e, el, code),
                onRegionClick: function(element, code, region)
                    {
                        var message = 'You clicked "'
                            + region
                            + '" which has the code: '
                            + code.toUpperCase();

                        console.log(message);
                    }
            });
            
            this.initialized = true;
            console.log('Map initialized successfully');
        } catch (error) {
            console.error('Error initializing map:', error);
        }
    }
    
    // Update the map with new data
    updateData(accessibleCountries, currentTab) {
        this.accessibleCountries = accessibleCountries;
        this.currentTab = currentTab;
        
        // If not initialized yet, initialize first
        if (!this.initialized) {
            console.log('Map not initialized yet, initializing now');
            this.init();
        }
        
        this.updateCountryAccessMap();
        this.updateMapColors();
    }
    
    // Generate a map of country codes to their access status
    updateCountryAccessMap() {
        this.countryAccessMap = {};
        
        // Mapping for visa-free countries
        this.accessibleCountries['visa-free'].forEach(country => {
            const countryCode = this.getCountryCode(country);
            if (countryCode) {
                this.countryAccessMap[countryCode] = 'visa-free';
            }
        });
        
        // Mapping for visa-on-arrival countries
        this.accessibleCountries['visa-on-arrival'].forEach(country => {
            const countryCode = this.getCountryCode(country);
            if (countryCode) {
                this.countryAccessMap[countryCode] = 'visa-on-arrival';
            }
        });
        
        // Mapping for e-visa countries
        this.accessibleCountries['e-visa'].forEach(country => {
            const countryCode = this.getCountryCode(country);
            if (countryCode) {
                this.countryAccessMap[countryCode] = 'e-visa';
            }
        });
        
        return this.countryAccessMap;
    }
    
    // Reset all highlighted countries
    resetHighlights() {
        if (!this.initialized || !this.highlightedCountries.length) return;
        
        try {
            // Remove custom styles from previously highlighted countries
            const mapObject = $(this.mapElementId).vectorMap('get', 'mapObject');
            
            this.highlightedCountries.forEach(country => {
                const countryCode = this.getCountryCode(country);
                if (!countryCode) return;
                
                // Reset the country to its original color based on access type
                const accessType = this.countryAccessMap[countryCode] || 'no-access';
                const color = this.colors[accessType];
                
                // Update the country color
                if (mapObject && mapObject.regions[countryCode]) {
                    mapObject.regions[countryCode].element.setStyle('fill', color);
                    
                    // Reset any custom stroke
                    mapObject.regions[countryCode].element.setStyle('stroke', '#ffffff');
                    mapObject.regions[countryCode].element.setStyle('stroke-width', 1);
                }
            });
            
            // Clear the list of highlighted countries
            this.highlightedCountries = [];
        } catch (error) {
            console.error('Error resetting map highlights:', error);
        }
    }
    
    // Highlight specific countries on the map
    highlightCountries(countries) {
        if (!this.initialized) return;
        
        try {
            const mapObject = $(this.mapElementId).vectorMap('get', 'mapObject');
            
            countries.forEach(country => {
                const countryCode = this.getCountryCode(country);
                if (!countryCode || !mapObject.regions[countryCode]) return;
                
                // Add visual highlighting to the country
                mapObject.regions[countryCode].element.setStyle('stroke', '#FFC107');
                mapObject.regions[countryCode].element.setStyle('stroke-width', 1.5);
                
                // Make the fill color brighter
                const accessType = this.countryAccessMap[countryCode] || 'no-access';
                let color = this.colors[accessType];
                
                // Brighten the color by converting to RGB and increasing values
                const brightenColor = (color) => {
                    // Convert hex to RGB
                    const hex = color.replace('#', '');
                    const r = parseInt(hex.substring(0, 2), 16);
                    const g = parseInt(hex.substring(2, 4), 16);
                    const b = parseInt(hex.substring(4, 6), 16);
                    
                    // Brighten by 20%
                    const factor = 1.2;
                    const newR = Math.min(255, Math.floor(r * factor));
                    const newG = Math.min(255, Math.floor(g * factor));
                    const newB = Math.min(255, Math.floor(b * factor));
                    
                    // Convert back to hex
                    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
                };
                
                mapObject.regions[countryCode].element.setStyle('fill', brightenColor(color));
            });
            
            // Store the list of highlighted countries
            this.highlightedCountries = [...countries];
        } catch (error) {
            console.error('Error highlighting countries on map:', error);
        }
    }
    
    // Update map colors and keep highlights if any
    updateMapColors() {
        if (!this.initialized) {
            console.warn('Map not fully initialized, cannot set colors');
            return;
        }

        console.log(`Updating map colors for tab: ${this.currentTab}`);
        
        // Store highlighted countries to reapply highlighting after color update
        const highlightedCountries = [...this.highlightedCountries];
        
        // Reset colors by setting all countries to no-access first
        let allCountryCodes = {};
        for (let code in countryCodeMapping) {
            const isoCode = countryCodeMapping[code].toLowerCase();
            allCountryCodes[isoCode] = this.colors['no-access'];
        }

        // Then apply the colors based on current tab and country access
        Object.keys(this.countryAccessMap).forEach(countryCode => {
            const accessType = this.countryAccessMap[countryCode];
            
            if (this.currentTab === 'all') {
                // For 'all' tab, show all countries with their respective colors
                allCountryCodes[countryCode] = this.colors[accessType];
            } else if (this.currentTab === accessType) {
                // For specific tabs, only highlight countries matching that access type
                allCountryCodes[countryCode] = this.colors[accessType];
            }
            // Otherwise leave as no-access (already set above)
        });

        try {
            // Update the map colors using the correct jQVMap API method
            $(this.mapElementId).vectorMap('set', 'colors', allCountryCodes);
            
            // Reapply any highlights
            if (highlightedCountries.length > 0) {
                this.highlightCountries(highlightedCountries);
            }
        } catch (error) {
            console.error('Error updating map colors:', error);
        }
    }
    
    // Custom tooltip for hover
    showTooltip(e, el, code) {
        let accessType = this.countryAccessMap[code] || 'no-access';
        let countryName = el.html();
        
        let accessText;
        switch(accessType) {
            case 'visa-free':
                accessText = 'Visa Free';
                break;
            case 'visa-on-arrival':
                accessText = 'Visa on Arrival';
                break;
            case 'e-visa':
                accessText = 'e-Visa Required';
                break;
            default:
                accessText = 'No Access / Visa Required';
        }
        
        el.html(`${countryName}: ${accessText}`);
    }
    
    // Helper function to convert country names to country codes
     getCountryCode(countryName) {
        return countryCodeMapping[countryName];
    }
}
