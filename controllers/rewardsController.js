const express = require('express');
const { 
    getAllRewards, 
    getSingleReward, 
    createReward, 
    deleteReward, 
    updateReward 
} = require('../queries/rewards');
const { rewardSchema } = require('../validations/rewardValidation');
const rewards = express.Router();

// GET all rewards
rewards.get('/', async (req, res) => {
    try {
        const allRewards = await getAllRewards();
        res.status(200).json(allRewards);
    } catch (error) {
        console.error("Error fetching rewards:", error);
        res.status(500).json({ error: "Error fetching rewards" });
    }
});

// GET a single reward by ID
rewards.get('/:id', async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: "Reward ID is required" });
    }
    try {
        const singleReward = await getSingleReward(id);
        if (!singleReward) {
            return res.status(404).json({ error: "Reward not found" });
        }
        res.status(200).json(singleReward);
    } catch (error) {
        console.error("Error fetching reward:", error);
        res.status(500).json({ error: "Error fetching reward" });
    }
});

// POST a new reward
rewards.post('/', async (req, res) => {
    const { error } = rewardSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    try {
        const newReward = await createReward(req.body);
        if (!newReward) {
            return res.status(500).json({ error: "Failed to create reward" });
        }
        res.status(201).json(newReward);
    } catch (error) {
        console.error("Error creating reward:", error);
        res.status(500).json({ error: "Error creating reward" });
    }
});

// DELETE a reward by ID
rewards.delete('/:id', async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: "Reward ID is required" });
    }
    try {
        const existingReward = await getSingleReward(id); // Add check here
        if (!existingReward) {
            return res.status(404).json({ error: "Reward not found" });
        }
        
        const removedReward = await deleteReward(id);
        res.status(200).json({ message: "Reward deleted successfully", removedReward });
    } catch (error) {
        console.error("Error deleting reward:", error);
        res.status(500).json({ error: "Error deleting reward" });
    }
});


// PUT (Update) a reward by ID
rewards.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = rewardSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    try {
        const updatedReward = await updateReward(id, req.body);
        if (!updatedReward) {
            return res.status(404).json({ error: "Reward not found" });
        }
        res.status(200).json(updatedReward);
    } catch (error) {
        console.error("Error updating reward:", error);
        res.status(500).json({ error: "Error updating reward" });
    }
});

module.exports = rewards;
