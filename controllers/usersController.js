const express = require("express");
const users = express.Router();
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("../auth/auth");
const {
  getAllUsers,
  getOneUser,
  createUser,
  deleteUser,
  updateUser,
  loginUser,
} = require("../queries/users");

// Middleware for steps
users.use("/:user_id/steps", authenticateToken, require("./stepsController"));

// Get all users
users.get("/", async (req, res) => {
  try {
    const allUsers = await getAllUsers();
    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({ message: "Database error, no users were retrieved from the database." });
  }
});

// Get one user
users.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const oneUser = await getOneUser(id);
    if (oneUser) {
      res.status(200).json(oneUser);
    } else {
      res.status(404).json({ error: "Stepper Not Found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving user." });
  }
});

// Create a new user
users.post("/", async (req, res) => {
  try {
    const newUser = await createUser(req.body);
    const token = jwt.sign(
      { userId: newUser.userId?.id, username: newUser.userId?.username },
      process.env.SECRET
    );
    res.status(201).json({ newUser, token });
  } catch (error) {
    res.status(500).json({ error: "User could not be created" });
  }
});

// Delete a user
users.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await deleteUser(id);
    if (deletedUser) {
      res.status(200).json({ message: "Stepper, steps no more." });
    } else {
      res.status(404).json({ error: "Stepper not deleted." });
    }
  } catch (error) {
    res.status(500).json({ error: "Error deleting user." });
  }
});

// Update a user
users.put("/:id", authenticateToken, async (req, res) => {
  const newInfo = req.body;
  const { id } = req.params;
  try {
    const updatedUserInfo = await updateUser(id, newInfo);
    if (updatedUserInfo) {
      res.status(200).json({ message: "Stepper updated successfully", user: updatedUserInfo });
    } else {
      res.status(404).json({ error: "Stepper can not be found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error updating user." });
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
      { userId: userLoggedIn.user_id, username: userLoggedIn.username },
      process.env.SECRET
    );

    res.status(200).json({
      user: userLoggedIn,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = users;
