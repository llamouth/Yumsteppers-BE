// routes/users.js

const express = require("express");
const users = express.Router();
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("../auth/auth");
const stepsController = require("./stepsController");
const userRewardsController = require('./userRewardsController')
const {
  getAllUsers,
  getOneUser,
  createUser,
  deleteUser,
  updateUser,
  loginUser,
} = require("../queries/users");

// Middleware for handling steps-related routes
users.use("/:user_id/steps", authenticateToken, stepsController);
users.use("/:user_id/rewards", authenticateToken, userRewardsController);

// Get all users
users.get("/", async (req, res) => {
  try {
    const allUsers = await getAllUsers();
    res.status(200).json(allUsers);
  } catch (error) {
    console.error("Error retrieving all users:", error);
    res.status(500).json({ message: "Database error, no users were retrieved from the database." });
  }
});

// Get one user by ID
users.get("/:id", async (req, res) => {
  const { id } = req.params;
  // console.log("Fetching user with ID:", id);
  try {
    const oneUser = await getOneUser(id);
    if (oneUser) {
      // console.log("User retrieved successfully:", oneUser);
      res.status(200).json(oneUser);
    } else {
      console.error("User not found with ID:", id);
      res.status(404).json({ error: "Stepper Not Found" });
    }
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({ message: "Error retrieving user." });
  }
});


// Create a new user (Registration)
// Check the request body in the signup route
users.post("/", async (req, res) => {
  try {
      const { username, email, password } = req.body;

      // Ensure all required fields are provided
      if (!username || !email || !password) {
          return res.status(400).json({ error: "Username, email, and password are required" });
      }

      // Create user
      const newUser = await createUser({ username, email, password_hash: password });
      
      // Generate token
      const token = jwt.sign(
          { userId: newUser.id, username: newUser.username },
          process.env.SECRET,
          { expiresIn: '1h' }
      );
      
      res.status(201).json({ token, newUser });
  } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "User creation failed: " + error.message });
  }
});


// User login
users.post("/login", async (req, res) => {
  try {
    const userLoggedIn = await loginUser(req.body);
    if (!userLoggedIn) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign(
      { userId: userLoggedIn.id, username: userLoggedIn.username },
      process.env.SECRET,
      { expiresIn: '1h' } // Optional: Set token expiration
    );

    res.status(200).json({
      user: userLoggedIn,
      token,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a user by ID
users.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await deleteUser(id);
    if (deletedUser) {
      res.status(200).json({ message: "Stepper, steps no more." });
    } else {
      res.status(404).json({ error: "Stepper not deleted." });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Error deleting user." });
  }
});

// Update a user by ID
users.put("/:id", async (req, res) => {
  const newInfo = req.body;
  const { id } = req.params;
  try {
    const updatedUserInfo = await updateUser(id, newInfo);
    if (updatedUserInfo) {
      res.status(200).json({
        message: "Stepper updated successfully",
        user: updatedUserInfo,
      });
    } else {
      res.status(404).json({ error: "Stepper cannot be found" });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Error updating user." });
  }
});



module.exports = users;
