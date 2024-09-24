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

googlePlaces.get('/distance', async (req, res) => {
    try {
        const { originLat, originLng, destLat, destLng } = req.query
        const distance = await getDistance(originLat, originLng, destLat, destLng)
        if(distance.error) {
            return res.status(400).json({ error: distance.error})
        }
        res.status(200).json(distance)
    } catch (error) {
        res.status(500).json({ error: 'Failed to get distance' })
    }
})

googlePlaces.get('/directions', async (req, res) => {
    try {
        const { originLat, originLng, destLat, destLng } = req.query
        const directions = await getDirections(originLat, originLng, destLat, destLng)
        if(directions.error) {
            res.status(400).json({ error: directions.error })
        }
        res.status(200).json(directions)
    } catch (error) {
        res.status(500).json( {error: 'Failed to get directions' })
    }
})

googlePlaces.post('/validateCheckIn', async (req, res) => {
    try {
        const { userLat, userLng, placeLat, placeLng } = req.query
        const checkIn = await validateCheckIn(userLat, userLng, placeLat, placeLng)
        if(checkIn.error) {
            return res.status(400).json({ error: checkIn.error })
        }
        res.status(200).json(checkIn)
    } catch (error) {
        res.status(500).json({ error:'Check-in failed'})
    }
})


module.exports = googlePlaces