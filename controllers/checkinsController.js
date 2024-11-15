// checkins.js

const express = require('express');
const checkins = express.Router({ mergeParams: true });
const {
  getAllCheckins,
  getSingleCheckin,
  createCheckin,
  deleteCheckin,
  getUserCheckinCountForRestaurant,
  getUserCheckInHistory,
  processUnprocessedCheckins, // Import the processing function
} = require('../queries/checkins');
const { boroughsMap } = require('../utils/geoUtils');
const { authenticateToken } = require("../auth/auth");

// Authenticate all check-in routes
checkins.use(authenticateToken);

/**
 * GET all check-ins for the authenticated user
 */
checkins.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`Fetching all check-ins for user: ${userId}`);
    const allCheckins = await getAllCheckins(userId);
    res.status(200).json(allCheckins);
  } catch (error) {
    console.error("Error retrieving all check-ins:", error);
    res.status(500).json({ error: "Failed to retrieve all check-ins for user." });
  }
});

/**
 * GET check-in history for the authenticated user
 */
checkins.get('/history', async (req, res) => {
  const userId = req.user.id;

  try {
    const checkInHistory = await getUserCheckInHistory(userId);
    res.status(200).json(checkInHistory);
  } catch (err) {
    console.error("Error fetching check-in history for user:", userId, err);
    res.status(500).json({ error: "Error retrieving check-in history." });
  }
});

/**
 * GET a single check-in by ID
 */
checkins.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`Fetching check-in with ID: ${id}`);
    const singleCheckin = await getSingleCheckin(id);
    if (!singleCheckin) {
      return res.status(404).json({ error: "Check-in not found." });
    }
    res.status(200).json(singleCheckin);
  } catch (error) {
    console.error("Error retrieving check-in:", error);
    res.status(500).json({ error: "Failed to retrieve check-in by ID." });
  }
});


// POST: Create a new check-in
checkins.post('/', async (req, res) => {
  const userId = req.user.id;
  let { restaurant_id, latitude, longitude, receipt_image } = req.body;

  // Validate restaurant_id
  if (!Number.isInteger(restaurant_id)) {
    console.error("Invalid restaurant ID:", restaurant_id);
    return res.status(400).json({ error: "Invalid restaurant ID provided." });
  }

  // Convert latitude and longitude to numbers if they are strings
  latitude = parseFloat(latitude);
  longitude = parseFloat(longitude);

  // Validate coordinates
  if (isNaN(latitude) || isNaN(longitude)) {
    console.error("Invalid latitude or longitude:", { latitude, longitude });
    return res.status(400).json({ error: "Invalid latitude or longitude values provided." });
  }

  // Validate location using boroughsMap
  const { valid, message } = boroughsMap(latitude, longitude);
  if (!valid) {
    return res.status(400).json({ error: message });
  }

  try {
    // Check today's check-ins at the restaurant
    const checkinCount = await getUserCheckinCountForRestaurant(userId, restaurant_id);
    if (checkinCount >= 2) {
      return res.status(409).json({
        message: 'Daily check-in limit reached for this restaurant.',
        canCheckIn: false,
      });
    }

    // Proceed to create check-in
    const newCheckin = await createCheckin({
      restaurant_id,
      user_id: userId,
      receipt_image,
      latitude,
      longitude,
    });

    // Do NOT assign points here to prevent duplication
    res.status(201).json({
      message: 'Check-in successful. Points will be assigned shortly.',
      canCheckIn: true,
      checkinId: newCheckin.id, // Optionally return the check-in ID
    });
  } catch (error) {
    console.error("Error creating check-in for user:", userId, "at restaurant:", restaurant_id, error);
    res.status(500).json({ error: 'An error occurred while creating a check-in.' });
  }
});


/**
 * DELETE a check-in by ID
 */
checkins.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const removedCheckin = await deleteCheckin(id);
    if (!removedCheckin) {
      return res.status(404).json({ error: 'Check-in not found.' });
    }
    res.status(200).json({ message: "Check-in deleted successfully." });
  } catch (error) {
    console.error("Error deleting check-in with ID:", id, error);
    res.status(500).json({ error: "An error occurred while deleting the check-in." });
  }
});

/**
 * POST /process
 * Endpoint to process unprocessed check-ins for the authenticated user
 */
checkins.post('/process', async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await processUnprocessedCheckins(userId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error processing unprocessed check-ins:", error);
    res.status(500).json({ error: "Failed to process unprocessed check-ins." });
  }
});

module.exports = checkins;
