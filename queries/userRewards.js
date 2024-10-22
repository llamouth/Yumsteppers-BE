const { db } = require('../db/dbConfig');

// Get all user rewards
const getAllUserRewards = async (user_id) => {
    try {
        const allUserRewards = await db.any("SELECT * FROM user_rewards WHERE user_id=$1", user_id);
        return allUserRewards;
    } catch (error) {
        console.error("Error fetching all user rewards:", error);
        throw new Error("Could not retrieve user rewards");
    }
};



// Create a new user reward (Assign a reward to a user)
const createUserReward = async (userId, rewardId) => {
    try {
        const newUserReward = await db.one(`INSERT INTO user_rewards (user_id, reward_id) VALUES ($1, $2) RETURNING *`, [userId, rewardId]);
        return newUserReward;
    } catch (error) {
        console.error("Error creating user reward:", error);
        throw new Error("User reward creation failed");
    }
};

// Update a user reward (Mark as redeemed)
const redeemUserReward = async (rewardId) => {
    try {
        const redeemedReward = await db.one(`UPDATE user_rewards SET redeemed = TRUE, redeemed_at = CURRENT_TIMESTAMP  WHERE id = $1  RETURNING *`, [rewardId]);
        return redeemedReward;
    } catch (error) {
        console.error(`Error redeeming reward ${rewardId}:`, error);
        throw new Error("Reward redemption failed");
    }
};

// Delete a user reward (Remove an earned reward)
const deleteUserReward = async (rewardId) => {
    try {
        const deletedReward = await db.one(`DELETE FROM user_rewards WHERE id = $1  RETURNING *`, [rewardId]);
        return deletedReward;
    } catch (error) {
        console.error(`Error deleting user reward ${rewardId}:`, error);
        throw new Error("User reward deletion failed");
    }
};

module.exports = {
    getAllUserRewards,
    createUserReward,
    redeemUserReward,
    deleteUserReward,
};
