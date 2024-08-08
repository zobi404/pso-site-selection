let map;
let selectedRegionBoundary;
let psoCircles = [];
let competitorCircles = [];
let focusedAreas = [];
const DISTANCE_THRESHOLD = 3000; // Distance in meters to consider for highlighting (10 km)
const AREA_RADIUS = 1000; // Radius in meters for checking nearby schools and government institutions

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 24.8607, lng: 67.0011 },
        zoom: 7,
    });

    const provinceInput = document.getElementById('province');
    const divisionInput = document.getElementById('division');
    const districtInput = document.getElementById('district');
    const searchButton = document.getElementById('search-button');

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

    const divisionInput = document.getElementById('division');
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
    const provinceInput = document.getElementById('province');
    const divisionInput = document.getElementById('division');
    const districtInput = document.getElementById('district');
    const searchButton = document.getElementById('search-button');

    const province = provinceInput.value;
    if (province === 'Sindh') {
        populateDivisions();
    }
    districtInput.innerHTML = '<option value="">Select District</option>';
    searchButton.disabled = true;
    districtInput.parentElement.style.display = 'none';
}

function updateDistricts() {
    const divisionInput = document.getElementById('division');
    const districtInput = document.getElementById('district');
    const searchButton = document.getElementById('search-button');

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
    const districtInput = document.getElementById('district');
    const searchButton = document.getElementById('search-button');
    searchButton.disabled = !districtInput.value;
}

function showRegion(event) {
    event.preventDefault();
    const province = document.getElementById('province').value;
    const division = document.getElementById('division').value;
    const district = document.getElementById('district').value;

    if (province && division && district) {
        // Remove any previous boundaries and markers
        clearPreviousMarkers();
        
        // Show selected region boundary and CNG stations
        displayRegionBoundary(district);
    }
}

function displayRegionBoundary(district) {
    const districtBoundaries = {
        'Karachi Central': { north: 24.930, south: 24.870, east: 67.100, west: 67.030 },
        'Karachi East': { north: 24.930, south: 24.870, east: 67.140, west: 67.070 },
        'Karachi South': { north: 24.860, south: 24.790, east: 67.050, west: 67.000 },
        'Karachi West': { north: 24.930, south: 24.870, east: 67.020, west: 66.950 },
        'Korangi': { north: 24.860, south: 24.800, east: 67.150, west: 67.070 },
        'Malir': { north: 24.940, south: 24.860, east: 67.230, west: 67.140 },
        'Hyderabad District': { north: 25.440, south: 25.320, east: 68.440, west: 68.310 },
        'Tando Allahyar': { north: 25.480, south: 25.380, east: 68.740, west: 68.610 },
        'Tando Muhammad Khan': { north: 25.350, south: 25.240, east: 68.630, west: 68.480 },
        'Sukkur District': { north: 27.760, south: 27.680, east: 68.940, west: 68.820 },
        'Ghotki': { north: 28.150, south: 28.050, east: 69.350, west: 69.200 },
        'Kashmore': { north: 28.450, south: 28.340, east: 69.570, west: 69.420 },
        'Khairpur': { north: 27.530, south: 27.420, east: 68.760, west: 68.610 },
        'Larkana District': { north: 27.640, south: 27.540, east: 68.220, west: 68.080 },
        'Kambar': { north: 27.590, south: 27.470, east: 68.010, west: 67.870 },
        'Shahdadkot': { north: 27.960, south: 27.850, east: 67.990, west: 67.820 },
        'Mirpurkhas District': { north: 25.560, south: 25.460, east: 69.050, west: 68.880 },
        'Umerkot': { north: 25.420, south: 25.320, east: 69.330, west: 69.170 },
        'Sanghar': { north: 26.040, south: 25.930, east: 69.060, west: 68.920 },
        'Thatta District': { north: 24.800, south: 24.700, east: 67.950, west: 67.780 }
    };

    const boundary = districtBoundaries[district];
    if (boundary) {
        const districtBoundary = new google.maps.LatLngBounds(
            new google.maps.LatLng(boundary.south, boundary.west),
            new google.maps.LatLng(boundary.north, boundary.east)
        );

        map.fitBounds(districtBoundary);

        // Define the boundaries of the district using a Rectangle
        selectedRegionBoundary = new google.maps.Rectangle({
            bounds: districtBoundary,
            editable: false,
            draggable: false,
            map: map,
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.1
        });

        // Call the function to add CNG station markers
        showCngStations(districtBoundary);
    } else {
        alert('Boundary not defined for the selected district.');
    }
}

