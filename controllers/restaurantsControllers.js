const express = require("express");
const restaurants = express.Router();
const googlePlacesController = require('./googlePlacesController'); // Import the Google Places controller
const {
    getAllRestaurants,
    getOneRestaurant,
    addRestaurant,
    updateRestaurantInformation,
    deleteRestaurant
} = require('../queries/restaurants');
const { getRestaurantDetailsFromGoogle } = require('../queries/googlePlaces'); // Import Google Places query
const { getYelpBusinessDetails } = require('../queries/yelp'); // Import Yelp query
const { mergeRestaurantDetails } = require('../utils/mergeRestaurantDetails');


// Merge Google Places controller under specific restaurant routes
restaurants.use("/:restaurant_id/googlePlaces", googlePlacesController);

// Centralized error handling function
const handleError = (res, error, message = "An error occurred") => {
    console.error(error);
    res.status(500).json({ message });
};

// GET all restaurants
restaurants.get("/", async (req, res) => {
    try {
        const allRestaurants = await getAllRestaurants();
        res.status(200).json(allRestaurants);
    } catch (error) {
        handleError(res, error, "Database error, no restaurants were retrieved from the database.");
    }
});

// GET one restaurant by ID

restaurants.get('/details/:id', async (req, res) => {
    const { id } = req.params;

    try {
        let restaurant = await getOneRestaurant(id);
        if (!restaurant) {
            return res.status(404).json({ error: `Restaurant ID: ${id} does not exist.` });
        }

        let googleDetails = {};
        let yelpDetails = {};

        // Get Google Places details if `place_id` exists in the restaurant data
        if (restaurant.place_id) {
            console.log("Fetching Google details for place_id:", restaurant.place_id);
            googleDetails = await getRestaurantDetailsFromGoogle(restaurant.place_id);
            if (googleDetails.error) {
                console.error(`Error fetching Google details for ${restaurant.place_id}:`, googleDetails.error);
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

        res.status(200).json({ data: mergedDetails });
    } catch (error) {
        console.error('Error fetching restaurant details:', error);
        res.status(500).json({ error: 'Failed to get restaurant details.' });
    }
});


   

// POST add a new restaurant
restaurants.post("/", async (req, res) => {
    const { body } = req;
    try {
        const addNewRestaurant = await addRestaurant(body);
        res.status(201).json({
            message: "New restaurant has been added to the list of available restaurants",
            restaurant: addNewRestaurant,
        });
    } catch (error) {
        handleError(res, error, "Failed to add restaurant.");
    }
});

// PUT update restaurant information
restaurants.put("/:id", async (req, res) => {
    const { id } = req.params;
    
    try {
        const updateRestaurantInfo = await updateRestaurantInformation({ id, ...req.body });
        if (updateRestaurantInfo.id) {
            res.status(200).json({ message: "Restaurant database has been successfully updated", restaurant: updateRestaurantInfo });
        } else {
            res.status(404).json({ error: `Restaurant ID: ${id} cannot be found.` });
        }
    } catch (error) {
        handleError(res, error, "Error updating restaurant.");
    }
});

// DELETE a restaurant by ID
restaurants.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const deletedRestaurant = await deleteRestaurant(id);
        if (deletedRestaurant) {
            return res.status(200).json({ message: `The restaurant called "${deletedRestaurant.name}" has been removed.` });
        }
        res.status(404).json({ error: `Restaurant ID: ${id} cannot be found.` });
    } catch (error) {
        handleError(res, error, "Error deleting the restaurant.");
    }
});

module.exports = restaurants;
