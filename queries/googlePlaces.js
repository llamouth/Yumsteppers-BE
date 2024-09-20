const { googleMapsAPIKey } = require ('../db/dbConfig')

const getCurrentLocation = async () => {
    const url = `https://www.googleapis.com/geolocation/v1/geolocate?key=${googleMapsAPIKey}`
    const response = await fetch(url, { 
        method: 'POST' 
    })
    const data = await response.json()
    return data.location
}

const getNearbyPlaces = async (lat, lng) => {
    const types = ['restaurant', 'cafe', 'bar']
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1500&type=${types}&key=${googleMapsAPIKey}`
    const response = await fetch(url)
    return await response.json()
}

module.exports = {
    getCurrentLocation,
    getNearbyPlaces,
}

