const express = require('express');
const googlePlaces = express.Router()
const { getCurrentLocation, getNearbyPlaces, getDirections, getDistance, validateCheckIn } = require('../queries/googlePlaces')


googlePlaces.post('/location', async (req,res) => {
    try {
        const location = await getCurrentLocation()
        res.status(200).json(location)
    } catch (error) {
        res.status(500).json({ error: 'Failed to get location' })
    }
})

googlePlaces.get('/nearby', async (req, res) => {
    const { lat, lng, type } = req.query

    try {
        const places = await getNearbyPlaces(lat, lng, type)
        res.status(200).json(places)
    } catch (error) {
        res.status(500).json({ error: 'Failed to get places near you' })
    }
})

module.exports = googlePlaces