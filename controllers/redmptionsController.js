const express = require('express');
const { getAllRedemptions, getSingleRedemption } = require('../queries/redmptions');
const redemptions = express.Router();

redemptions.get('/', async (req, res) => {
    try {
        const allRedemptions = await getAllRedemptions()
        res.status(200).json(allRedemptions)
    } catch (error) {
        res.status(500).json({ error: error});
    }
})

redemptions.get('/:id', async ( req, res ) => {
    try {
        const { id } = req.params
        const singleRedemption = await getSingleRedemption(id)
        res.status(200).json(singleRedemption)
    } catch (error) {
        res.status(500).json({ error: error});
    }
})

module.exports = redemptions