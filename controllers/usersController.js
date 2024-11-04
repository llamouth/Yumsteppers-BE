// controllers/usersController.js
const express = require("express");
const users = express.Router();
const jwt = require("jsonwebtoken");
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
const { getUserPoints, updateUserPoints, getPointHistory } = require("../queries/points");


// Middleware for handling steps, rewards, and check-ins
users.use("/:user_id/steps", authenticateToken, stepsController);
users.use("/:user_id/userRewards", authenticateToken, userRewardsController);
users.use("/:user_id/checkins", authenticateToken, checkinsController); // Handle check-ins for a specific user

// GET all users
users.get("/", async (req, res) => {
  try {
    const allUsers = await getAllUsers();
    res.status(200).json(allUsers);
  } catch (error) {
    console.error("Error retrieving all users:", error);
    res.status(500).json({ message: "Database error, no users were retrieved from the database." });
  }
});


users.get('/:user_id/point-history', authenticateToken, async (req, res) => {
  const { user_id } = req.params;

  if (req.user.userId != user_id) {
      return res.status(403).json({ error: 'User ID does not match token.' });
  }

  try {
      const pointHistory = await getPointHistory(user_id);
      res.status(200).json(pointHistory);
  } catch (error) {
      console.error("Error fetching point history:", error);
      res.status(500).json({ error: 'Error fetching point history.' });
  }
});

// GET one user by ID
users.get("/:id", async (req, res) => {
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

users.get("/:user_id/points", authenticateToken, async (req, res) => {
  const { user_id } = req.params;
  try {
      const points = await getUserPoints(user_id);
      res.status(200).json({ points });
  } catch (error) {
      console.error("Error retrieving user points:", error);
      res.status(500).json({ message: "Error retrieving user points" });
  }
});



// PUT: Update user's points (e.g., after check-in or step-based actions)
users.put("/:user_id/points", authenticateToken, async (req, res) => {
  const { user_id } = req.params;
  const { pointsToAdd } = req.body;

  try {
      const updatedPoints = await updateUserPoints(user_id, pointsToAdd);
      res.status(200).json({ message: "Points updated successfully", updatedPoints });
  } catch (error) {
      console.error("Error updating user points:", error);
      res.status(500).json({ message: "Error updating user points" });
  }
});

// POST: Create a new user (Registration)
users.post("/", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const newUser = await createUser({ username, email, password_hash: password });
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      process.env.SECRET,
      { expiresIn: "1h" }
    );
    res.status(201).json({ token, newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "User creation failed: " + error.message });
  }
});

// POST: User login
users.post("/login", async (req, res) => {
  try {
    const userLoggedIn = await loginUser(req.body);
    if (!userLoggedIn) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const token = jwt.sign(
      { userId: userLoggedIn.id, username: userLoggedIn.username },
      process.env.SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ user: userLoggedIn, token });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE a user by ID
users.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await deleteUser(id);
    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Error deleting user." });
  }
});

// PUT: Update a user by ID
users.put("/:id", async (req, res) => {
  const newInfo = req.body;
  const { id } = req.params;
  try {
    const updatedUserInfo = await updateUser(id, newInfo);
    res.status(200).json({ message: "User updated successfully", user: updatedUserInfo });
  } catch (error) {
    res.status(500).json({ error: "Error updating user." });
  }
});

module.exports = users;
