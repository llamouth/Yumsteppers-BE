const { db } = require('../db/dbConfig');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10; // Default to 10 if not set

// Get all users
const getAllUsers = async () => {
    try {
        const allUsers = await db.any("SELECT * FROM users");
        return allUsers;
    } catch (error) {
        console.error(error); // Log the error
        throw new Error("Could not retrieve users");
    }
};

// Get one user by ID
const getOneUser = async (id) => {
    try {
        const oneUser = await db.oneOrNone("SELECT * FROM users WHERE id=$1", id);
        if (!oneUser) {
            console.error("User not found with ID:", id); // Log when user is not found
            throw new Error("User not found");
        }
        return oneUser;
    } catch (error) {
        console.error("Database error in getOneUser:", error); // Log full error
        throw new Error("Could not retrieve user");
    }
};

// Create a new user (Sign-Up)
// queries/users.js

const createUser = async (user) => {
    const { username, email, password, latitude = 0.0, longitude = 0.0, points_earned = 0 } = user;

    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const newUser = await db.one(
            "INSERT INTO users (username, email, password_hash, latitude, longitude, points_earned) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", 
            [username, email, hashedPassword, latitude, longitude, points_earned]
        );
        return newUser;
    } catch (error) {
        console.error("Error creating user:", error);
        throw new Error("User creation failed");
    }
};



// Delete a user by ID
const deleteUser = async (id) => {
    try {
        const deletedUserInfo = await db.one("DELETE FROM users WHERE id=$1 RETURNING *", id);
        return deletedUserInfo;
    } catch (error) {
        console.error(error);
        throw new Error("User deletion failed");
    }
};

// Update an existing user
const updateUser = async (id, newInfo) => {
    try {
        const currentUser = await db.oneOrNone("SELECT * FROM users WHERE id=$1", id);
        if (!currentUser) {
            throw new Error("User not found");
        }

        const { username, email, password_hash, latitude, longitude, points_earned } = newInfo;
        const hashedPassword = password_hash ? await bcrypt.hash(password_hash, SALT_ROUNDS) : currentUser.password_hash;

        const updatedUserInfo = await db.one(
            "UPDATE users SET username=$1, email=$2, password_hash=$3, latitude=$4, longitude=$5, points_earned=$6 WHERE id=$7 RETURNING *",
            [username, email, hashedPassword, latitude, longitude, points_earned, id]
        );
        return updatedUserInfo;
    } catch (error) {
        console.error(error);
        throw new Error("User update failed");
    }
};

// Log in a user (Authentication)
const loginUser = async (user) => {
    const { username, password } = user;

    try {
        console.log('Attempting to log in user:', username);
        const loggedInUser = await db.oneOrNone("SELECT * FROM users WHERE username=$1", username);
        if (!loggedInUser) {
            console.error('User not found:', username);
            return false; // User not found
        }

        // Compare the provided password with the hashed password stored in the database
        const passwordMatch = await bcrypt.compare(password, loggedInUser.password_hash);
        if (!passwordMatch) {
            console.error('Password mismatch for user:', username);
            return false; // Password doesn't match
        }

        console.log('User authenticated successfully:', username);
        return loggedInUser;
    } catch (err) {
        console.error('Login failed:', err);
        throw new Error("Login failed");
    }
};

module.exports = { getAllUsers, getOneUser, createUser, deleteUser, updateUser, loginUser };
