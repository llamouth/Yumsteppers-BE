const { db } = require('../db/dbConfig');

const getAllSteps = async (user_id) => {
    try {
        const allSteps = await db.any('SELECT * FROM steps WHERE user_id = $1', user_id);
        return allSteps;
    } catch (error) {
        console.error("Error fetching all steps:", error);
        throw new Error("Unable to fetch steps");
    }
};

const getSingleStep = async (user_id, id) => {
    try {
        const oneStep = await db.one('SELECT * FROM steps WHERE id = $1 AND user_id = $2', [id, user_id]);
        return oneStep;
    } catch (error) {
        console.error("Error fetching single step:", error);
        throw new Error("Step not found");
    }
};

const deleteSteps = async (id) => {
    try {
        const deletedSteps = await db.one('DELETE FROM steps WHERE id = $1 RETURNING *', [id]);
        return deletedSteps;
    } catch (error) {
        console.error("Error deleting step:", error);
        throw new Error("Unable to delete step");
    }
};

const updateSteps = async (user_id, id, steps) => {
    const { step_count, date } = steps; 
    try {
        const updatedSteps = await db.one('UPDATE steps SET step_count = $1, date = $2 WHERE id = $3 AND user_id = $4 RETURNING *', [step_count, date, id, user_id]);
        return updatedSteps;
    } catch (error) {
        console.error("Error updating step:", error);
        throw new Error("Unable to update step");
    }
};

const createNewSteps = async (user_id, steps) => {
    const { step_count } = steps;
    try {
        const newSteps = await db.one('INSERT INTO steps (step_count, user_id) VALUES ($1, $2) RETURNING *', [step_count, user_id]);
        return newSteps;
    } catch (error) {
        console.error("Error creating new step:", error);
        throw new Error("Unable to create step");
    }
};

module.exports = { getAllSteps, getSingleStep, deleteSteps, updateSteps, createNewSteps };
