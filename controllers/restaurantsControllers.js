const express = require("express");
const restaurants = express.Router();
const { 
    getAllRestaurants, 
    getOneRestaurant, 
    addRestaurant, 
    updateRestaurantInformation,
    deleteRestaurant 
} = require('../queries/restaurants');

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
restaurants.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const oneRestaurant = await getOneRestaurant(id);
        if (oneRestaurant) {
            return res.status(200).json(oneRestaurant);
        }
        res.status(404).json({ error: `Restaurant ID: ${id} does not exist.` });
    } catch (error) {
        handleError(res, error, "Error retrieving the restaurant.");
    }
});

// POST add a new restaurant
restaurants.post("/", async (req, res) => {
    const { body } = req; // Destructure request body
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
    const { newInfo } = req.body;
    const updateRestaurantInfo = await updateRestaurantInformation({id, ...newInfo});
    if(updateRestaurantInfo.id){
        res.status(200).json({message: "Restaurant database has been successfully updated", restaurant:updateRestaurantInfo });
    }else{
        res.status(404).json({ error: `Restaurant ID: ${id} cannot be found.` });
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
