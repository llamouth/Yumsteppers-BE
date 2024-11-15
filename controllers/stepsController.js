// routes/stepsController.js

const express = require('express');
const steps = express.Router({ mergeParams: true });
const {
    getAllSteps,
    getSingleStep,
    deleteSteps,
    updateSteps,
    createNewSteps,
    getUserStepHistory
} = require('../queries/steps');

// Get all steps for a user
steps.get('/', async (req, res) => {
    const { user_id } = req.params;
    try {
        const allSteps = await getAllSteps(user_id);
        res.status(200).json(allSteps);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error: Steps could not be retrieved.' });
    }
});

steps.get('/history', async (req, res) => {
    console.log("Request received for /history endpoint");
    const { user_id } = req.params;

    if (parseInt(req.user.id, 10) !== parseInt(user_id, 10)) {
        return res.status(403).json({ error: "User ID does not match token." });
    }
  
    try {
        const stepHistory = await getUserStepHistory(user_id);
        if (!stepHistory) {
            console.warn("No step history found for user ID:", user_id);
            return res.status(404).json({ error: 'No step history found.' });
        }
        console.log("Step history fetched:", stepHistory);
        res.status(200).json(stepHistory);
    } catch (error) {
        console.error("Error fetching step history:", error);
        res.status(500).json({ error: 'Error fetching step history.' });
    }
});

  


// Get a single step by ID for a user
steps.get('/:id', async (req, res) => {
    const { user_id, id } = req.params;
    try {
        const singleStep = await getSingleStep(user_id, id);
        if (!singleStep) {
            return res.status(404).json({ error: 'Step not found.' });
        }
        console.log("Fetched single step:", singleStep);
        res.status(200).json(singleStep);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error: Could not retrieve the specific step.' });
    }
});


// Delete a step by ID for a user
steps.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedStep = await deleteSteps(id);
        if (!deletedStep) {
            return res.status(404).json({ error: 'Step not found.' });
        }
        res.status(200).json({ message: 'Step has been deleted.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error: Steps could not be deleted.' });
    }
});

// Update a step by ID for a user
steps.put('/:id', async (req, res) => {
    const { user_id, id } = req.params;
    try {
        const updatedStep = await updateSteps(user_id, id, req.body);
        if (!updatedStep) {
            return res.status(404).json({ error: 'Step not found or could not be updated.' });
        }
        res.status(200).json({ message: 'Step has been updated.', step: updatedStep });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error: Steps could not be updated.' });
    }
});

// Create a new step for a user
steps.post('/', async (req, res) => {
    console.log('req.user:', req.user);
    console.log('req.params:', req.params);
    const user_id = parseInt(req.params.user_id, 10);

    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: No user information found.' });
    }

    // Ensure you have access to `req.user` if needed
    if (req.user.userId != user_id) {
        return res.status(403).json({ error: 'User ID does not match token.' });
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existingEntry = await getAllSteps(user_id); // Fetch all steps for the user
        const todayEntry = existingEntry.find(step => {
            const stepDate = new Date(step.date);
            stepDate.setHours(0, 0, 0, 0);
            return stepDate.getTime() === today.getTime();
        });

        if (todayEntry) {
            return res.status(409).json({ error: 'Step entry already exists for today.' });
        }

        const newStep = await createNewSteps(user_id, req.body);
        console.log("New step created:", newStep);
        res.status(201).json({ message: 'New step has been created.', step: newStep });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error: New step could not be created.' });
    }
});

module.exports = steps;
