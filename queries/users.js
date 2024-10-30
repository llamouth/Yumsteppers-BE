// queries/users.js
const { db } = require("../db/dbConfig");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10; // Default to 10 if not set

// Get all users
const getAllUsers = async () => {
  try {
    const allUsers = await db.any("SELECT * FROM users");
    return allUsers;
  } catch (error) {
    console.error(error);
    throw new Error("Could not retrieve users");
  }
};

// Get one user by ID
const getOneUser = async (id) => {
  try {
    const oneUser = await db.oneOrNone("SELECT * FROM users WHERE id=$1", id);
    if (!oneUser) {
      console.error("User not found with ID:", id);
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
    password_hash,
    latitude = 0.0,
    longitude = 0.0,
    points_earned = 0,
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

    if (!password_hash) {
      throw new Error("Password is required");
    }

    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(password_hash, SALT_ROUNDS);
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
const deleteUser = async (id) => {
  try {
    const deletedUserInfo = await db.one(
      "DELETE FROM users WHERE id=$1 RETURNING *",
      id
    );
    return deletedUserInfo;
  } catch (error) {
    console.error(error);
    throw new Error("User deletion failed");
  }
};

// Update an existing user
// Update an existing user
const updateUser = async (id, newInfo) => {
    try {
      const currentUser = await db.oneOrNone("SELECT * FROM users WHERE id=$1", id);
      if (!currentUser) {
        throw new Error("User not found");
      }
  
      const {
        username = currentUser.username,
        email = currentUser.email,
        password_hash,
        latitude = currentUser.latitude,
        longitude = currentUser.longitude,
        points_earned = currentUser.points_earned,
        lastCheckInDate = currentUser.lastcheckindate,
        checkInCount = currentUser.checkincount, // Added checkInCount
      } = newInfo;
  
      const hashedPassword = password_hash
        ? await bcrypt.hash(password_hash, SALT_ROUNDS)
        : currentUser.password_hash;
  
      const updatedUserInfo = await db.one(
        "UPDATE users SET username=$1, email=$2, password_hash=$3, latitude=$4, longitude=$5, points_earned=$6, lastCheckInDate=$7, checkInCount=$8 WHERE id=$9 RETURNING *",
        [
          username,
          email,
          hashedPassword,
          latitude,
          longitude,
          points_earned,
          lastCheckInDate,
          checkInCount, // Include checkInCount
          id,
        ]
      );
      return updatedUserInfo;
    } catch (error) {
      console.error(error);
      throw new Error("User update failed");
    }
  };
  


// Log in a user (Authentication)
const loginUser = async (user) => {
  const { username, password } = user; // 'password' is the plain text password provided by the user

  try {
    const loggedInUser = await db.oneOrNone(
      "SELECT * FROM users WHERE username=$1",
      username
    );
    if (!loggedInUser) {
      console.error("User not found:", username);
      return false; // User not found
    }

    // Compare the provided plain text password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, loggedInUser.password_hash);
    if (!passwordMatch) {
      console.error("Password mismatch for user:", username);
      return false; // Password doesn't match
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
