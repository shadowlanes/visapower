class MapView {
    constructor(mapElementId) {
        this.mapElementId = mapElementId;
        this.map = null;
        this.accessibleCountries = {
            'visa-free': [],
            'visa-on-arrival': [],
            'e-visa': []
        };
        this.countryAccessMap = {};
        this.currentTab = 'visa-free';
        
        // Define colors for different access types
        this.colors = {
            'visa-free': '#2ecc71',      // Green
            'visa-on-arrival': '#f39c12', // Orange
            'e-visa': '#3498db',          // Blue
            'no-access': '#e0e0e0'        // Light gray
        };
        
        this.init();
    }
    
    init() {
        try {
            // Initialize the map using jqvmap
            $(this.mapElementId).vectorMap({
                map: 'world_en',
                backgroundColor: '#f8f9fa',
                borderColor: '#ffffff',
                borderOpacity: 0.25,
                borderWidth: 1,
                color: this.colors['no-access'],
                hoverOpacity: 0.7,
                selectedColor: '#666666',
                enableZoom: true,
                showTooltip: true,
                onRegionTipShow: (e, el, code) => this.showTooltip(e, el, code)
            });
            
            this.map = $(this.mapElementId).vectorMap('get', 'mapObject');
            console.log('Map initialized successfully');
        } catch (error) {
            console.error('Error initializing map:', error);
        }
    }
    
    // Update the map with new data
    updateData(accessibleCountries, currentTab) {
        this.accessibleCountries = accessibleCountries;
        this.currentTab = currentTab;
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
    }
    
    // Update map colors based on the current tab
    updateMapColors() {
        if (!this.map) {
            console.warn('Map not fully initialized, cannot set colors');
            return;
        }

        const colors = {};

        // Set colors based on the currently active tab
        Object.keys(this.countryAccessMap).forEach(countryCode => {
            const accessType = this.countryAccessMap[countryCode];
            
            if (this.currentTab === 'visa-free' && accessType === 'visa-free') {
                colors[countryCode] = this.colors['visa-free'];
            } else if (this.currentTab === 'visa-on-arrival' && accessType === 'visa-on-arrival') {
                colors[countryCode] = this.colors['visa-on-arrival'];
            } else if (this.currentTab === 'e-visa' && accessType === 'e-visa') {
                colors[countryCode] = this.colors['e-visa'];
            } else {
                colors[countryCode] = this.colors['no-access'];
            }
        });

        try {
            // Update the map colors using the correct jQVMap API method
            $(this.mapElementId).vectorMap('set', 'colors', colors);
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
