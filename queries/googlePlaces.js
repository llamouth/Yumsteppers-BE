const { googleMapsAPIKey } = require ('../db/dbConfig')
const { boroughsMap } = require('../utils/geoUtils')



const getCurrentLocation = async () => {
    const url = `https://www.googleapis.com/geolocation/v1/geolocate?key=${googleMapsAPIKey}`
    const response = await fetch(url, { 
        method: 'POST' 
    })
    const data = await response.json()


    
    const { lat, lng } = data.location
    const boundaryCheck = boroughsMap(lat, lng)

    if(!boundaryCheck.valid) {
        return { error: boundaryCheck.message }
    }
    return { location: data.location}
}

const getNearbyPlaces = async (lat, lng) => {
    const boundaryCheck = boroughsMap(lat, lng)
    const types = ['restaurant', 'cafe', 'bar']
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1500&type=${types}&key=${googleMapsAPIKey}`
    if(!boundaryCheck.valid) {
        return { error: boundaryCheck.message }
    }
    const response = await fetch(url)
    return await response.json()
}

const getDirections = async (originLat, originLng, destLat, destLng) => {
    const originCheck = boroughsMap(originLat, originLng)
    const destinationCheck = boroughsMap(destLat, destLng)
    const origin = `${originLat}, ${originLng}`
    const destination = `${destLat}, ${destLng}`
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=walking&key=${googleMapsAPIKey}`



    if(!originCheck.valid || !destinationCheck.valid) {
        return { error: 'Origin or destination is outside of the allowed boroughs'}
    }

    const response = await fetch(url)
    return await response.json()
}



module.exports = {
    getCurrentLocation,
    getNearbyPlaces, 
    getDirections,
}

