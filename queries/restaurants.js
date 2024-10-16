const { db } = require('../db/dbConfig');

// Fetch all restaurants
const getAllRestaurants = async () => {
    try {
        return await db.any('SELECT * FROM restaurants');
    } catch (error) {
        throw new Error('Error retrieving all restaurants: ' + error.message);
    }
};

// Fetch one restaurant by ID
const getOneRestaurant = async (id) => {
    try {
        return await db.one("SELECT * FROM restaurants WHERE id = $1", [id]);
    } catch (error) {
        throw new Error(`Error retrieving restaurant with ID ${id}: ` + error.message);
    }
};

// Add a new restaurant
const addRestaurant = async ({ name, latitude, longitude }) => {
    try {
        return await db.one(
            "INSERT INTO restaurants (name, latitude, longitude) VALUES($1, $2, $3) RETURNING *",
            [name, latitude, longitude]
        );
    } catch (error) {
        throw new Error('Error adding restaurant: ' + error.message);
    }
};

// Update restaurant information
const updateRestaurantInformation = async ({ id, name, latitude, longitude, description, cuisine_type, place_id }) => {
    try {
        return await db.one(
            "UPDATE restaurants SET name=$1, latitude=$2, longitude=$3, description=$4, cuisine_type=$5, place_id=$6 WHERE id=$7 RETURNING *",
            [name, latitude, longitude, description, cuisine_type, place_id, id]
        );
    } catch (error) {
        throw new Error('Error updating restaurant information: ' + error.message);
    }
};

// Delete a restaurant by ID
const deleteRestaurant = async (id) => {
    try {
        return await db.one("DELETE FROM restaurants WHERE id = $1 RETURNING *", [id]);
    } catch (error) {
        throw new Error(`Error deleting restaurant with ID ${id}: ` + error.message);
    }
};

module.exports = { 
    getAllRestaurants, 
    getOneRestaurant, 
    addRestaurant, 
    updateRestaurantInformation, 
    deleteRestaurant 
};
