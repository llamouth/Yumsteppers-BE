// points.js

const { db } = require("../db/dbConfig");

// Function to retrieve user points
const getUserPoints = async (userId) => {
    try {
        const result = await db.oneOrNone("SELECT points_earned FROM users WHERE id = $1", [userId]);
        console.log("User points retrieved from DB for user", userId, ":", result ? result.points_earned : "No points found");
        return result ? Number(result.points_earned) || 0 : 0;
    } catch (error) {
        console.error("Error fetching user points:", error);
        throw error;
    }
};

const getPointHistory = async (userId) => {
    try {
        console.log(`Fetching point history for user ID: ${userId}`);

        // Fetch steps
        const steps = await db.any(
            `SELECT id, step_count, points_earned, created_at,
                    'steps' AS source, NULL AS restaurant_name, NULL AS point_multiplier
             FROM steps
             WHERE user_id = $1 AND deleted = FALSE`,
            [userId]
        );
        console.log(`Fetched steps:`, steps);

        // Fetch check-ins
        const checkins = await db.any(
            `SELECT c.id, NULL AS step_count, c.points_earned, c.created_at, 
                    'checkin' AS source, r.name AS restaurant_name,
                    c.multiplier_points AS point_multiplier
             FROM checkins c
             LEFT JOIN restaurants r ON c.restaurant_id = r.id
             WHERE c.user_id = $1 AND c.deleted = FALSE`,
            [userId]
        );
        console.log(`Fetched check-ins:`, checkins);

        // Combine and sort
        const combined = [...steps, ...checkins].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        console.log(`Combined point history:`, combined);

        // Sanitize and format for frontend
        combined.forEach(entry => {
            entry.step_count = Number(entry.step_count) || 0;
            entry.points_earned = Number(entry.points_earned) || 0;
            entry.point_multiplier = Number(entry.point_multiplier) || 0;

            // Rename 'created_at' to 'date' for frontend consistency
            entry.date = entry.created_at;
            delete entry.created_at; // Remove 'created_at' if not needed
        });
        console.log(`Sanitized point history:`, combined);

        return combined;
    } catch (error) {
        console.error("Error fetching point history from DB:", error);
        throw error;
    }
};


module.exports = {
  getUserPoints,
  getPointHistory,
};
