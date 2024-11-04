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

const getPointHistory = async (userId) => {
    try {
        // Fetch steps
        const steps = await db.any(
            `SELECT id, step_count, points_earned, date, created_at,
                    'steps' AS source, NULL AS restaurant_name, NULL AS point_multiplier
             FROM steps
             WHERE user_id = $1 AND deleted = FALSE`,
            [userId]
        );

        // Fetch check-ins
        const checkins = await db.any(
            `SELECT c.id, NULL AS step_count, c.completion_reward_points AS points_earned,
                    c.date, c.created_at, 'checkin' AS source, r.name AS restaurant_name,
                    c.point_multiplier
             FROM checkins c
             JOIN restaurants r ON c.restaurant_id = r.id
             WHERE c.user_id = $1 AND c.deleted = FALSE`,
            [userId]
        );

        // Fetch redemptions
        const redemptions = await db.any(
            `SELECT id, NULL AS step_count, rw.points_required AS points_earned,
                    redemption_date AS date, redemption_date AS created_at, 'redemption' AS source,
                    rw.details AS reward_details, NULL AS point_multiplier
             FROM redemptions r
             JOIN rewards rw ON r.reward_id = rw.id
             WHERE r.user_id = $1 AND r.deleted = FALSE`,
            [userId]
        );

        // Combine and sort
        const combinedHistory = [...steps, ...checkins, ...redemptions];
        combinedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

        return combinedHistory;
    } catch (error) {
        console.error("Error fetching point history:", error);
        throw error;
    }
};

module.exports = { getUserPoints, updateUserPoints, getPointHistory };
