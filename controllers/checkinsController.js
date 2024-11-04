// controllers/checkinsController.js

const express = require('express');
const checkins = express.Router({ mergeParams: true });
const {
  getAllCheckins,
  getSingleCheckin,
  createCheckin,
  deleteCheckin,
  getUserCheckinCountForRestaurant,
  getUserCheckInHistory
} = require('../queries/checkins');
const { boroughsMap } = require('../utils/geoUtils');
const { authenticateToken } = require("../auth/auth");

// Authenticate all check-in routes
checkins.use(authenticateToken);

// GET all check-ins
checkins.get('/', async (req, res) => {
  try {
    const allCheckins = await getAllCheckins();
    if (allCheckins.length === 0) {
      return res.status(200).json([]); // Respond with an empty array
    }
    res.status(200).json(allCheckins);
  } catch (error) {
    console.error("Error retrieving all check-ins:", error);
    res.status(500).json({ error: "An error occurred while retrieving all check-ins." });
  }
});

// GET user's check-in history
checkins.get('/history', async (req, res) => {
  const userId = req.user.userId; // Retrieve userId from authenticated user

  try {
    const checkInHistory = await getUserCheckInHistory(userId);
    res.status(200).json(checkInHistory);
  } catch (err) {
    console.error("Error fetching check-in history:", err); // Corrected variable name
    res.status(500).json({ error: 'Error fetching check-in history.' });
  }
});

// GET a single check-in by ID
checkins.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const singleCheckin = await getSingleCheckin(id);
    if (!singleCheckin) {
      return res.status(404).json({ error: "Check-in not found." });
    }
    res.status(200).json(singleCheckin);
  } catch (error) {
    console.error("Error retrieving check-in:", error);
    res.status(500).json({ error: "An error occurred while retrieving the check-in." });
  }
});

// POST: Create a new check-in
checkins.post('/', async (req, res) => {
  const { userId } = req.user; // Get userId from authenticated user
  let { restaurant_id, latitude, longitude, receipt_image } = req.body;

  // Log incoming request data
  console.log("Incoming check-in request:", req.body);

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

  // Validate locations using boroughsMap
  const { valid, message } = boroughsMap(latitude, longitude);
  if (!valid) {
    console.error("Location validation failed:", message);
    return res.status(400).json({ error: message });
  }

  try {
    // Check the number of check-ins today
    const checkinCount = await getUserCheckinCountForRestaurant(userId, restaurant_id);
    if (checkinCount >= 2) {
      console.warn(`Check-in limit reached for user ${userId} at restaurant ${restaurant_id}`);
      return res.status(200).json({
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

    const {
      completion_reward_points,
      check_in_points,
      multiplier_points,
    } = newCheckin;

    res.status(201).json({
      message: 'Check-in successful',
      canCheckIn: true,
      totalPoints: completion_reward_points,      // Renamed from pointsEarned to totalPoints
      check_in_points: check_in_points,          // Snake_case to match frontend expectations
      multiplier_points: multiplier_points,      // Snake_case to match frontend expectations
    });
  } catch (error) {
    console.error("Error creating check-in:", error);
    res.status(500).json({ error: 'An error occurred while creating a check-in.' });
  }
});

// DELETE a check-in by ID
checkins.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const removedCheckin = await deleteCheckin(id);
    if (!removedCheckin) {
      return res.status(404).json({ error: 'Check-in not found.' });
    }
    res.status(200).json({ message: "Check-in deleted successfully." });
  } catch (error) {
    console.error("Error deleting check-in:", error);
    res.status(500).json({ error: "An error occurred while deleting the check-in." });
  }
});

module.exports = checkins; // Correctly export the router only
