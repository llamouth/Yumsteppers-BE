const {db} = require('../db/dbConfig');

const getAllRestaurants =  async () => {
    try {
        const allRestaurants = await db.any('SELECT * FROM restaurants')
        return allRestaurants
    } catch (error) {
        throw new Error("Unable to fetch restaurants");
    }
}

const getOneRestaurant = async (id) => {
    try {
        const oneRestaurant = await db.one("SELECT * FROM restaurants WHERE id=$1", id);
        return oneRestaurant;

    } catch (error) {
        return error
    }
}; 

const addRestaurant = async (newRestaurant) => {
    try {
        const addRestaurant = await db.one(
            "INSERT INTO restaurants (name, latitude, longitude, description, cuisine_type) VALUES($1, $2, $3, $4, $5) RETURNING *",
            [
                newRestaurant.name,
                newRestaurant.latitude,
                newRestaurant.longitude,
                newRestaurant.description,
                newRestaurant.cuisine_type
            ])
        return addRestaurant;
    } catch (err) {
        console.log(err);
        return err;
    }
}

const updateRestaurantInformation = async (updateRestaurant) => {
    try {
        const updateRestaurantInfo = await db.one(
            "UPDATE restaurants SET name=$1, latitude=$2, longitude=$3, description=$4, cuisine_type=$5 WHERE id=$6 RETURNING *",
            [
                updateRestaurant.name,
                updateRestaurant.latitude,
                updateRestaurant.longitude,
                updateRestaurant.description,
                updateRestaurant.cuisine_type,
                updateRestaurant.id
            ]
        );
        return updateRestaurantInfo;
    } catch (err) {
        return err;
    }
};

const deleteRestaurant = async (id) => {
    try{
        const deletedRestaurant = await db.one("DELETE FROM restaurants WHERE id=$1 RETURNING *", id);
        return deletedRestaurant;

    } catch (error){
        return error;
    }
};

module.exports = { 
    getAllRestaurants, 
    getOneRestaurant, 
    addRestaurant, 
    updateRestaurantInformation, 
    deleteRestaurant }