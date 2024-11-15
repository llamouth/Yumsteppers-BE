// steps.js

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
    
    // Ensure non-negative step count
    if (step_count < 0) {
        console.error("Step count cannot be negative.");
        throw new Error("Invalid step count: must be non-negative");
    }

    try {
        const updatedSteps = await db.oneOrNone(
            'UPDATE steps SET step_count = $1, date = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
            [step_count, date, id, user_id]
        );
        return updatedSteps;
    } catch (error) {
        console.error("Error updating step:", error);
        throw new Error("Unable to update step");
    }
};

// Create or Update a step for a user
const createOrUpdateSteps = async (user_id, steps) => {
    const { step_count } = steps;
    const date = steps.date ? new Date(steps.date).toISOString() : new Date().toISOString(); // Ensure ISO format

    if (step_count < 0) {
        console.error("Step count cannot be negative.");
        throw new Error("Invalid step count: must be non-negative");
    }

    try {
        return await db.tx(async t => {
            console.log(`Handling steps for user ${user_id} on date ${date}`);

            const stepDate = new Date(date).toISOString().split('T')[0]; // Extract YYYY-MM-DD

            const existingStep = await t.oneOrNone(
                'SELECT id, step_count FROM steps WHERE user_id = $1 AND date_trunc(\'day\', date) = $2',
                [user_id, stepDate]
            );

            if (existingStep) {
                // Update existing step entry
                const updatedStep = await t.one(
                    'UPDATE steps SET step_count = step_count + $1 WHERE id = $2 RETURNING *',
                    [step_count, existingStep.id]
                );
                console.log(`Updated existing step entry for user ${user_id} on ${stepDate}:`, updatedStep);
                return updatedStep;
            } else {
                // Create a new step entry
                const newSteps = await t.one(
                    'INSERT INTO steps (step_count, user_id, date) VALUES ($1, $2, $3) RETURNING *',
                    [step_count, user_id, date]
                );
                console.log("New Step Created:", newSteps);
                return newSteps;
            }
        });
    } catch (error) {
        console.error("Unable to create or update step:", error.message);
        throw new Error("Unable to create or update step");
    }
};


// Get user step history with daily summary
const getUserStepHistory = async (userId) => {
    try {
        const steps = await db.any(
            `SELECT 
                to_char(date_trunc('day', date), 'YYYY-MM-DD') as date,
                SUM(step_count) as total_steps,
                SUM(points_earned) as total_points
            FROM steps
            WHERE user_id = $1 AND deleted = FALSE
            GROUP BY date_trunc('day', date)
            ORDER BY date_trunc('day', date) DESC`,
            [userId]
        );

        console.log("Fetched Step History with formatted dates:", steps);
        return steps;
    } catch (err) {
        console.error("Error fetching step history:", err);
        throw err;
    }
};

module.exports = { getAllSteps, getSingleStep, deleteSteps, updateSteps, createOrUpdateSteps, getUserStepHistory };
