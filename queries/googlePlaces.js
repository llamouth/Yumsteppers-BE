const { googleMapsAPIKey } = require('../db/dbConfig');
const { boroughsMap } = require('../utils/geoUtils');

// Function to get the user's current location
// const getCurrentLocation = async () => {
//     const url = `https://www.googleapis.com/geolocation/v1/geolocate?key=${googleMapsAPIKey}`;
//     const response = await fetch(url, { method: 'POST' });

//     if (!response.ok) {
//         const error = await response.json();
//         return { error: error.message || 'Failed to get current location' };
//     }

//     const data = await response.json();
//     const { lat, lng } = data.location;
//     const boundaryCheck = boroughsMap(lat, lng);

//     if (!boundaryCheck.valid) {
//         return { error: boundaryCheck.message };
//     }

//     return { location: data.location };
// };

// Function to get nearby places based on a user's location
const getNearbyPlaces = async (lat, lng) => {
    const boundaryCheck = boroughsMap(lat, lng);
    if (!boundaryCheck.valid) {
        return { error: boundaryCheck.message };
    }

    const types = ['restaurant', 'cafe', 'bar'].join('|');
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1500&type=${types}&key=${googleMapsAPIKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const error = await response.json();
            return { error: error.error_message || 'Failed to fetch nearby places' };
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching nearby places:', error);
        return { error: 'Failed to fetch nearby places due to network or server error.' };
    }
};

// Function to get Google Places details for a given place_id
const getRestaurantDetailsFromGoogle = async (placeId) => {
    console.log('Using API Key:', googleMapsAPIKey);
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,types,geometry,reviews,website,current_opening_hours&key=${googleMapsAPIKey}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            const error = await response.json();
            console.error("Error fetching Google Place Details:", error);
            return { error: "Failed to fetch Google Place details" };
        }

        const placeDetails = await response.json();
        console.log('Google Place Details:', JSON.stringify(placeDetails, null, 2));

        if (placeDetails.result) {
            const {
                name,
                formatted_address,
                geometry,
                current_opening_hours,
                website
            } = placeDetails.result;

            return {
                name: name || 'N/A',
                address: formatted_address || 'N/A',
                latitude: geometry?.location?.lat ?? null,
                longitude: geometry?.location?.lng ?? null,
                open_now: current_opening_hours?.open_now || false,
                opening_hours: current_opening_hours?.weekday_text || [], // Added this line
                website: website || 'N/A',
            };
        } else {
            return { error: 'No place details found.' };
        }
    } catch (error) {
        console.error('Error fetching Google Place details:', error);
        return { error: 'Failed to fetch Google Place details due to network or server error.' };
    }
};


// Function to get directions from user to destination
const getDirections = async (originLat, originLng, destLat, destLng) => {
    const originCheck = boroughsMap(originLat, originLng);
    const destinationCheck = boroughsMap(destLat, destLng);

    if (!originCheck.valid || !destinationCheck.valid) {
        return { error: 'Origin or destination is outside of the allowed boroughs' };
    }

    const origin = `${originLat},${originLng}`;
    const destination = `${destLat},${destLng}`;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=walking&key=${googleMapsAPIKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const error = await response.json();
            return { error: error.message || 'Failed to get directions' };
        }

        
        const data = await response.json();
        
        if (data.routes.length > 0) {
            return { directions: data.routes[0] };
        } else {
            return { error: 'No routes found' };
        }
    } catch (error) {
        console.error("Error fetching directions:", error);
        return { error: 'Failed to fetch directions due to network or server error.' };
    }
};

// Function to validate a user's proximity to a location for check-in
const validateCheckIn = async (userLat, userLng, placeLat, placeLng) => {
    const userCheck = boroughsMap(userLat, userLng);
    const placeCheck = boroughsMap(placeLat, placeLng);

    if (!userCheck.valid || !placeCheck.valid) {
        return { error: 'User or place location is outside of allowed boundary.' };
    }

    try {
        const distance = Math.sqrt(Math.pow(userLat - placeLat, 2) + Math.pow(userLng - placeLng, 2)) * 111000;
        if (distance <= 100) {
            return { valid: true };
        } else {
            return { error: 'User is too far from the place to check in.' };
        }
    } catch (error) {
        console.error('Error validating check-in:', error);
        return { error: 'Failed to validate check-in due to network or server error.' };
    }
};

module.exports = {
    // getCurrentLocation,
    getNearbyPlaces,
    getRestaurantDetailsFromGoogle,
    getDirections,
    validateCheckIn,
};
