const express = require('express');
const { 
    getAllRedemptions, 
    getSingleRedemption, 
    createRedemption, 
    updateRedemption, 
    deleteRedemption 
} = require('../queries/redemptions');
const redemptions = express.Router();

// GET all redemptions
redemptions.get('/', async (req, res) => {
    try {
        const allRedemptions = await getAllRedemptions();
        res.status(200).json(allRedemptions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET a single redemption by id
redemptions.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const singleRedemption = await getSingleRedemption(id);
        if (singleRedemption) {
            res.status(200).json(singleRedemption);
        } else {
            res.status(404).json({ error: 'Redemption not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE a new redemption
redemptions.post('/', async (req, res) => {
    try {
        const newRedemption = await createRedemption(req.body);
        res.status(201).json(newRedemption);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE a redemption by id
redemptions.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedRedemption = await updateRedemption(id, req.body);
        if (updatedRedemption) {
            res.status(200).json(updatedRedemption);
        } else {
            res.status(404).json({ error: 'Redemption not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE a redemption by id
redemptions.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRedemption = await deleteRedemption(id);
        if (deletedRedemption) {
            res.status(200).json({ message: 'Redemption deleted successfully' });
        } else {
            res.status(404).json({ error: 'Redemption not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = redemptions;