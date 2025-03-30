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
        
        // Initialize map on next tick to ensure DOM and libraries are fully loaded
        setTimeout(() => this.init(), 0);
    }
    
    init() { 
        try {
            // Check if jQuery and jVectorMap are available
            if (typeof jQuery === 'undefined' || typeof jQuery.fn.vectorMap === 'undefined') {
                console.error('jQuery or jVectorMap not loaded. Retrying in 500ms...');
                setTimeout(() => this.init(), 500);
                return;
            }
            
            // Initialize the map
            this.map = jQuery(this.mapElementId).vectorMap({
                map: 'world_mill',
                backgroundColor: '#f8f9fa',
                zoomOnScroll: true,
                zoomMax: 10,
                zoomMin: 1,
                regionsSelectable: false,
                regionStyle: {
                    initial: {
                        fill: this.colors['no-access'],
                        "fill-opacity": 1,
                        stroke: 'none',
                        "stroke-width": 0,
                        "stroke-opacity": 1
                    },
                    hover: {
                        "fill-opacity": 0.8,
                        cursor: 'pointer'
                    }
                },
                onRegionTipShow: (e, el, code) => this.showTooltip(e, el, code)
            }).vectorMap('get', 'mapObject');
            
            console.log('Map initialized successfully');
        } catch (error) {
            console.error('Error initializing map:', error);
        }
    }
    
    // Update the map with new data
    updateData(accessibleCountries, currentTab) {
        this.accessibleCountries = accessibleCountries;
        this.currentTab = currentTab;
        
        // Only proceed if map is initialized
        if (!this.map) {
            console.warn('Map not yet initialized, trying again...');
            setTimeout(() => {
                this.init();
                this.updateData(accessibleCountries, currentTab);
            }, 500);
            return;
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
    }
    
    // Update map colors based on the current tab
    updateMapColors() {
        if (!this.map || !this.map.series || !this.map.series.regions || !this.map.series.regions[0]) {
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
            // Update the map colors
            this.map.series.regions[0].setValues(colors);
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
        // This is a basic mapping function. You would need a more complete mapping
        // for production use. This is just a starting point.
        const countryMapping = {
            'United States': 'us',
            'Canada': 'ca',
            'Mexico': 'mx',
            'United Kingdom': 'gb',
            'France': 'fr',
            'Germany': 'de',
            'Italy': 'it',
            'Spain': 'es',
            'Japan': 'jp',
            'South Korea': 'kr',
            'Singapore': 'sg',
            'Australia': 'au',
            'New Zealand': 'nz',
            'Egypt': 'eg',
            'Kenya': 'ke',
            'Maldives': 'mv',
            'Nepal': 'np',
            'Thailand': 'th',
            'India': 'in',
            'Vietnam': 'vn',
            'Sri Lanka': 'lk',
            'Turkey': 'tr',
            'China': 'cn',
            'Russia': 'ru',
            'Brazil': 'br',
            'Argentina': 'ar',
            'South Africa': 'za',
            'Nigeria': 'ng',
            'Indonesia': 'id',
            'Malaysia': 'my',
            'Philippines': 'ph',
            'Bhutan': 'bt',
            'Mauritius': 'mu',
            'Cambodia': 'kh',
            'Laos': 'la',
            'Myanmar': 'mm',
            'Panama': 'pa',
            'Costa Rica': 'cr',
            'United Arab Emirates': 'ae',
            'Georgia': 'ge',
            'Azerbaijan': 'az',
            'Taiwan': 'tw',
            'Bahrain': 'bh',
            'Albania': 'al',
            'Montenegro': 'me',
            'Ireland': 'ie',
            'Bulgaria': 'bg',
            'Croatia': 'hr',
            'Cyprus': 'cy',
            'Romania': 'ro',
            'Portugal': 'pt'
            // Add more countries as needed
        };
        
        return countryMapping[countryName];
    }
}
