mapboxgl.accessToken = "pk.eyJ1Ijoicmprd29uIiwiYSI6ImNrbnB5aTg2NDA2ZXgyb21uZjh0ZmQ0aDEifQ.wcihEO5lNGrSgDcgtldHag";
var map = new mapboxgl.Map({
    container: "map", // container ID
    style: "mapbox://styles/rjkwon/ckranb3ha1tjk18lh6ysoifml", // your Mapbox style URL
    center: [-105.0029579, 39.75536983], // starting position [lng, lat]
    zoom: 4.2 // starting zoom
});

// Wait for the map to be fully loaded before adding the route and markers
map.on('load', function() {
    // Fetch the route using the Directions API
    fetch('https://api.mapbox.com/directions/v5/mapbox/driving/-87.64032709%2C41.87883343%3B-90.36398135%2C40.94510264%3B-91.55068891%2C40.97159668%3B-95.92727316%2C41.25014755%3B-96.71406317%2C40.81629193%3B-105.0029579%2C39.75536983%3B-107.3232113%2C39.54820675%3B-108.5705199%2C39.06476587%3B-111.9084177%2C40.76203724%3B-119.8114929%2C39.52908755%3B-121.5001231%2C38.58447142%3B-122.2921041%2C37.8414264?alternatives=false&geometries=geojson&overview=full&steps=false&notifications=none&access_token=pk.eyJ1Ijoicmprd29uIiwiYSI6ImNrbnB5aTg2NDA2ZXgyb21uZjh0ZmQ0aDEifQ.wcihEO5lNGrSgDcgtldHag')
        .then(response => response.json())
        .then(data => {
            var route = data.routes[0].geometry;

            map.addSource('route', {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': route
                }
            });

            map.addLayer({
                'id': 'route',
                'type': 'line',
                'source': 'route',
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': '#F66F6F',
                    'line-width': 4
                }
            });

            // Define marker data
            var markers = [
                { coords: [-87.64032709, 41.87883343], label: 'Chicago Union Station' },
                { coords: [-90.36398135, 40.94510264], label: 'Galesburg, Illinois' },
                { coords: [-91.55068891, 40.97159668], label: 'Mount Pleasant, Iowa' },
                { coords: [-95.92727316, 41.25014755], label: 'Omaha, Nebraska' },
                { coords: [-96.71406317, 40.81629193], label: 'Lincoln, Nebraska' },
                { coords: [-105.0029579, 39.75536983], label: 'Denver, Colorado' },
                { coords: [-107.3232113, 39.54820675], label: 'Glenwood Springs, Colorado' },
                { coords: [-108.5705199, 39.06476587], label: 'Grand Junction, Colorado' },
                { coords: [-111.9084177, 40.76203724], label: 'Salt Lake City, Utah' },
                { coords: [-119.8114929, 39.52908755], label: 'Reno, Nevada' },
                { coords: [-121.5001231, 38.58447142], label: 'Sacramento, California' },
                { coords: [-122.2921041, 37.8414264], label: 'Emeryville, California' }
            ];

            // Loop through markers and add them to the map
            markers.forEach(function(marker) {
                new mapboxgl.Marker()
                    .setLngLat(marker.coords)
                    .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
                        .setText(marker.label))
                    .addTo(map);
            });
        });
});