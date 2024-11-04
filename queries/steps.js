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
    const { step_count } = steps;
    const date = steps.date || new Date().toISOString();
    const points_earned = Math.floor(step_count / 1000) * 10;

    try {
        return await db.tx(async t => {
            // Log step points calculated
            console.log(`Calculated Step Points: ${points_earned} for step count: ${step_count}`);

            // Insert steps and update points
            const newSteps = await t.one(
                'INSERT INTO steps (step_count, points_earned, user_id, date) VALUES ($1, $2, $3, $4) RETURNING *',
                [step_count, points_earned, user_id, date]
            );

            await t.none(
                'UPDATE users SET points_earned = points_earned + $1 WHERE id = $2',
                [points_earned, user_id]
            );

            // Log points after updating
            console.log(`User ID ${user_id} total points after update: ${points_earned}`);

            return newSteps;
        });
    } catch (error) {
        console.error("Unable to create step:", error.message);
        throw new Error("Unable to create step");
    }
};

const getUserStepHistory = async (userId) => {
    try {
        const steps = await db.any(
            `SELECT 
                s.id AS step_id, 
                s.step_count, 
                s.points_earned, 
                s.date, 
                s.created_at, 
                'steps' AS source, 
                NULL AS restaurant_name, 
                NULL AS point_multiplier
             FROM steps s
             WHERE s.user_id = $1 AND s.deleted = FALSE

             UNION ALL

             SELECT 
                c.id AS checkin_id, 
                NULL AS step_count, 
                c.completion_reward_points AS points_earned, 
                c.date, 
                c.date AS created_at, 
                'checkin' AS source, 
                r.name AS restaurant_name, 
                c.point_multiplier
             FROM checkins c
             JOIN restaurants r ON c.restaurant_id = r.id
             WHERE c.user_id = $1 AND c.deleted = FALSE

             UNION ALL

             SELECT 
                r.id AS redemption_id, 
                NULL AS step_count, 
                rw.points_required AS points_earned, 
                r.redemption_date AS date, 
                r.redemption_date AS created_at, 
                'redemption' AS source, 
                rw.details AS reward_details, 
                NULL AS point_multiplier
             FROM redemptions r
             JOIN rewards rw ON r.reward_id = rw.id
             WHERE r.user_id = $1 AND r.deleted = FALSE

             ORDER BY date DESC`,
            [userId]
        );
        return steps;
    } catch (err) {
        console.error("Error fetching point history:", err);
        throw err;
    }
};




module.exports = { getAllSteps, getSingleStep, deleteSteps, updateSteps, createNewSteps, getUserStepHistory };
