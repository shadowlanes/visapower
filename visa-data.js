// This file contains the visa access data in JSON format
// It can be easily modified to reflect changes in visa regulations

const visaData = {
    // Sample data for USA passport
    "United States": {
        "visaFree": [
            "Canada",  
            "Mexico", 
            "United Kingdom", 
            "France", 
            "Germany", 
            "Italy", 
            "Spain", 
            "Japan", 
            "South Korea",
            "Singapore",
            "Australia",
            "New Zealand"
        ],
        "visaOnArrival": [
            "Egypt", 
            "Kenya", 
            "Maldives", 
            "Nepal", 
            "Thailand"
        ],
        "eVisa": [
            "India", 
            "Vietnam", 
            "Sri Lanka", 
            "Turkey"
        ]
    },
    
    // Sample data for Indian passport
    "India": {
        "visaFree": [
            "Nepal", 
            "Bhutan", 
            "Mauritius",
            "Indonesia",
            "Maldives"
        ], 
        "visaOnArrival": [
            "Thailand", 
            "Cambodia", 
            "Laos", 
            "Myanmar"
        ],
        "eVisa": [
            "Sri Lanka", 
            "Vietnam", 
            "Malaysia"
        ], 
        // Additional access based on visas an Indian passport holder might have
        "additionalAccess": {
            "United States": {
                "visaFree": ["Panama", "Costa Rica"],
                "visaOnArrival": ["United Arab Emirates", "Georgia", "Azerbaijan"],
                "eVisa": ["Taiwan", "Bahrain"]
            },
            "France": {
                "visaFree": [],
                "visaOnArrival": ["Turkey", "Albania", "Montenegro"],
                "eVisa": []
            },
            "United Kingdom": {
                "visaFree": [],
                "visaOnArrival": ["Ireland"],
                "eVisa": []
            }
        }
    },
    
    // Sample data for UK passport
    "United Kingdom": {
        "visaFree": [
            "United States", 
            "Canada", 
            "Australia", 
            "New Zealand", 
            "Japan", 
            "South Korea", 
            "Singapore", 
            "Germany", 
            "France", 
            "Italy",
            "Spain",
            "Portugal"
        ],
        "visaOnArrival": [
            "Egypt", 
            "Kenya", 
            "Nepal", 
            "Indonesia", 
            "Thailand"
        ],
        "eVisa": [
            "India", 
            "Vietnam", 
            "Sri Lanka", 
            "Turkey"
        ]
    },
    
    // General visa access (when passport isn't relevant)
    "United States Visa": {
        "visaFreeWithThisVisa": [
            "Mexico", 
            "Canada", 
            "Panama", 
            "Costa Rica"
        ]
    },
    
    "Schengen Visa": {
        "visaFreeWithThisVisa": [
            "Bulgaria", 
            "Croatia", 
            "Cyprus", 
            "Romania"
        ]
    },
    
    "United Kingdom Visa": {
        "visaFreeWithThisVisa": [
            "Ireland"
        ]
    },
    
    // Add more countries and visa rules as needed
    "Canada": {
        "visaFree": [
            "United States", 
            "United Kingdom", 
            "France", 
            "Germany", 
            "Italy"
        ],
        "visaOnArrival": [
            "Mexico", 
            "Brazil"
        ],
        "eVisa": [
            "Australia", 
            "New Zealand"
        ]
    },
    
    "Japan": {
        "visaFree": [
            "South Korea", 
            "Singapore", 
            "Thailand", 
            "Malaysia"
        ],
        "visaOnArrival": [
            "Indonesia", 
            "Vietnam"
        ],
        "eVisa": [
            "China", 
            "Philippines"
        ],
        // Japan passport holders also get additional benefits with certain visas
        "additionalAccess": {
            "United States": {
                "visaFree": ["Canada", "Mexico"],
                "visaOnArrival": [],
                "eVisa": []
            }
        }
    }
};
