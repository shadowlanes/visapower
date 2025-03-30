(function() {
    // If window.countryVisaData doesn't exist, initialize it
    if (!window.countryVisaData) {
        window.countryVisaData = {};
    }

    // Add India visa data
    window.countryVisaData["India"] = {
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
    };
})();
