
const express = require("express");
const userRewards = express.Router({ mergeParams: true }); 
const {
  getAllUserRewards,
  createUserReward,
  redeemUserReward,
  deleteUserReward
} = require("../queries/userRewards");


userRewards.get("/", async (req, res) => {
    try {
        const { user_id } = req.params;
        const allRewards = await getAllUserRewards(user_id);
        res.status(200).json(allRewards);
    } catch (error) {
        console.error("Error retrieving all user rewards:", error);
        res.status(500).json({ error: "Could not retrieve user rewards." });
    }
});


userRewards.post("/", async (req, res) => {
    const { user_id } = req.params; 
    const { reward_id } = req.body; body

    try {
        const newUserReward = await createUserReward(user_id, reward_id);
        res.status(201).json(newUserReward);
    } catch (error) {
        console.error("Error creating user reward:", error);
        res.status(500).json({ error: "User reward creation failed." });
    }
});


userRewards.put("/:reward_id/redeem", async (req, res) => {
    const { reward_id } = req.params;

    try {
        const redeemedReward = await redeemUserReward(reward_id);
        res.status(200).json(redeemedReward);
    } catch (error) {
        console.error(`Error redeeming reward ${reward_id}:`, error);
        res.status(500).json({ error: "Reward redemption failed." });
    }
});


userRewards.delete("/:reward_id", async (req, res) => {
    const { reward_id } = req.params;

    try {
        const deletedReward = await deleteUserReward(reward_id);
        res.status(200).json(deletedReward);
    } catch (error) {
        console.error(`Error deleting user reward ${reward_id}:`, error);
        res.status(500).json({ error: "User reward deletion failed." });
    }
});

module.exports = userRewards;