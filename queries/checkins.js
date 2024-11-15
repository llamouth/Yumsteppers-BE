// queries/checkins.js

const { db } = require('../db/dbConfig');
const { boroughsMap } = require('../utils/geoUtils');

/**
 * Get all check-ins for a user
 */
const getAllCheckins = async (userId) => {
  try {
    const checkins = await db.any(
      `SELECT c.id, c.created_at, c.points_earned, c.check_in_points, c.multiplier_points, 
              c.latitude, c.longitude, r.name AS restaurant_name, c.processed
       FROM checkins c
       LEFT JOIN restaurants r ON c.restaurant_id = r.id
       WHERE c.user_id = $1 AND c.deleted = FALSE
       ORDER BY c.created_at DESC`,
      [userId]
    );
    console.log("Fetched all check-ins for user:", checkins); // Detailed log
    return checkins;
  } catch (error) {
    console.error("Error fetching user-specific check-ins:", error);
    throw error;
  }
};

/**
 * Get a single check-in by ID
 */
const getSingleCheckin = async (id) => {
  try {
    const singleCheckin = await db.oneOrNone('SELECT * FROM checkins WHERE id=$1 AND deleted=FALSE', [id]);
    console.log("Fetched single check-in:", singleCheckin); // Detailed log
    return singleCheckin;
  } catch (error) {
    console.error("Error fetching checkin by ID:", error);
    throw new Error('Error fetching checkin: ' + error.message);
  }
};

/**
 * Create a new check-in
 */
/**
 * Create a new check-in
 */
const createCheckin = async (checkin) => {
  const { restaurant_id, user_id, receipt_image, latitude, longitude } = checkin;

  if (!restaurant_id || !user_id || !latitude || !longitude) {
    throw new Error("Missing required fields for check-in creation.");
  }

  try {
    const newCheckin = await db.one(
      `INSERT INTO checkins 
        (restaurant_id, user_id, receipt_image, latitude, longitude, deleted, processed) 
       VALUES 
        ($1, $2, $3, $4, $5, FALSE, FALSE) 
       RETURNING id, created_at, points_earned, check_in_points, multiplier_points, restaurant_id`,
      [restaurant_id, user_id, receipt_image, latitude, longitude]
    );

    console.log("Check-in successfully created in DB:", newCheckin);
    return newCheckin;
  } catch (error) {
    console.error("Error creating check-in:", error);
    throw new Error('Error creating checkin: ' + error.message);
  }
};



/**
 * Delete a check-in by ID
 */
const deleteCheckin = async (id) => {
  try {
    const removedCheckin = await db.one('DELETE FROM checkins WHERE id=$1 AND deleted=FALSE RETURNING *', [id]);
    console.log("Deleted check-in:", removedCheckin); // Detailed log
    return removedCheckin;
  } catch (error) {
    console.error("Error deleting checkin:", error);
    throw new Error('Error deleting checkin: ' + error.message);
  }
};

/**
 * Get the number of check-ins a user has made at a specific restaurant today
 */
const getUserCheckinCountForRestaurant = async (userId, restaurantId) => {
  try {
    console.log('Checking daily check-in count for user:', userId, 'at restaurant:', restaurantId);

    const result = await db.one(
      `SELECT COUNT(*) AS count 
       FROM checkins 
       WHERE user_id = $1 AND restaurant_id = $2 
       AND created_at >= CURRENT_DATE 
       AND deleted = FALSE`,
      [userId, restaurantId]
    );

    console.log('Check-in count for today:', result.count); // Log specific count
    return parseInt(result.count, 10);
  } catch (error) {
    console.error('Error getting daily check-in count:', error);
    throw new Error('Error getting check-in count: ' + error.message);
  }
};

/**
 * Get a user's check-in history
 */
/**
 * Get a user's check-in history
 */
const getUserCheckInHistory = async (userId) => {
  try {
    console.log("Fetching check-in history for user:", userId);
    const checkins = await db.any(
      `SELECT 
          c.id, 
          c.created_at AS date, 
          c.multiplier_points AS point_multiplier, 
          c.completion_reward_points, 
          c.check_in_points, 
          c.multiplier_points, 
          c.distance_walked, 
          COALESCE(r.name, 'Unknown Restaurant') AS restaurant_name,
          c.processed
       FROM 
          checkins c
       LEFT JOIN 
          restaurants r ON c.restaurant_id = r.id
       WHERE 
          c.user_id = $1 
          AND c.deleted = FALSE
       ORDER BY 
          c.created_at DESC`,
      [userId]
    );
    console.log("Fetched check-in history data:", checkins);
    return checkins;
  } catch (error) {
    console.error("Error fetching check-in history:", error);
    throw error;
  }
};



/**
 * Process unprocessed check-ins for a user
 */
const processUnprocessedCheckins = async (userId) => {
  try {
    // Fetch unprocessed check-ins
    const unprocessedCheckins = await db.any(
      `SELECT * FROM checkins 
       WHERE user_id = $1 AND processed = FALSE AND deleted = FALSE`,
      [userId]
    );
    console.log(`Found ${unprocessedCheckins.length} unprocessed check-ins for user ${userId}`);
    for (const checkin of unprocessedCheckins) {
      await db.tx(async t => {
        console.log(`Processing check-in ID ${checkin.id} with ${checkin.points_earned} points for user ${userId}`);
        
        await t.none(
          `UPDATE users SET points_earned = points_earned + $1 WHERE id = $2`,
          [checkin.points_earned, userId]
        );
    
        const updatedPoints = await t.oneOrNone(`SELECT points_earned FROM users WHERE id = $1`, [userId]);
        console.log(`Updated points for user ${userId}: ${updatedPoints.points_earned}`);
    
        await t.none(
          `UPDATE checkins SET processed = TRUE WHERE id = $1`,
          [checkin.id]
        );
      });
    }
    
    return { message: 'Unprocessed check-ins have been processed.' };
  } catch (error) {
    console.error("Error processing unprocessed check-ins:", error);
    throw new Error('Error processing check-ins: ' + error.message);
  }
};

module.exports = {
  getAllCheckins,
  getSingleCheckin,
  createCheckin,
  deleteCheckin,
  getUserCheckinCountForRestaurant,
  getUserCheckInHistory,
  processUnprocessedCheckins, // Export the processing function
};
