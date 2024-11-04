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
    const { user_id } = req.params;

    try {
        const stepHistory = await getUserStepHistory(user_id);
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
    const { user_id } = req.params;
  
    // Ensure you have access to `req.user` if needed
    if (req.user.userId != user_id) {
      return res.status(403).json({ error: 'User ID does not match token.' });
    }
  
    try {
      const newStep = await createNewSteps(user_id, req.body);
      res.status(201).json({ message: 'New step has been created.', step: newStep });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error: New step could not be created.' });
    }
});

module.exports = steps;