function showCngStations(districtBoundary) {
    clearPreviousMarkers();

    const service = new google.maps.places.PlacesService(map);

    const request = {
        bounds: districtBoundary,
        type: ['gas_station']
    };

    service.nearbySearch(request, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            let bounds = new google.maps.LatLngBounds();
            let psoPumps = []; // Array to store PSO pumps

            results.forEach(place => {
                if (districtBoundary.contains(place.geometry.location)) {
                    const isPsoStation = place.name.toLowerCase().includes('pso');
                    const color = isPsoStation ? '#0000FF' : '#FF0000';

                    const circle = new google.maps.Circle({
                        strokeColor: color,
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: color,
                        fillOpacity: 0.35,
                        map,
                        center: place.geometry.location,
                        radius: 300, // Circle radius in meters
                    });

                    if (isPsoStation) {
                        psoCircles.push(circle);
                        psoPumps.push(place.geometry.location); // Add PSO pump to array
                    } else {
                        competitorCircles.push(circle);
                    }

                    const infoWindow = new google.maps.InfoWindow({
                        content: `<div class="info-content">
                                    <strong>${place.name}</strong>
                                    <p>${place.vicinity}</p>
                                    <p>${place.types.join(', ')}</p>
                                  </div>`
                    });

                    google.maps.event.addListener(circle, 'mouseover', function() {
                        infoWindow.setPosition(place.geometry.location);
                        infoWindow.open(map, circle);
                    });

                    google.maps.event.addListener(circle, 'mouseout', function() {
                        infoWindow.close();
                    });

                    // Extend bounds to include this marker
                    bounds.extend(place.geometry.location);
                }
            });

            // Create a boundary around the markers
            if (bounds.getNorthEast().lat() !== bounds.getSouthWest().lat() &&
                bounds.getNorthEast().lng() !== bounds.getSouthWest().lng()) {
                
                // Fit the map to the bounds
                map.fitBounds(bounds);

                // Create a rectangle around the bounds
                selectedRegionBoundary = new google.maps.Rectangle({
                    bounds: bounds,
                    editable: false,
                    draggable: false,
                    map: map,
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#FF0000',
                    fillOpacity: 0.1
                });
            }

            // Call the function to calculate and highlight focused areas
            calculateFocusedAreas(psoPumps, districtBoundary);
        }
    });
}

function calculateFocusedAreas(psoPumps, districtBoundary) {
    clearFocusedAreas();

    psoPumps.forEach((psoPump, index) => {
        for (let i = index + 1; i < psoPumps.length; i++) {
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
                psoPump,
                psoPumps[i]
            );

            if (distance > DISTANCE_THRESHOLD) {
                const midLat = (psoPump.lat() + psoPumps[i].lat()) / 2;
                const midLng = (psoPump.lng() + psoPumps[i].lng()) / 2;
                
                const focusedArea = new google.maps.Circle({
                    center: { lat: midLat, lng: midLng },
                    radius: AREA_RADIUS, // Radius of the focused area
                    fillColor: '#00FF00',
                    fillOpacity: 0.6,
                    strokeColor: '#FFFFFF',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    map: map
                });

                google.maps.event.addListener(focusedArea, 'mouseover', function() {
                    const infoWindow = new google.maps.InfoWindow({
                        content: 'Focused Area'
                    });
                    infoWindow.open(map, focusedArea);
                });

                google.maps.event.addListener(focusedArea, 'mouseout', function() {
                    infoWindow.close();
                });

                focusedAreas.push(focusedArea);
            }
        }
    });

    highlightNearbySchoolsAndInstitutions(districtBoundary);
}

function highlightNearbySchoolsAndInstitutions(districtBoundary) {
    const service = new google.maps.places.PlacesService(map);

    const schoolRequest = {
        bounds: districtBoundary,
        type: ['school']
    };

    const institutionRequest = {
        bounds: districtBoundary,
        type: ['hospital'] // Could be changed to more specific types if needed
    };

    const checkArea = (results, type) => {
        results.forEach(place => {
            if (districtBoundary.contains(place.geometry.location)) {
                const isWithinFocusedArea = focusedAreas.some(focusedArea => {
                    return google.maps.geometry.spherical.computeDistanceBetween(
                        place.geometry.location,
                        focusedArea.getCenter()
                    ) <= AREA_RADIUS;
                });

                if (isWithinFocusedArea) {
                    const greenCircle = new google.maps.Circle({
                        center: place.geometry.location,
                        radius: AREA_RADIUS,
                        fillColor: '#00FF00',
                        fillOpacity: 0.6,
                        strokeColor: '#FFFFFF',
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        map: map
                    });

                    const infoWindow = new google.maps.InfoWindow({
                        content: `<div class="info-content">
                                    <strong>${place.name}</strong>
                                    <p>${place.vicinity}</p>
                                  </div>`
                    });

                    google.maps.event.addListener(greenCircle, 'mouseover', function() {
                        infoWindow.setPosition(place.geometry.location);
                        infoWindow.open(map, greenCircle);
                    });

                    google.maps.event.addListener(greenCircle, 'mouseout', function() {
                        infoWindow.close();
                    });
                }
            }
        });
    };

    service.nearbySearch(schoolRequest, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            checkArea(results, 'school');
        }
    });

    service.nearbySearch(institutionRequest, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            checkArea(results, 'institution');
        }
    });
}

function clearPreviousMarkers() {
    if (selectedRegionBoundary) {
        selectedRegionBoundary.setMap(null);
    }

    psoCircles.forEach(circle => circle.setMap(null));
    competitorCircles.forEach(circle => circle.setMap(null));
    psoCircles = [];
    competitorCircles = [];
}

function clearFocusedAreas() {
    focusedAreas.forEach(area => area.setMap(null));
    focusedAreas = [];
}
