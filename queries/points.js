// queries/points.js
const { db } = require("../db/dbConfig");

// Function to retrieve user points
const getUserPoints = async (userId) => {
    const result = await db.oneOrNone("SELECT points_earned FROM users WHERE id = $1", [userId]);
    return result ? result.points_earned : null;
};

// Function to update user points
const updateUserPoints = async (userId, pointsToAdd) => {
    return await db.one(
        "UPDATE users SET points_earned = points_earned + $1 WHERE id = $2 RETURNING points_earned",
        [pointsToAdd, userId]
    );
};

module.exports = { getUserPoints, updateUserPoints };
