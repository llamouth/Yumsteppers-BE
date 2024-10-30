// queries/userRewards.js
const { db } = require("../db/dbConfig");

// Get all user rewards
const getAllUserRewards = async (user_id) => {
  try {
    const allUserRewards = await db.any(
      "SELECT * FROM user_rewards WHERE user_id=$1",
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
  try {
    // Check if the reward exists
    const rewardExists = await db.oneOrNone("SELECT * FROM rewards WHERE id = $1", [
      rewardId,
    ]);

    if (!rewardExists) {
      throw new Error(`Reward with id ${rewardId} does not exist.`);
    }

    //check if user already had reward
    const userRewardExists = await db.oneOrNone(
        "SELECT * FROM user_rewards WHERE user_id = $1 AND reward_id = $2",
        [userId, rewardId]
    )

    if(userRewardExists) {
        throw new Error(`User already has rewards with id ${rewardId}.`);
    }

    // Proceed to create the user reward
    const newUserReward = await db.one(
      "INSERT INTO user_rewards (user_id, reward_id) VALUES ($1, $2) RETURNING *",
      [userId, rewardId]
    );
    return newUserReward;
  } catch (error) {
    throw new Error("User reward creation failed" + error.message);
  }
};

// Redeem a user reward
const redeemUserReward = async (rewardId, userId) => {
  try {
    // Fetch the user reward and associated reward details
    const reward = await db.one(
      `SELECT ur.*, r.points_required, r.expiration_date, u.points_earned
       FROM user_rewards ur
       JOIN rewards r ON ur.reward_id = r.id
       JOIN users u ON ur.user_id = u.id
       WHERE ur.id = $1 AND ur.user_id = $2`,
      [rewardId, userId]
    );

    if(new Date(reward.expiration_date) < new Date()) {
        throw new Error("Reward has expired or cannot be redeemed");
    }

    if (reward.points_required <= reward.points_earned) {
      const redeemedReward = await db.one(
        "UPDATE user_rewards SET redeemed = TRUE, redeemed_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
        [rewardId]
      );
      // Deduct points after redemption
      await db.none(
        "UPDATE users SET points_earned = points_earned - $1 WHERE id = $2",
        [reward.points_required, userId]
      );
      return redeemedReward;
    } else {
      throw new Error("Not enough points to redeem this reward.");
    }
  } catch (error) {
    throw new Error("Reward redemption failed" + error.message);
  }
};

// Delete a user reward (Remove an earned reward)
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
