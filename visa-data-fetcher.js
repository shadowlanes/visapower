class VisaDataFetcher {
    constructor(dataUrl) {
        this.dataUrl = dataUrl;
        this.visaData = null;
    }

    // Fetch visa data from the provided URL
    async fetchVisaData() {
        try {
            const response = await fetch(this.dataUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch visa data: ${response.statusText}`);
            }
            this.visaData = await response.json();
            console.log('Visa data fetched successfully');
        } catch (error) {
            console.error('Error fetching visa data:', error);
        }
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
// const visaDataFetcher = new VisaDataFetcher('data/visa-data.json');
// await visaDataFetcher.fetchVisaData();
// const indiaVisaData = visaDataFetcher.getVisaDataForPassport('India');
