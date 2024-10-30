const { db } = require('../db/dbConfig');
const { boroughsMap } = require('../utils/geoUtils');

const getAllCheckins = async () => {
  try {
    const allCheckins = await db.any('SELECT * FROM checkins');
    return allCheckins;
  } catch (error) {
    throw new Error('Error fetching all checkins: ' + error.message);
  }
};

const getSingleCheckin = async (id) => {
  try {
    const singleCheckin = await db.oneOrNone('SELECT * FROM checkins WHERE id=$1', [id]);
    return singleCheckin;
  } catch (error) {
    throw new Error('Error fetching checkin: ' + error.message);
  }
};

const createCheckin = async (checkin) => {
  const {
    restaurant_id,
    user_id,
    receipt_image,
    latitude,
    longitude,
    distance_walked,
    completion_reward_points,
  } = checkin;

  try {
    // Validate fields
    if (!restaurant_id || !user_id || !latitude || !longitude) {
      throw new Error('Missing required fields for creating check-in');
    }

    // Insert check-in data
    const newCheckin = await db.one(
      'INSERT INTO checkins (restaurant_id, user_id, receipt_image, latitude, longitude, distance_walked, completion_reward_points) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [
        restaurant_id,
        user_id,
        receipt_image,
        latitude,
        longitude,
        distance_walked,
        completion_reward_points,
      ]
    );
    return newCheckin;
  } catch (error) {
    throw new Error('Error creating checkin: ' + error.message);
  }
};

const getUserCheckinCountForRestaurant = async (userId, restaurantId) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in 'YYYY-MM-DD' format
    const result = await db.one(
      'SELECT COUNT(*) FROM checkins WHERE user_id = $1 AND restaurant_id = $2 AND date::date = $3',
      [userId, restaurantId, today]
    );
    return parseInt(result.count);
  } catch (error) {
    throw new Error('Error getting check-in count: ' + error.message);
  }
};

const deleteCheckin = async (id) => {
  try {
    const removedCheckin = await db.one('DELETE FROM checkins WHERE id=$1 RETURNING *', [id]);
    return removedCheckin;
  } catch (error) {
    throw new Error('Error deleting checkin: ' + error.message);
  }
};

module.exports = {
  getAllCheckins,
  getSingleCheckin,
  createCheckin,
  deleteCheckin,
  getUserCheckinCountForRestaurant,
};
