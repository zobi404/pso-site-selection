let map;
let selectedRegionBoundary;
let psoMarkers = [];
const provinceInput = document.getElementById('province');
const divisionInput = document.getElementById('division');
const districtInput = document.getElementById('district');
const searchButton = document.getElementById('search-button');

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 24.8607, lng: 67.0011 }, // Center of Sindh
        zoom: 7,
    });

    // Initialize event listeners for form inputs
    provinceInput.addEventListener('change', updateDivisions);
    divisionInput.addEventListener('change', updateDistricts);
    districtInput.addEventListener('change', enableSearchButton);
    document.getElementById('search-form').addEventListener('submit', showRegion);

    // Populate the initial division options for Sindh
    populateDivisions();
}

function populateDivisions() {
    const divisions = [
        'Karachi',
        'Hyderabad',
        'Sukkur',
        'Larkana',
        'Mirpurkhas',
        'Qambar Shahdadkot',
        'Kambar',
        'Thatta'
    ];

    divisionInput.innerHTML = '<option value="">Select Division</option>';
    divisions.forEach(division => {
        const option = document.createElement('option');
        option.value = division;
        option.textContent = division;
        divisionInput.appendChild(option);
    });
    divisionInput.parentElement.style.display = 'block';
}

function updateDivisions() {
    const province = provinceInput.value;
    if (province === 'Sindh') {
        populateDivisions();
    }
    districtInput.innerHTML = '<option value="">Select District</option>';
    searchButton.disabled = true;
    districtInput.parentElement.style.display = 'none';
}

function updateDistricts() {
    const division = divisionInput.value;
    districtInput.innerHTML = '<option value="">Select District</option>';
    searchButton.disabled = true;

    if (division) {
        const districts = getDistricts(division);
        districts.forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtInput.appendChild(option);
        });
        districtInput.parentElement.style.display = 'block';
    } else {
        districtInput.parentElement.style.display = 'none';
    }
}

function getDistricts(division) {
    const districts = {
        'Karachi': ['Karachi Central', 'Karachi East', 'Karachi South', 'Karachi West', 'Korangi', 'Malir'],
        'Hyderabad': ['Hyderabad District', 'Tando Allahyar', 'Tando Muhammad Khan'],
        'Sukkur': ['Sukkur District', 'Ghotki', 'Kashmore', 'Khairpur'],
        'Larkana': ['Larkana District', 'Kambar', 'Shahdadkot'],
        'Mirpurkhas': ['Mirpurkhas District', 'Umerkot', 'Sanghar'],
        'Qambar Shahdadkot': ['Qambar', 'Shahdadkot'],
        'Kambar': ['Kambar District'],
        'Thatta': ['Thatta District']
    };
    return districts[division] || [];
}

function enableSearchButton() {
    if (provinceInput.value && divisionInput.value && districtInput.value) {
        searchButton.disabled = false;
    } else {
        searchButton.disabled = true;
    }
}

function showRegion(event) {
    event.preventDefault();

    const province = provinceInput.value;
    const division = divisionInput.value;
    const district = districtInput.value;

    if (!province || !division || !district) {
        alert('Please select province, division, and district.');
        return;
    }

    // Fetch region boundaries and display on the map
    const regionCoords = getRegionCoordinates(division, district);

    if (selectedRegionBoundary) {
        selectedRegionBoundary.setMap(null);
    }

    selectedRegionBoundary = new google.maps.Polygon({
        paths: regionCoords.boundary,
        strokeColor: "#0000FF",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#0000FF",
        fillOpacity: 0.1,
    });

    selectedRegionBoundary.setMap(map);

    const bounds = new google.maps.LatLngBounds();
    regionCoords.boundary.forEach(coord => bounds.extend(coord));
    map.fitBounds(bounds);

    // Highlight all PSO stations within the region
    highlightPSOStations(regionCoords.boundary);
}

// function getRegionCoordinates(division, district) {
//     // Coordinates for districts in Sindh
//     const coordinates = {
//         'Karachi': {
//             'Karachi Central': {
//                 boundary: [
//                     { lat: 24.8607, lng: 67.0011 },
//                     { lat: 24.8707, lng: 67.0111 },
//                     { lat: 24.8607, lng: 67.0211 },
//                     { lat: 24.8507, lng: 67.0111 }
//                 ]
//             }
//             // Add more districts as needed
//         },
//         // Add more divisions and districts similarly
//     };

