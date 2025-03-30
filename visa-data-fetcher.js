class VisaDataFetcher {
    constructor() { 
        // Initialize with empty data structure
        this.visaData = {};
        
        // Initialize countryVisaData if it doesn't exist (should already be created by the script tags)
        window.countryVisaData = window.countryVisaData || {};
        
        // Aggregate data from all country visa data files
        this.aggregateVisaData();
        
        console.log('VisaDataFetcher initialized with data:', Object.keys(this.visaData).length > 0);
    }

    // Aggregate visa data from all country files loaded via script tags
    aggregateVisaData() {
        // Check if the countryVisaData object exists and has data
        if (window.countryVisaData && Object.keys(window.countryVisaData).length > 0) {
            // Copy all country data into our visaData object
            this.visaData = { ...window.countryVisaData };
            
            // Extract and process special visa types from additionalAccess properties
            this.processSpecialVisaTypes();
        } else {
            console.error('No country visa data available. Make sure visa data files are loaded properly.');
        }
    }
    
    // Returns a promise that resolves immediately since data is already loaded via script tags
    whenDataLoaded() {
        return Promise.resolve();
    }

    // Extract special visa types from additionalAccess properties in country data
    processSpecialVisaTypes() {
        // Iterate through all countries
        Object.keys(this.visaData).forEach(countryName => {
            const countryData = this.visaData[countryName];
            
            // Check if this country has additionalAccess data
            if (countryData && countryData.additionalAccess) {
                // For each visa that provides additional access
                Object.keys(countryData.additionalAccess).forEach(visaCountry => {
                    const visaKey = visaCountry + " Visa";
                    const additionalAccess = countryData.additionalAccess[visaCountry];
                    
                    // If this special visa type doesn't exist yet, create it
                    if (!this.visaData[visaKey]) {
                        this.visaData[visaKey] = { 
                            visaFreeWithThisVisa: [] 
                        };
                    }
                    
                    // Add all visa free countries
                    if (additionalAccess.visaFree && additionalAccess.visaFree.length > 0) {
                        this.visaData[visaKey].visaFreeWithThisVisa = [
                            ...this.visaData[visaKey].visaFreeWithThisVisa || [],
                            ...additionalAccess.visaFree
                        ];
                    }
                    
                    // Add visa on arrival as visa free with this visa too (they are effectively the same for this purpose)
                    if (additionalAccess.visaOnArrival && additionalAccess.visaOnArrival.length > 0) {
                        this.visaData[visaKey].visaFreeWithThisVisa = [
                            ...this.visaData[visaKey].visaFreeWithThisVisa || [],
                            ...additionalAccess.visaOnArrival
                        ];
                    }
                    
                    // Add e-visa countries as well
                    if (additionalAccess.eVisa && additionalAccess.eVisa.length > 0) {
                        this.visaData[visaKey].visaFreeWithThisVisa = [
                            ...this.visaData[visaKey].visaFreeWithThisVisa || [],
                            ...additionalAccess.eVisa
                        ];
                    }
                });
            }
        });
        
        // Remove duplicates from visaFreeWithThisVisa arrays
        Object.keys(this.visaData).forEach(key => {
            if (key.endsWith(" Visa") && this.visaData[key].visaFreeWithThisVisa) {
                // Get unique entries based on country name
                const uniqueEntries = {};
                this.visaData[key].visaFreeWithThisVisa.forEach(entry => {
                    uniqueEntries[entry.country] = entry;
                });
                
                this.visaData[key].visaFreeWithThisVisa = Object.values(uniqueEntries);
            }
        });
    }

    // Get visa data for a specific passport
    getVisaDataForPassport(passport) {
        if (!this.visaData) {
            console.warn('Visa data not loaded yet');
            return null;
        }
        return this.visaData[passport] || null;
    }

    // Get general visa access data (e.g., for specific visas like US Visa, Schengen Visa)
    getGeneralVisaAccess(visaType) {
        if (!this.visaData) {
            console.warn('Visa data not loaded yet');
            return null;
        }
        return this.visaData[visaType] || null;
    }
    
    // Register a new country's visa data at runtime
    registerCountryData(countryName, countryData) {
        if (this.visaData) {
            this.visaData[countryName] = countryData;
            console.log(`Registered visa data for ${countryName}`);
            // Re-process special visa types after adding new data
            this.processSpecialVisaTypes();
        }
    }
}

// Make the VisaDataFetcher available globally for debugging
window.VisaDataFetcher = VisaDataFetcher;
