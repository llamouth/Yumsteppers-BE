// Dependencies and imports
const express = require("express");
const users = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require('dotenv').config();
const { authenticateToken } = require("../auth/auth");
const stepsController = require("./stepsController");
const userRewardsController = require("./userRewardsController");
const checkinsController = require("./checkinsController");
const {
  getAllUsers,
  getOneUser,
  createUser,
  deleteUser,
  updateUser,
  loginUser,
} = require("../queries/users");
const { getUserPoints, getPointHistory } = require("../queries/points");

// JWT Generation Function
const secret = process.env.SECRET;
const generateToken = (user) => {
  const payload = {
    id: user.id, // Use 'id' consistently
    username: user.username,
  };
  return jwt.sign(payload, secret, { expiresIn: "1h" });
};

// Middleware for handling steps, rewards, and check-ins
users.use("/:user_id/steps", authenticateToken, stepsController);
users.use("/:user_id/userRewards", authenticateToken, userRewardsController);
users.use("/:user_id/checkins", authenticateToken, checkinsController);

// --- Route Definitions Start Here ---

// 1. GET point history (Most Specific)
users.get("/:user_id/point-history", authenticateToken, async (req, res) => {
  const { user_id } = req.params;

  // Parse user IDs as integers
  const parsedUserId = parseInt(user_id, 10);
  const parsedTokenUserId = parseInt(req.user.id, 10);

  // Validate parsed user IDs
  if (isNaN(parsedUserId) || isNaN(parsedTokenUserId)) {
    console.warn(`Invalid user_id or token user ID. user_id: ${user_id}, token user ID: ${req.user.id}`);
    return res.status(400).json({ error: "Invalid user ID format." });
  }

  // Check if the user ID from the token matches the requested user ID
  if (parsedTokenUserId !== parsedUserId) {
    console.warn(`User ID mismatch. Token user ID: ${parsedTokenUserId}, Requested user ID: ${parsedUserId}`);
    return res.status(403).json({ error: "User ID does not match token." });
  }

  try {
    const pointHistory = await getPointHistory(parsedUserId);

    // Validate that pointHistory is an array
    if (!Array.isArray(pointHistory)) {
      console.error(`Invalid point history format for user ID: ${parsedUserId}`);
      return res.status(500).json({ error: "Invalid point history data format." });
    }

    console.log(`Fetched and sanitized point history for user ID ${parsedUserId}:`, pointHistory);

    res.status(200).json(pointHistory);
  } catch (error) {
    console.error("Error fetching point history:", error);
    res.status(500).json({ error: "Error fetching point history." });
  }
});

// 2. GET user points
users.get("/:user_id/points", authenticateToken, async (req, res) => {
  const { user_id } = req.params;
  try {
    const points = await getUserPoints(user_id);
    res.status(200).json({ points: Number(points) || 0 }); // Ensure it's a number
  } catch (error) {
    console.error("Error retrieving user points:", error);
    res.status(500).json({ message: "Error retrieving user points" });
  }
});


// 4. GET one user by ID (Less Specific)
users.get("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const oneUser = await getOneUser(id);
    if (!oneUser) {
      return res.status(404).json({ error: "User Not Found" });
    }
    res.status(200).json(oneUser);
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({ message: "Error retrieving user." });
  }
});

// 5. GET all users (Most General)
users.get("/", async (req, res) => {
  try {
    const allUsers = await getAllUsers();
    res.status(200).json(allUsers);
  } catch (error) {
    console.error("Error retrieving all users:", error);
    res.status(500).json({ message: "Database error, no users were retrieved from the database." });
  }
});

// 6. POST: Create a new user (Sign-Up)
users.post("/", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Validate input
    if (!username || !email || !password) {
      console.warn("User creation failed: Missing required fields.");
      return res.status(400).json({ error: "Username, email, and password are required." });
    }

    // Create new user
    const newUser = await createUser({ username, email, password });

    // Generate token for new user
    const token = generateToken(newUser);

    // Respond with new user details and token
    res.status(201).json({ token, user: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "User creation failed: " + error.message });
  }
});

// 7. POST: User login
users.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Log received request details
    console.log("Login attempt for username:", username);

    // Validate input
    if (!username || !password) {
      console.warn("Login failed: Username or password missing.");
      return res.status(400).json({ error: "Username and password are required." });
    }

    // Get user from the database
    const userLoggedIn = await loginUser(username);
    if (!userLoggedIn) {
      console.warn("Login failed. User not found for username:", username);
      return res.status(401).json({ error: "Invalid username or password." });
    }

    // Log the hashed password
    console.log("Hashed password fetched from database:", userLoggedIn.password_hash);

    // Compare provided password with hashed password in database
    const isPasswordValid = await bcrypt.compare(password, userLoggedIn.password_hash);
    if (!isPasswordValid) {
      console.warn("Login failed. Incorrect password for username:", username);
      return res.status(401).json({ error: "Invalid username or password." });
    }

    // Generate JWT token
    const token = generateToken(userLoggedIn);

    // Log successful login and response
    console.log("Login successful for user ID:", userLoggedIn.id);
    console.log("Sending response with token and user:", { user: userLoggedIn, token });
    res.status(200).json({ user: userLoggedIn, token });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 8. DELETE a user by ID
users.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await deleteUser(id);
    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Error deleting user." });
  }
});

// 9. PUT: Update a user by ID
users.put("/:id", authenticateToken, async (req, res) => {
  const newInfo = req.body;
  const { id } = req.params;
  try {
    // Validate input (optional but recommended)
    if (!newInfo || typeof newInfo !== 'object') {
      console.warn("User update failed: Invalid input data.");
      return res.status(400).json({ error: "Invalid input data." });
    }

    const updatedUserInfo = await updateUser(id, newInfo);
    res.status(200).json({ message: "User updated successfully", user: updatedUserInfo });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Error updating user." });
  }
});

module.exports = users;
