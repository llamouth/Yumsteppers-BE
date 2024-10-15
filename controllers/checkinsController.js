const express = require('express')
const checkins = express.Router()
const { getAllCheckins, getSingleCheckin, createCheckin, deleteCheckin } = require('../queries/checkins')
const { boroughsMap } = require('../utils/geoUtils')

checkins.get('/', async ( req, res ) => {
    try {
        const allCheckins = await getAllCheckins()
        res.status(200).json(allCheckins)
    } catch (error) {
        res.status(500).json(error)
    }
})

checkins.get('/:id', async (req, res) => {
    const { id } = req.params
    try {
        const singleCheckin = await getSingleCheckin( id )
        res.status(200).json(singleCheckin)
    } catch (error) {
        res.status(500).json(error)
    }
})

checkins.post('/', async (req, res) => {
    const { restaurantLat, restaurantLng, userLat, userLng } = req.body;
    const restaurantValid = boroughsMap(restaurantLat, restaurantLng);
    const userValid = boroughsMap(userLat, userLng);

    if (!restaurantValid.valid || !userValid.valid) {
        return res.status(400).json({ error: 'User or restaurant are outside the allowed boroughs' });
    }

    try {
        const newCheckIn = await createCheckin(req.body);
        if (newCheckIn.error) {
            return res.status(400).json(newCheckIn.error);
        }
        res.status(201).json(newCheckIn);
    } catch (error) {
        console.error("Error creating check-in:", error);
        res.status(500).json({ error: 'An error occurred while creating a check-in.' });
    }
});

checkins.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const removedCheckin = await deleteCheckin(id)
        res.status(200).json({ success: `Successfully deleted checkin` })
    } catch (error) {
        res.status(500).json(error)
    }
})

module.exports = checkins;