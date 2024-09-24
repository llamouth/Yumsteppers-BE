const express = require('express');
const googlePlaces = express.Router()
const { getCurrentLocation, getNearbyPlaces, getDirections, getDistance, validateCheckIn } = require('../queries/googlePlaces')


googlePlaces.post('/location', async (req,res) => {
    try {
        const location = await getCurrentLocation()
        if (location.error) {
            return res.status(400).json({ error: location.error })
        }
        res.status(200).json(location)
    } catch (error) {
        res.status(500).json({ error: 'Failed to get location' })
    }
})

googlePlaces.get('/nearby', async (req, res) => {
    try {
        const { lat, lng } = req.query
        const places = await getNearbyPlaces(lat, lng)
        if(places.error) {
            return res.status(400).json({ error: places.error })
        }
        res.status(200).json(places)
    } catch (error) {
        res.status(500).json({ error: 'Failed to get places near you' })
    }
})

googlePlaces.get('/direction', async (req, res) => {
    try {
        const {originLat, originLng, destLat, destLng } = req.query
        const directions = await getDirections(originLat, originLng, destLat, destLng)
        if(directions.error) {
            res.status(400).json({ error: directions.error })
        }
        res.status(200).json(directions)
    } catch (error) {
        res.status(500).json( {error: 'Failed to get directions' })
    }
})

module.exports = googlePlaces