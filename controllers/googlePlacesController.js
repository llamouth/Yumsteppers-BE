const express = require('express');
const googlePlaces = express.Router({ mergeParams: true });
const { getRestaurantDetailsFromGoogle, getDirections, validateCheckIn } = require('../queries/googlePlaces');
const { getAllRestaurants, getOneRestaurant } = require('../queries/restaurants');
const { getYelpBusinessDetails } = require('../queries/yelp'); // Import Yelp query
const { mergeRestaurantDetails } = require('../utils/mergeRestaurantDetails');

// Endpoint to get nearby places (from the database)
googlePlaces.get('/nearby', async (req, res) => {
    try {
        const restaurants = await getAllRestaurants();
        if (!restaurants || restaurants.length === 0) {
            return res.status(400).json({ error: 'No restaurants found in the database.' });
        }
        res.status(200).json(restaurants);
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        res.status(500).json({ error: 'Failed to get nearby restaurants.' });
    }
});

// Endpoint to get detailed restaurant information using Google Maps and Yelp
googlePlaces.get('/details/:place_id', async (req, res) => {
    try {
        const { place_id } = req.params;

        // Fetch restaurant information from the database
        let restaurant = await getOneRestaurant(place_id);
        if (!restaurant) {
            return res.status(404).json({ error: `Restaurant ID: ${place_id} does not exist.` });
        }

        let googleDetails = {};
        let yelpDetails = {};

        // Get Google Places details if `place_id` exists in the restaurant data
        if (restaurant.place_id) {
            console.log("Fetching Google details for place_id:", restaurant.place_id);
            googleDetails = await getRestaurantDetailsFromGoogle(restaurant.place_id);
            if (googleDetails.error) {
                console.error(`Error fetching details from Google for place_id ${restaurant.place_id}:`, googleDetails.error);
                googleDetails = {};
            }
        }

        // Get Yelp details based on restaurant name and location
        yelpDetails = await getYelpBusinessDetails(restaurant.name, restaurant.latitude, restaurant.longitude);
        if (yelpDetails.error) {
            console.error(`Error fetching Yelp details for ${restaurant.name}:`, yelpDetails.error);
            yelpDetails = {};
        }

        // Merge all information into a unified structure
        const mergedDetails = mergeRestaurantDetails(restaurant, googleDetails, yelpDetails);

        console.log("Merged Details:", mergedDetails); // Add logging for debugging

        res.status(200).json({ data: mergedDetails });
    } catch (error) {
        console.error('Error fetching restaurant details:', error);
        res.status(500).json({ error: 'Failed to get restaurant details.' });
    }
});

// Endpoint to get directions from user's location to a restaurant (Optional)
googlePlaces.get('/directions', async (req, res) => {
    try {
        const { originLat, originLng, destLat, destLng } = req.query;
        const directions = await getDirections(originLat, originLng, destLat, destLng);
        if (directions.error) {
            return res.status(400).json({ error: directions.error });
        }
        res.status(200).json(directions);
    } catch (error) {
        console.error('Failed to get directions:', error);
        res.status(500).json({ error: 'Failed to get directions' });
    }
});

// Endpoint to validate check-in (Optional)
// googlePlaces.post('/validateCheckIn', async (req, res) => {
//     try {
//         const { userLat, userLng, placeLat, placeLng } = req.body;
//         const checkIn = await validateCheckIn(userLat, userLng, placeLat, placeLng);
//         if (checkIn.error) {
//             return res.status(400).json({ error: checkIn.error });
//         }
//         res.status(200).json(checkIn);
//     } catch (error) {
//         console.error('Failed to validate check-in:', error);
//         res.status(500).json({ error: 'Failed to validate check-in' });
//     }
// });

module.exports = googlePlaces;
