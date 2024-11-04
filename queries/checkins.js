// queries/checkins.js

const { db } = require('../db/dbConfig');
const { boroughsMap } = require('../utils/geoUtils');

// Function to get all check-ins
const getAllCheckins = async () => {
  try {
    const allCheckins = await db.any('SELECT * FROM checkins');
    return allCheckins;
  } catch (error) {
    throw new Error('Error fetching all checkins: ' + error.message);
  }
};

// Function to get a single check-in by ID
const getSingleCheckin = async (id) => {
  try {
    const singleCheckin = await db.oneOrNone('SELECT * FROM checkins WHERE id=$1', [id]);
    return singleCheckin;
  } catch (error) {
    throw new Error('Error fetching checkin: ' + error.message);
  }
};

// Function to create a new check-in
const createCheckin = async (checkin) => {
  const {
    restaurant_id,
    user_id,
    receipt_image,
    latitude,
    longitude,
  } = checkin;

  try {
    // Validate fields
    if (!restaurant_id || !user_id || !latitude || !longitude) {
      throw new Error('Missing required fields for creating check-in');
    }

    // Insert check-in data; the trigger will handle point calculations
    const newCheckin = await db.one(
      'INSERT INTO checkins (restaurant_id, user_id, receipt_image, latitude, longitude) VALUES($1, $2, $3, $4, $5) RETURNING *',
      [
        restaurant_id,
        user_id,
        receipt_image,
        latitude,
        longitude,
      ]
    );
    return newCheckin;
  } catch (error) {
    throw new Error('Error creating checkin: ' + error.message);
  }
};

// Function to delete a check-in by ID
const deleteCheckin = async (id) => {
  try {
    const removedCheckin = await db.one('DELETE FROM checkins WHERE id=$1 RETURNING *', [id]);
    return removedCheckin;
  } catch (error) {
    throw new Error('Error deleting checkin: ' + error.message);
  }
};

// Function to get the number of check-ins a user has made at a specific restaurant today
const getUserCheckinCountForRestaurant = async (userId, restaurantId) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in 'YYYY-MM-DD' format
    const result = await db.one(
      'SELECT COUNT(*) FROM checkins WHERE user_id = $1 AND restaurant_id = $2 AND date::date = $3',
      [userId, restaurantId, today]
    );
    return parseInt(result.count, 10);
  } catch (error) {
    throw new Error('Error getting check-in count: ' + error.message);
  }
};

// Function to get a user's check-in history
const getUserCheckInHistory = async (userId) => {
  try {
    const checkins = await db.any(
      `SELECT c.id, c.date, c.point_multiplier, c.completion_reward_points, c.check_in_points, c.multiplier_points,
              c.distance_walked, r.name AS restaurant_name
       FROM checkins c
       JOIN restaurants r ON c.restaurant_id = r.id
       WHERE c.user_id = $1 AND c.deleted = FALSE
       ORDER BY c.date DESC`,
      [userId]
    );
    return checkins;
  } catch (error) {
    console.error("Error fetching check-in history:", error);
    throw error;
  }
};

module.exports = {
  getAllCheckins,
  getSingleCheckin,
  createCheckin,
  deleteCheckin,
  getUserCheckinCountForRestaurant,
  getUserCheckInHistory,
};
