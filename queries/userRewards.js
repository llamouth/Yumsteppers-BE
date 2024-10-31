const { db } = require("../db/dbConfig");

// Get all user rewards
const getAllUserRewards = async (user_id) => {
    try {
        const allUserRewards = await db.any(
            `SELECT ur.*, r.details, r.expiration_date, r.points_required, rest.name AS restaurant_name
             FROM user_rewards ur
             JOIN rewards r ON ur.reward_id = r.id
             JOIN restaurants rest ON r.restaurant_id = rest.id
             WHERE ur.user_id = $1`,
            user_id
        );
        return allUserRewards;
    } catch (error) {
        console.error("Error fetching all user rewards:", error);
        throw new Error("Could not retrieve user rewards");
    }
};

// Create a new user reward (Assign a reward to a user)
const createUserReward = async (userId, rewardId) => {
    // Check if rewardId and userId are provided
    if (!rewardId || !userId) {
        console.warn(`Missing parameters: reward_id (${rewardId}), user_id (${userId})`);
        throw new Error("Missing reward_id or user_id in request.");
    }

    try {
        // Check if the reward assignment already exists
        const existingReward = await db.oneOrNone(
            "SELECT * FROM user_rewards WHERE user_id = $1 AND reward_id = $2",
            [userId, rewardId]
        );

        if (existingReward) {
            console.warn(`Reward ${rewardId} already assigned to user ${userId}.`);
            return existingReward; // Return existing entry without creating a duplicate
        }

        // Check if reward exists in rewards table
        const reward = await db.oneOrNone("SELECT * FROM rewards WHERE id = $1", [rewardId]);
        if (!reward) {
            throw new Error(`Reward with id ${rewardId} does not exist.`);
        }

        // Create new user reward
        const newUserReward = await db.one(
            `INSERT INTO user_rewards (user_id, reward_id, details, expiration_date, points_required)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [userId, rewardId, reward.details, reward.expiration_date, reward.points_required]
        );
        return newUserReward;
    } catch (error) {
        console.error("Error in creating user reward:", error);
        throw new Error("User reward creation failed.");
    }
};



// Redeem a user reward
const redeemUserReward = async (rewardId, userId) => {
    try {
        // Check monthly redemption count for the user and reward
        const monthlyRedemptionCount = await db.oneOrNone(
            `SELECT COUNT(*) AS count FROM redemptions 
             WHERE user_id = $1 AND reward_id = $2 
             AND redemption_date >= date_trunc('month', CURRENT_DATE)`,
            [userId, rewardId]
        );

        if (monthlyRedemptionCount.count >= 3) {
            throw new Error("Monthly redemption limit reached for this reward.");
        }

        // Proceed with redemption checks
        const reward = await db.oneOrNone(
            `SELECT ur.*, r.points_required, r.expiration_date, u.points_earned
             FROM user_rewards ur
             JOIN rewards r ON ur.reward_id = r.id
             JOIN users u ON ur.user_id = u.id
             WHERE ur.reward_id = $1 AND ur.user_id = $2`,
            [rewardId, userId]
        );

        if (!reward) throw new Error("Reward not found or already redeemed.");
        if (new Date(reward.expiration_date) < new Date()) throw new Error("Reward has expired.");
        if (reward.points_required > reward.points_earned) throw new Error("Insufficient points.");

        // Redeem the reward
        const redeemedReward = await db.one(
            `UPDATE user_rewards SET redeemed = TRUE, redeemed_at = CURRENT_TIMESTAMP 
             WHERE reward_id = $1 AND user_id = $2 RETURNING *`,
            [rewardId, userId]
        );

        // Deduct points
        await db.none(`UPDATE users SET points_earned = points_earned - $1 WHERE id = $2`, 
            [reward.points_required, userId]
        );

        // Log redemption
        await db.none(`INSERT INTO redemptions (user_id, reward_id) VALUES ($1, $2)`, 
            [userId, rewardId]
        );

        return redeemedReward;
    } catch (error) {
        console.error(`Error redeeming reward ${rewardId} for user ${userId}:`, error);
        throw new Error(`Reward redemption failed: ${error.message}`);
    }
};




const deleteUserReward = async (rewardId) => {
    try {
      const deletedReward = await db.one(
        `DELETE FROM user_rewards WHERE id = $1 RETURNING *`,
        [rewardId]
      );
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




