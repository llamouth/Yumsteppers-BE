const db = require('../db/dbConfig');
const { boroughsMap } = require('../utils/geoUtils')

const getAllRestaurants =  async () => {
    try {
        const allRestaurants = await db.any('SELECT * FROM restaurants')
        return allRestaurants
    } catch (error) {
        return error
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
    const { name, latitude, longitude } = newRestaurant
    const locationCheck = boroughsMap(latitude, longitude)

    if(!locationCheck.valid) {
        return { error: locationCheck.message }
    }

    try {
        const addRestaurant = await db.one(
            "INSERT INTO restaurants (name, latitude, longitude) VALUES($1, $2, $3) RETURNING *",
            [
                name,
                latitude,
                longitude
            ])
        return addRestaurant;
    } catch (err) {
        return err;
    }
}

const updateRestaurantInformation = async (updateRestaurant) => {
    try {
        const updateRestaurantInfo = await db.one(
            "UPDATE restaurants SET name=$1, latitude=$2, longitude=$3 WHERE id=$4 RETURNING *",
            [
                updateRestaurant.name,
                updateRestaurant.latitude,
                updateRestaurant.longitude,
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