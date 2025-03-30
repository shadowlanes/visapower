// This file contains the visa access data in JSON format
// It can be easily modified to reflect changes in visa regulations

const visaData = {
    // Sample data for USA passport
    "United States": {
        "visaFree": [
            { 
                "country": "Canada", 
                "source": "https://travel.state.gov/content/travel/en/international-travel.html",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Mexico", 
                "source": "https://travel.state.gov/content/travel/en/international-travel.html",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "United Kingdom", 
                "source": "https://travel.state.gov/content/travel/en/international-travel.html",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "France", 
                "source": "https://travel.state.gov/content/travel/en/international-travel.html",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Germany", 
                "source": "https://travel.state.gov/content/travel/en/international-travel.html",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Italy", 
                "source": "https://travel.state.gov/content/travel/en/international-travel.html",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Spain", 
                "source": "https://travel.state.gov/content/travel/en/international-travel.html",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Japan", 
                "source": "https://travel.state.gov/content/travel/en/international-travel.html",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "South Korea", 
                "source": "https://travel.state.gov/content/travel/en/international-travel.html",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Singapore", 
                "source": "https://travel.state.gov/content/travel/en/international-travel.html",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Australia", 
                "source": "https://travel.state.gov/content/travel/en/international-travel.html",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "New Zealand", 
                "source": "https://travel.state.gov/content/travel/en/international-travel.html",
                "lastChecked": "2023-10-01"
            }
        ],
        "visaOnArrival": [
            { 
                "country": "Egypt", 
                "source": "https://www.egyptvisa.com/",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Kenya", 
                "source": "https://www.kenyavisa.com/",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Maldives", 
                "source": "https://www.maldivesvisa.com/",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Nepal", 
                "source": "https://www.nepalvisa.com/",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Thailand", 
                "source": "https://www.thaiembassy.com/travel-to-thailand/visa-on-arrival",
                "lastChecked": "2023-10-01"
            }
        ],
        "eVisa": [
            { 
                "country": "India", 
                "source": "https://indianvisaonline.gov.in/",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Vietnam", 
                "source": "https://www.vietnamvisa.gov.vn/",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Sri Lanka", 
                "source": "https://www.eta.gov.lk/",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Turkey", 
                "source": "https://www.evisa.gov.tr/",
                "lastChecked": "2023-10-01"
            }
        ]
    },
    
    // Sample data for Indian passport
    "India": {
        "visaFree": [
            { 
                "country": "Nepal", 
                "source": "https://www.mea.gov.in/visa-regulation.htm",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Bhutan", 
                "source": "https://www.mea.gov.in/visa-regulation.htm",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Mauritius", 
                "source": "https://www.mea.gov.in/visa-regulation.htm",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Indonesia", 
                "source": "https://www.mea.gov.in/visa-regulation.htm",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Maldives", 
                "source": "https://www.mea.gov.in/visa-regulation.htm",
                "lastChecked": "2023-10-01"
            }
        ], 
        "visaOnArrival": [
            { 
                "country": "Thailand", 
                "source": "https://www.thaiembassy.com/travel-to-thailand/visa-on-arrival",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Cambodia", 
                "source": "https://www.cambodiavisa.com/",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Laos", 
                "source": "https://www.laosvisa.com/",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Myanmar", 
                "source": "https://www.myanmarvisa.com/",
                "lastChecked": "2023-10-01"
            }
        ],
        "eVisa": [
            { 
                "country": "Sri Lanka", 
                "source": "https://www.eta.gov.lk/",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Vietnam", 
                "source": "https://www.vietnamvisa.gov.vn/",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Malaysia", 
                "source": "https://www.malaysiavisa.com/",
                "lastChecked": "2023-10-01"
            }
        ], 
        // Additional access based on visas an Indian passport holder might have
        "additionalAccess": {
            "United States": {
                "visaFree": [
                    { 
                        "country": "Panama", 
                        "source": "https://www.panamavisa.com/",
                        "lastChecked": "2023-10-01"
                    },
                    { 
                        "country": "Costa Rica", 
                        "source": "https://www.costaricavisa.com/",
                        "lastChecked": "2023-10-01"
                    }
                ],
                "visaOnArrival": [
                    { 
                        "country": "United Arab Emirates", 
                        "source": "https://www.uaevisa.com/",
                        "lastChecked": "2023-10-01"
                    },
                    { 
                        "country": "Georgia", 
                        "source": "https://www.georgiavisa.com/",
                        "lastChecked": "2023-10-01"
                    },
                    { 
                        "country": "Azerbaijan", 
                        "source": "https://www.azerbaijanvisa.com/",
                        "lastChecked": "2023-10-01"
                    }
                ],
                "eVisa": [
                    { 
                        "country": "Taiwan", 
                        "source": "https://www.taiwanvisa.com/",
                        "lastChecked": "2023-10-01"
                    },
                    { 
                        "country": "Bahrain", 
                        "source": "https://www.bahrainvisa.com/",
                        "lastChecked": "2023-10-01"
                    }
                ]
            },
            "France": {
                "visaFree": [],
                "visaOnArrival": [
                    { 
                        "country": "Turkey", 
                        "source": "https://www.evisa.gov.tr/",
                        "lastChecked": "2023-10-01"
                    },
                    { 
                        "country": "Albania", 
                        "source": "https://www.albaniavisa.com/",
                        "lastChecked": "2023-10-01"
                    },
                    { 
                        "country": "Montenegro", 
                        "source": "https://www.montenegrovisa.com/",
                        "lastChecked": "2023-10-01"
                    }
                ],
                "eVisa": []
            },
            "United Kingdom": {
                "visaFree": [],
                "visaOnArrival": [
                    { 
                        "country": "Ireland", 
                        "source": "https://www.irelandvisa.com/",
                        "lastChecked": "2023-10-01"
                    }
                ],
                "eVisa": []
            }
        }
    },
    
    // Sample data for UK passport
    "United Kingdom": {
        "visaFree": [
            { 
                "country": "United States", 
                "source": "https://www.gov.uk/foreign-travel-advice/usa",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Canada", 
                "source": "https://www.gov.uk/foreign-travel-advice/canada",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Australia", 
                "source": "https://www.gov.uk/foreign-travel-advice/australia",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "New Zealand", 
                "source": "https://www.gov.uk/foreign-travel-advice/new-zealand",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Japan", 
                "source": "https://www.gov.uk/foreign-travel-advice/japan",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "South Korea", 
                "source": "https://www.gov.uk/foreign-travel-advice/south-korea",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Singapore", 
                "source": "https://www.gov.uk/foreign-travel-advice/singapore",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Germany", 
                "source": "https://www.gov.uk/foreign-travel-advice/germany",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "France", 
                "source": "https://www.gov.uk/foreign-travel-advice/france",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Italy", 
                "source": "https://www.gov.uk/foreign-travel-advice/italy",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Spain", 
                "source": "https://www.gov.uk/foreign-travel-advice/spain",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Portugal", 
                "source": "https://www.gov.uk/foreign-travel-advice/portugal",
                "lastChecked": "2023-10-01"
            }
        ],
        "visaOnArrival": [
            { 
                "country": "Egypt", 
                "source": "https://www.gov.uk/foreign-travel-advice/egypt",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Kenya", 
                "source": "https://www.gov.uk/foreign-travel-advice/kenya",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Nepal", 
                "source": "https://www.gov.uk/foreign-travel-advice/nepal",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Indonesia", 
                "source": "https://www.gov.uk/foreign-travel-advice/indonesia",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Thailand", 
                "source": "https://www.gov.uk/foreign-travel-advice/thailand",
                "lastChecked": "2023-10-01"
            }
        ],
        "eVisa": [
            { 
                "country": "India", 
                "source": "https://www.gov.uk/foreign-travel-advice/india",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Vietnam", 
                "source": "https://www.gov.uk/foreign-travel-advice/vietnam",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Sri Lanka", 
                "source": "https://www.gov.uk/foreign-travel-advice/sri-lanka",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Turkey", 
                "source": "https://www.gov.uk/foreign-travel-advice/turkey",
                "lastChecked": "2023-10-01"
            }
        ]
    },
    
    // General visa access (when passport isn't relevant)
    "United States Visa": {
        "visaFreeWithThisVisa": [
            { 
                "country": "Mexico", 
                "source": "https://travel.state.gov/content/travel/en/international-travel.html",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Canada", 
                "source": "https://travel.state.gov/content/travel/en/international-travel.html",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Panama", 
                "source": "https://travel.state.gov/content/travel/en/international-travel.html",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Costa Rica", 
                "source": "https://travel.state.gov/content/travel/en/international-travel.html",
                "lastChecked": "2023-10-01"
            }
        ]
    },
    
    "Schengen Visa": {
        "visaFreeWithThisVisa": [
            { 
                "country": "Bulgaria", 
                "source": "https://www.schengenvisainfo.com/",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Croatia", 
                "source": "https://www.schengenvisainfo.com/",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Cyprus", 
                "source": "https://www.schengenvisainfo.com/",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Romania", 
                "source": "https://www.schengenvisainfo.com/",
                "lastChecked": "2023-10-01"
            }
        ]
    },
    
    "United Kingdom Visa": {
        "visaFreeWithThisVisa": [
            { 
                "country": "Ireland", 
                "source": "https://www.gov.uk/foreign-travel-advice/ireland",
                "lastChecked": "2023-10-01"
            }
        ]
    },
    
    // Add more countries and visa rules as needed
    "Canada": {
        "visaFree": [
            { 
                "country": "United States", 
                "source": "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "United Kingdom", 
                "source": "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "France", 
                "source": "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Germany", 
                "source": "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Italy", 
                "source": "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html",
                "lastChecked": "2023-10-01"
            }
        ],
        "visaOnArrival": [
            { 
                "country": "Mexico", 
                "source": "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Brazil", 
                "source": "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html",
                "lastChecked": "2023-10-01"
            }
        ],
        "eVisa": [
            { 
                "country": "Australia", 
                "source": "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "New Zealand", 
                "source": "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html",
                "lastChecked": "2023-10-01"
            }
        ]
    },
    
    "Japan": {
        "visaFree": [
            { 
                "country": "South Korea", 
                "source": "https://www.mofa.go.jp/j_info/visit/visa/",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Singapore", 
                "source": "https://www.mofa.go.jp/j_info/visit/visa/",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Thailand", 
                "source": "https://www.mofa.go.jp/j_info/visit/visa/",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Malaysia", 
                "source": "https://www.mofa.go.jp/j_info/visit/visa/",
                "lastChecked": "2023-10-01"
            }
        ],
        "visaOnArrival": [
            { 
                "country": "Indonesia", 
                "source": "https://www.mofa.go.jp/j_info/visit/visa/",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Vietnam", 
                "source": "https://www.mofa.go.jp/j_info/visit/visa/",
                "lastChecked": "2023-10-01"
            }
        ],
        "eVisa": [
            { 
                "country": "China", 
                "source": "https://www.mofa.go.jp/j_info/visit/visa/",
                "lastChecked": "2023-10-01"
            },
            { 
                "country": "Philippines", 
                "source": "https://www.mofa.go.jp/j_info/visit/visa/",
                "lastChecked": "2023-10-01"
            }
        ],
        // Japan passport holders also get additional benefits with certain visas
        "additionalAccess": {
            "United States": {
                "visaFree": [
                    { 
                        "country": "Canada", 
                        "source": "https://travel.state.gov/content/travel/en/international-travel.html",
                        "lastChecked": "2023-10-01"
                    },
                    { 
                        "country": "Mexico", 
                        "source": "https://travel.state.gov/content/travel/en/international-travel.html",
                        "lastChecked": "2023-10-01"
                    }
                ],
                "visaOnArrival": [],
                "eVisa": []
            }
        }
    }
};

// Make sure visaData is available globally
window.visaData = visaData;