//     return coordinates[division]?.[district] || { boundary: [], focusedAreas: [], nonFocusedAreas: [] };
// }

function getRegionCoordinates(division, district) {
    // Coordinates for districts in Sindh
    const coordinates = {
        'Karachi': {
            'Karachi Central': {
                boundary: [
                    { lat: 24.8607, lng: 67.0011 },
                    { lat: 24.8707, lng: 67.0111 },
                    { lat: 24.8607, lng: 67.0211 },
                    { lat: 24.8507, lng: 67.0111 }
                ]
            },
            'Karachi East': {
                boundary: [
                    { lat: 24.8678, lng: 67.0400 },
                    { lat: 24.8778, lng: 67.0500 },
                    { lat: 24.8678, lng: 67.0600 },
                    { lat: 24.8578, lng: 67.0500 }
                ]
            },
            'Karachi South': {
                boundary: [
                    { lat: 24.8128, lng: 67.0301 },
                    { lat: 24.8228, lng: 67.0401 },
                    { lat: 24.8128, lng: 67.0501 },
                    { lat: 24.8028, lng: 67.0401 }
                ]
            },
            'Karachi West': {
                boundary: [
                    { lat: 24.8550, lng: 67.0400 },
                    { lat: 24.8650, lng: 67.0500 },
                    { lat: 24.8550, lng: 67.0600 },
                    { lat: 24.8450, lng: 67.0500 }
                ]
            },
            'Korangi': {
                boundary: [
                    { lat: 24.8350, lng: 67.1100 },
                    { lat: 24.8450, lng: 67.1200 },
                    { lat: 24.8350, lng: 67.1300 },
                    { lat: 24.8250, lng: 67.1200 }
                ]
            },
            'Malir': {
                boundary: [
                    { lat: 24.8180, lng: 67.1450 },
                    { lat: 24.8280, lng: 67.1550 },
                    { lat: 24.8180, lng: 67.1650 },
                    { lat: 24.8080, lng: 67.1550 }
                ]
            }
        },
        'Hyderabad': {
            'Hyderabad District': {
                boundary: [
                    { lat: 25.3690, lng: 68.3570 },
                    { lat: 25.3790, lng: 68.3670 },
                    { lat: 25.3690, lng: 68.3770 },
                    { lat: 25.3590, lng: 68.3670 }
                ]
            },
            'Tando Allahyar': {
                boundary: [
                    { lat: 25.2480, lng: 68.2850 },
                    { lat: 25.2580, lng: 68.2950 },
                    { lat: 25.2480, lng: 68.3050 },
                    { lat: 25.2380, lng: 68.2950 }
                ]
            },
            'Tando Muhammad Khan': {
                boundary: [
                    { lat: 25.1580, lng: 68.2210 },
                    { lat: 25.1680, lng: 68.2310 },
                    { lat: 25.1580, lng: 68.2410 },
                    { lat: 25.1480, lng: 68.2310 }
                ]
            }
        },
        'Sukkur': {
            'Sukkur District': {
                boundary: [
                    { lat: 27.6950, lng: 68.8100 },
                    { lat: 27.7050, lng: 68.8200 },
                    { lat: 27.6950, lng: 68.8300 },
                    { lat: 27.6850, lng: 68.8200 }
                ]
            },
            'Ghotki': {
                boundary: [
                    { lat: 28.0480, lng: 69.0910 },
                    { lat: 28.0580, lng: 69.1010 },
                    { lat: 28.0480, lng: 69.1110 },
                    { lat: 28.0380, lng: 69.1010 }
                ]
            },
            'Kashmore': {
                boundary: [
                    { lat: 27.9140, lng: 69.4740 },
                    { lat: 27.9240, lng: 69.4840 },
                    { lat: 27.9140, lng: 69.4940 },
                    { lat: 27.9040, lng: 69.4840 }
                ]
            },
            'Khairpur': {
                boundary: [
                    { lat: 27.4990, lng: 69.1510 },
                    { lat: 27.5090, lng: 69.1610 },
                    { lat: 27.4990, lng: 69.1710 },
                    { lat: 27.4890, lng: 69.1610 }
                ]
            }
        },
        'Larkana': {
            'Larkana District': {
                boundary: [
                    { lat: 27.5560, lng: 68.2150 },
                    { lat: 27.5660, lng: 68.2250 },
                    { lat: 27.5560, lng: 68.2350 },
                    { lat: 27.5460, lng: 68.2250 }
                ]
            },
            'Kambar': {
                boundary: [
                    { lat: 27.6000, lng: 68.2750 },
                    { lat: 27.6100, lng: 68.2850 },
                    { lat: 27.6000, lng: 68.2950 },
                    { lat: 27.5900, lng: 68.2850 }
                ]
            },
            'Shahdadkot': {
                boundary: [
                    { lat: 27.5650, lng: 68.2400 },
                    { lat: 27.5750, lng: 68.2500 },
                    { lat: 27.5650, lng: 68.2600 },
                    { lat: 27.5550, lng: 68.2500 }
                ]
            }
        },
        'Mirpurkhas': {
            'Mirpurkhas District': {
                boundary: [
                    { lat: 25.3850, lng: 68.1630 },
                    { lat: 25.3950, lng: 68.1730 },
                    { lat: 25.3850, lng: 68.1830 },
                    { lat: 25.3750, lng: 68.1730 }
                ]
            },
            'Umerkot': {
                boundary: [
                    { lat: 25.3500, lng: 69.1770 },
                    { lat: 25.3600, lng: 69.1870 },
                    { lat: 25.3500, lng: 69.1970 },
                    { lat: 25.3400, lng: 69.1870 }
                ]
            },
            'Sanghar': {
                boundary: [
                    { lat: 25.2500, lng: 68.9700 },
                    { lat: 25.2600, lng: 68.9800 },
                    { lat: 25.2500, lng: 68.9900 },
                    { lat: 25.2400, lng: 68.9800 }
                ]
            }
        },
        'Qambar Shahdadkot': {
            'Qambar': {
                boundary: [
                    { lat: 27.5580, lng: 68.5150 },
                    { lat: 27.5680, lng: 68.5250 },
                    { lat: 27.5580, lng: 68.5350 },
                    { lat: 27.5480, lng: 68.5250 }
                ]
            },
            'Shahdadkot': {
                boundary: [
                    { lat: 27.5450, lng: 68.4900 },
                    { lat: 27.5550, lng: 68.5000 },
                    { lat: 27.5450, lng: 68.5100 },
                    { lat: 27.5350, lng: 68.5000 }
                ]
            }
        },
        'Kambar': {
            'Kambar District': {
                boundary: [
                    { lat: 27.5730, lng: 68.5400 },
                    { lat: 27.5830, lng: 68.5500 },
                    { lat: 27.5730, lng: 68.5600 },
                    { lat: 27.5630, lng: 68.5500 }
                ]
            }
        },
        'Thatta': {
            'Thatta District': {
                boundary: [
                    { lat: 24.7400, lng: 67.6100 },
                    { lat: 24.7500, lng: 67.6200 },
                    { lat: 24.7400, lng: 67.6300 },
                    { lat: 24.7300, lng: 67.6200 }
                ]
            }
        }
    };

    return coordinates[division]?.[district] || { boundary: [], focusedAreas: [], nonFocusedAreas: [] };
}




