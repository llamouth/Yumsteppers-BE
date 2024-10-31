// queries/steps.js

const { db } = require('../db/dbConfig');

// Get all steps for a user
const getAllSteps = async (user_id) => {
    try {
        const allSteps = await db.any('SELECT * FROM steps WHERE user_id = $1 ORDER BY date DESC', user_id);
        return allSteps;
    } catch (error) {
        console.error("Error fetching all steps:", error);
        throw new Error("Unable to fetch steps");
    }
};

// Get a single step by ID for a user
const getSingleStep = async (user_id, id) => {
    try {
        const oneStep = await db.oneOrNone('SELECT * FROM steps WHERE id = $1 AND user_id = $2', [id, user_id]);
        return oneStep;
    } catch (error) {
        console.error("Error fetching single step:", error);
        throw new Error("Step not found");
    }
};

// Delete a step by ID
const deleteSteps = async (id) => {
    try {
        const deletedSteps = await db.oneOrNone('DELETE FROM steps WHERE id = $1 RETURNING *', [id]);
        return deletedSteps;
    } catch (error) {
        console.error("Error deleting step:", error);
        throw new Error("Unable to delete step");
    }
};

// Update a step by ID for a user
const updateSteps = async (user_id, id, steps) => {
    const { step_count, date } = steps; 
    try {
        const updatedSteps = await db.oneOrNone('UPDATE steps SET step_count = $1, date = $2 WHERE id = $3 AND user_id = $4 RETURNING *', [step_count, date, id, user_id]);
        return updatedSteps;
    } catch (error) {
        console.error("Error updating step:", error);
        throw new Error("Unable to update step");
    }
};

// Create a new step for a user
const createNewSteps = async (user_id, steps) => {
    const { step_count } = steps;  // Make sure points_earned is defined here
    const date = steps.date || new Date().toISOString(); // Set the date if not provided
    const points_earned = Math.floor(step_count / 1000) * 10

    try {
        return await db.tx(async t => {
            const newSteps = await t.one(
            'INSERT INTO steps (step_count, points_earned, user_id, date) VALUES ($1, $2, $3, $4) RETURNING *',
            [step_count, points_earned, user_id, date]
        );
        
        await t.none(
            'UPDATE users SET points_earned = points_earned + $1 WHERE id = $2',
            [points_earned, user_id]
        )

        return newSteps
    })
    } catch (error) {
        throw new Error("Unable to create step: ", error.message);
    }
};


module.exports = { getAllSteps, getSingleStep, deleteSteps, updateSteps, createNewSteps };
