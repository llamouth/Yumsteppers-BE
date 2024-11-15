const express = require("express");
const userRewards = express.Router({ mergeParams: true });
const { authenticateToken } = require("../auth/auth");
const {
  getAllUserRewards,
  createUserReward,
  redeemUserReward,
  deleteUserReward,
} = require("../queries/userRewards");
const QRCode = require("qrcode");

// Utility function for QR code generation
const generateQRCodeUrl = async (data) => {
  try {
    return await QRCode.toDataURL(JSON.stringify(data));
  } catch (error) {
    console.error("QR Code generation error:", error);
    throw new Error("Error generating QR code");
  }
};

// Get all rewards for a user
userRewards.get("/", authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    if (!user_id) {
      return res.status(400).json({ error: "Missing user_id in request." });
    }
    const allRewards = await getAllUserRewards(user_id);
    res.status(200).json(allRewards);
  } catch (error) {
    console.error("Error retrieving all user rewards:", error);
    res.status(500).json({ error: "Could not retrieve user rewards." });
  }
});

// Create a new user reward
userRewards.post("/", authenticateToken, async (req, res) => {
  const { user_id } = req.params;
  const { reward_id } = req.body;

  if (!user_id || !reward_id) {
    return res.status(400).json({ error: "Missing user_id or reward_id in request." });
  }

  try {
    const newUserReward = await createUserReward(user_id, reward_id);
    res.status(201).json(newUserReward);
  } catch (error) {
    console.error("Error creating user reward:", error);
    if (error.message.includes("does not exist")) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "User reward creation failed." });
  }
});

// Redeem a user reward by its unique user_rewards ID
userRewards.put("/:user_reward_id/redeem", authenticateToken, async (req, res) => {
  const { user_reward_id } = req.params;
  const user_id = req.user.id; // Use `req.user.id` set by authenticateToken middleware

  if (!user_reward_id || !user_id) {
      return res.status(400).json({ error: "Missing user_reward_id or user_id in request." });
  }

  console.log("Redeem route accessed for user:", user_id, "with user reward:", user_reward_id);

  try {
      const redeemedReward = await redeemUserReward(user_reward_id, user_id);

      const qr_code_url = await generateQRCodeUrl({
          user_id,
          user_reward_id,
          reward_id: redeemedReward.reward_id,
          restaurant_id: redeemedReward.restaurant_id,
          redeemed_at: new Date(),
      });

      res.status(200).json({ redeemedReward, qr_code_url });
  } catch (error) {
      console.error(`Error redeeming user reward ${user_reward_id} for user ${user_id}:`, error);
      res.status(500).json({ error: `Reward redemption failed: ${error.message}` });
  }
});

  

// Delete a user reward
userRewards.delete("/:reward_id", authenticateToken, async (req, res) => {
  const { reward_id } = req.params;

  if (!reward_id) {
    return res.status(400).json({ error: "Missing reward_id in request." });
  }

  try {
    const deletedReward = await deleteUserReward(reward_id);
    res.status(200).json(deletedReward);
  } catch (error) {
    console.error(`Error deleting user reward ${reward_id}:`, error);
    res.status(500).json({ error: "User reward deletion failed." });
  }
});

module.exports = userRewards;
