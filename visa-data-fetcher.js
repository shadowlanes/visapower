class VisaDataFetcher {
    constructor() { 
        // Try to get visaData from different possible sources
        if (typeof window.visaData !== 'undefined') {
            this.visaData = window.visaData;
        } else if (typeof visaData !== 'undefined') {
            // Maybe it's not attached to window but is in global scope
            this.visaData = visaData;
            // Also attach it to window for consistency
            window.visaData = visaData;
        } else {
            console.error('visaData is not defined in any accessible scope. Check if data/visa-data.js is loaded properly.');
            throw new Error('visaData is not defined in any accessible scope');
        }
        console.log('VisaDataFetcher initialized with data:', !!this.visaData);
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
}

// Example usage:
// const visaDataFetcher = new VisaDataFetcher();
// const indiaVisaData = visaDataFetcher.getVisaDataForPassport('India');
