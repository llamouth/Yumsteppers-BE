//Map for only Brooklyn, Queens, Manhattan, and the Bronx

const BOROUGH_BOUNDS = {
    northeast: { lat: 40.917577, lng: -73.700272 },
    southwest: { lat: 40.477399, lng:  -74.259090 }
}

const boroughsMap = (lat, lng) => {
    if (
        lat <= BOROUGH_BOUNDS.northeast.lat && lat >= BOROUGH_BOUNDS.southwest.lng &&
        lng <= BOROUGH_BOUNDS.northeast.lng &&
        lng >= BOROUGH_BOUNDS.southwest.lng
    ) {
        return { valid: true }
        }
        return { valid: false, message: 'Location is out of bounds' }
}

module.exports = { boroughsMap }