function highlightPSOStations(boundary) {
    // Create a PlacesService instance
    const service = new google.maps.places.PlacesService(map);

    // Define the search request
    const bounds = new google.maps.LatLngBounds();
    boundary.forEach(coord => bounds.extend(new google.maps.LatLng(coord.lat, coord.lng)));

    // Define search areas using the bounds
    const request = {
        bounds: bounds, // Use bounds for searching within a region
        keyword: 'PSO',
        type: ['gas_station'] // Ensure we're only searching for gas stations
    };

    // Perform the search
    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            results.forEach(place => {
                const placeLoc = place.geometry.location;

                // Check if the place is within the polygon
                if (google.maps.geometry.poly.containsLocation(placeLoc, new google.maps.Polygon({ paths: boundary }))) {
                    const marker = new google.maps.Marker({
                        position: placeLoc,
                        map: map,
                        title: place.name
                    });

                    psoMarkers.push(marker);

                    // Add a small blue circle around the PSO station
                    new google.maps.Circle({
                        strokeColor: "#0000FF",
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: "#0000FF",
                        fillOpacity: 0.35,
                        map,
                        center: placeLoc,
                        radius: 100, // Small circle radius
                    }).addListener('click', () => {
                        const infowindow = new google.maps.InfoWindow({
                            content: `PSO Station: ${place.name}`,
                            position: placeLoc
                        });
                        infowindow.open(map);
                    });
                }
            });
        } else {
            console.log('Places search failed due to: ' + status);
        }
    });
}

