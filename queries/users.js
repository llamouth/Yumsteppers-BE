const { db } = require('../db/dbConfig');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10; // Default to 10 if not set

const getAllUsers = async () => {
    try {
        const allUsers = await db.any("SELECT * FROM users");
        return allUsers;
    } catch (error) {
        console.error(error); // Log the error
        throw new Error("Could not retrieve users");
    }
};

const getOneUser = async (id) => {
    try {
        const oneUser = await db.oneOrNone("SELECT * FROM users WHERE id=$1", id);
        if (!oneUser) {
            throw new Error("User not found");
        }
        return oneUser;
    } catch (error) {
        console.error(error);
        throw new Error("Could not retrieve user");
    }
};

const createUser = async (user) => {
    const { username, email, password_hash, latitude, longitude, points_earned } = user;

    try {
        const hashedPassword = await bcrypt.hash(password_hash, SALT_ROUNDS);
        const newUser = await db.one(
            "INSERT INTO users (username, email, password_hash, latitude, longitude, points_earned) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", 
            [username, email, hashedPassword, latitude, longitude, points_earned]
        );
        return newUser;
    } catch (error) {
        console.error(error);
        throw new Error("User creation failed");
    }
};

const deleteUser = async (id) => {
    try {
        const deletedUserInfo = await db.one("DELETE FROM users WHERE id=$1 RETURNING *", id);
        return deletedUserInfo;
    } catch (error) {
        console.error(error);
        throw new Error("User deletion failed");
    }
};

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

const loginUser = async (user) => {
    const { username, password_hash } = user;

    try {
        const loggedInUser = await db.oneOrNone("SELECT * FROM users WHERE username=$1", username);
        if (!loggedInUser) {
            return false; // User not found
        }

        const passwordMatch = await bcrypt.compare(password_hash, loggedInUser.password_hash);
        return passwordMatch ? loggedInUser : false; // Return false if password doesn't match
    } catch (err) {
        console.error(err);
        throw new Error("Login failed");
    }
};

module.exports = { getAllUsers, getOneUser, createUser, deleteUser, updateUser, loginUser };
