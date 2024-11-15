const { db } = require("../db/dbConfig");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10; // Default to 10 if not set

// Get all users
const getAllUsers = async () => {
  try {
    const users = await db.any("SELECT * FROM users WHERE deleted = FALSE");
    return users;
  } catch (error) {
    console.error("Error retrieving users:", error);
    throw new Error("Could not retrieve users");
  }
};

// Get one user by ID
const getOneUser = async (id) => {
  try {
    const oneUser = await db.oneOrNone("SELECT * FROM users WHERE id=$1 AND deleted = FALSE", id);
    if (!oneUser) {
      throw new Error("User not found");
    }
    return oneUser;
  } catch (error) {
    console.error("Database error in getOneUser:", error);
    throw new Error("Could not retrieve user");
  }
};

// Create a new user (Sign-Up)
const createUser = async (user) => {
    const {
      username,
      email,
      password, // Receive the plain text password
      latitude = 0.0,
      longitude = 0.0,
      points_earned = 0, // Set the default points to 100 as per your schema
    } = user;
  
    try {
      // Check if the username or email already exists
      const existingUser = await db.oneOrNone(
        "SELECT * FROM users WHERE username=$1 OR email=$2",
        [username, email]
      );
      if (existingUser) {
        throw new Error("Username or email already exists");
      }
  
      if (!password) {
        throw new Error("Password is required");
      }
  
      // Hash the password before saving to the database
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const newUser = await db.one(
        "INSERT INTO users (username, email, password_hash, latitude, longitude, points_earned) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [username, email, hashedPassword, latitude, longitude, points_earned]
      );
      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("User creation failed: " + error.message);
    }
  };
  
  

// Delete a user by ID
const deleteUser = async (userId) => {
  try {
    await db.none("UPDATE users SET deleted = TRUE WHERE id = $1", [userId]);
    return { message: "User marked as deleted successfully." };
  } catch (error) {
    console.error("Error marking user as deleted:", error);
    throw new Error("Could not delete user");
  }
};

// Update an existing user
const updateUser = async (id, newInfo) => {
  try {
      const currentUser = await db.oneOrNone("SELECT * FROM users WHERE id=$1 AND deleted = FALSE", id);
      if (!currentUser) {
          throw new Error("User not found");
      }

      const {
          username = currentUser.username,
          email = currentUser.email,
          password, 
          latitude = currentUser.latitude,
          longitude = currentUser.longitude,
      } = newInfo;

      // Hash the password if provided
      const hashedPassword = password
          ? await bcrypt.hash(password, SALT_ROUNDS)
          : currentUser.password_hash;

      const updatedUserInfo = await db.one(
          "UPDATE users SET username=$1, email=$2, password_hash=$3, latitude=$4, longitude=$5 WHERE id=$6 RETURNING *",
          [
              username,
              email,
              hashedPassword,
              latitude,
              longitude,
              id,
          ]
      );
      return updatedUserInfo;
  } catch (error) {
      console.error("User update failed:", error);
      throw new Error("User update failed");
  }
};


// Log in a user (Authentication)
const loginUser = async (username) => {
  try {
      const loggedInUser = await db.oneOrNone(
          "SELECT id, username, email, password_hash, latitude, longitude, points_earned FROM users WHERE username=$1 AND deleted = FALSE",
          username
      );
      if (!loggedInUser) {
          throw new Error('User not found');
      }
      return loggedInUser;
  } catch (err) {
      console.error("Login failed:", err);
      throw new Error("Login failed");
  }
};



module.exports = {
  getAllUsers,
  getOneUser,
  createUser,
  deleteUser,
  updateUser,
  loginUser,
};
