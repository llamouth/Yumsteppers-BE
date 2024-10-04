const express = require('express');
const steps = express.Router({ mergeParams: true });
const {
    getAllSteps,
    getSingleStep,
    deleteSteps,
    updateSteps,
    createNewSteps,
} = require('../queries/steps');

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

steps.post('/', async (req, res) => {
    const { user_id } = req.params;
    try {
        const newStep = await createNewSteps(user_id, req.body);
        res.status(201).json({ message: 'New step has been created.', step: newStep });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error: New step could not be created.' });
    }
});

module.exports = steps;
